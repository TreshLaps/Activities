using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Activities.Strava.Authentication;
using Activities.Strava.Endpoints;
using Activities.Strava.Endpoints.Models;
using Activities.Strava.Syncing.Models;

namespace Activities.Strava.Syncing
{
    public class ActivitiesSyncService
    {
        private static readonly ConcurrentDictionary<long, BatchJob> SyncJobs = new();

        private static long timeSlot;
        private static int _processedCount;
        private static readonly int _maxCount = 500;
        private readonly ActivitiesClient _activitiesClient;
        private readonly StravaOAuthService _stravaOAuthService;

        public ActivitiesSyncService(
            ActivitiesClient activitiesClient,
            StravaOAuthService stravaOAuthService)
        {
            _activitiesClient = activitiesClient;
            _stravaOAuthService = stravaOAuthService;
        }

        public async Task<double> GetProgress(OAuthToken token, long athleteId)
        {
            var activities = await _activitiesClient.GetActivities(token.AccessToken, athleteId);
            IReadOnlyList<SummaryActivity> activitiesToSync = null;

            if (!SyncJobs.ContainsKey(athleteId))
            {
                activitiesToSync = ActivitiesToSync(activities);

                if (activitiesToSync.Count < 10)
                {
                    return 1.0;
                }
            }

            var job = SyncJobs.GetOrAdd(
                athleteId,
                key => new BatchJob
                {
                    Created = DateTime.UtcNow,
                    StravaToken = token,
                    AthleteId = key,
                    Progress = 0.0,
                    Activities = activitiesToSync
                });

            return job.Progress;
        }

        private IReadOnlyList<SummaryActivity> ActivitiesToSync(IReadOnlyList<SummaryActivity> activities)
        {
            return activities.Where(
                    activity =>
                        activity.StartDate > DateTime.Today.AddYears(-3) &&
                        !_activitiesClient.HasActivity(activity.Id)
                )
                .ToList();
        }

        public async Task ProcessJobs(CancellationToken cancellationToken)
        {
            while (true)
            {
                if (SyncJobs.Count > 0)
                {
                    var currentJob = SyncJobs.OrderBy(job => job.Value.Created).First().Value;
                    await ProcessJob(currentJob, cancellationToken);
                    SyncJobs.TryRemove(currentJob.AthleteId, out _);
                }

                await Task.Delay(1000, cancellationToken);
            }
        }

        private async Task ProcessJob(BatchJob job, CancellationToken cancellationToken)
        {
            var processed = 0;

            for (var i = 0; i < job.Activities.Count; i++)
            {
                var activity = job.Activities[i];

                try
                {
                    job.StravaToken = await _stravaOAuthService.GetOrRefreshToken(job.StravaToken);
                    await _activitiesClient.GetActivity(job.StravaToken.AccessToken, 0, activity.Id, true);
                }
                catch (RequestFailedException requestFailedException)
                {
                    if (requestFailedException.StatusCode is HttpStatusCode.TooManyRequests
                        or HttpStatusCode.ServiceUnavailable)
                    {
                        await Task.Delay(30000, cancellationToken);
                        i--;
                        continue;
                    }

                    // Something failed. Abort
                    return;
                }
                catch
                {
                    await Task.Delay(60000, cancellationToken);
                }

                processed++;
                job.Progress = 1.0 / job.Activities.Count * processed;

                if (cancellationToken.IsCancellationRequested)
                {
                    break;
                }

                await Task.Delay(GetProcessDelay(), cancellationToken);
            }
        }

        private int GetProcessDelay()
        {
            var currentTimeSlot = (int) Math.Ceiling((DateTime.UtcNow.Minute + 1) / 15.0);

            if (timeSlot != currentTimeSlot)
            {
                timeSlot = currentTimeSlot;
                _processedCount = 0;
            }

            _processedCount++;

            if (_processedCount >= _maxCount)
            {
                var minutesToNextSlot = currentTimeSlot * 15 - DateTime.UtcNow.Minute;
                return minutesToNextSlot * 60 * 1000;
            }

            return 0;
        }
    }
}