using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Activities.Strava.Endpoints;
using Activities.Strava.Endpoints.Models;
using Activities.Strava.Syncing.Models;

namespace Activities.Strava.Syncing
{
    public class ActivitiesSyncService
    {
        private readonly ActivitiesClient _activitiesClient;
        private static readonly ConcurrentDictionary<long, BatchJob> SyncJobs = new();

        public ActivitiesSyncService(ActivitiesClient activitiesClient)
        {
            _activitiesClient = activitiesClient;
        }

        public async Task<double> GetProgress(string accessToken, long athleteId)
        {
            var activities = await _activitiesClient.GetActivities(accessToken, athleteId);
            IReadOnlyList<SummaryActivity> activitiesToSync = null;

            if (!SyncJobs.ContainsKey(athleteId))
            {
                activitiesToSync = ActivitiesToSync(activities);

                if (activitiesToSync.Count == 0)
                {
                    return 1.0;
                }
            }

            var job = SyncJobs.GetOrAdd(
                athleteId,
                (key) => new BatchJob
                {
                    AccessToken = accessToken,
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
                    var currentJob = SyncJobs.OrderBy(job => job.Value.Activities.Count).First().Value;
                    await ProcessJob(currentJob, cancellationToken);
                    SyncJobs.TryRemove(currentJob.AthleteId, out _);
                }

                await Task.Delay(1000, cancellationToken);
            }
        }

        private async Task ProcessJob(BatchJob job, CancellationToken cancellationToken)
        {
            var processed = 0;

            foreach (var activity in job.Activities)
            {
                try
                {
                    await _activitiesClient.GetActivity(job.AccessToken, activity.Id);
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

        private static long timeSlot;
        private static int _processedCount;
        private static int _maxCount = 500;
    }
}