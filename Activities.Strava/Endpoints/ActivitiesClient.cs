using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Activities.Core.Caching;
using Activities.Strava.Activities;
using Activities.Strava.Endpoints.Models;

namespace Activities.Strava.Endpoints
{
    public class ActivitiesClient : BaseStravaClient
    {
        private static readonly ConcurrentDictionary<string, SemaphoreSlim> AsyncLocks = new();
        private readonly MemoryCacheService _memoryCacheService;
        private readonly IPermanentStorageService _permanentStorageService;

        public ActivitiesClient(
            IHttpClientFactory httpClientFactory,
            MemoryCacheService memoryCacheService,
            IPermanentStorageService permanentStorageService) : base(
            httpClientFactory)
        {
            _memoryCacheService = memoryCacheService;
            _permanentStorageService = permanentStorageService;
        }

        public async Task<DetailedActivity> GetActivity(
            string accessToken,
            long athleteId,
            long id,
            bool throwExceptions = false)
        {
            // Ensures only one request is made at a time for the same activity
            var semaphoreSlim = AsyncLocks.GetOrAdd(id.ToString(), new SemaphoreSlim(1, 1));
            await semaphoreSlim.WaitAsync();

            try
            {
                var activity = await _memoryCacheService.GetOrAdd(
                    $"DetailedActivity:{id}",
                    TimeSpan.FromDays(3),
                    () => _GetActivity(accessToken, athleteId, id));


                return StripPrivateData(activity, athleteId);
            }
            catch
            {
                if (throwExceptions)
                {
                    throw;
                }
            }
            finally
            {
                semaphoreSlim.Release();
            }

            return null;
        }

        private async Task<DetailedActivity> _GetActivity(
            string accessToken,
            long athleteId,
            long id)
        {
            var activity = await _permanentStorageService.GetOrAdd(
                $"DetailedActivity:{id}",
                () => Get<DetailedActivity>(accessToken, $"https://www.strava.com/api/v3/activities/{id}"));

            return ProcessActivity(activity);
        }

        public static DetailedActivity ProcessActivity(DetailedActivity activity)
        {
            activity = activity.ResetOldValues();
            activity = activity.TryMergeAutoLaps();
            activity = activity.TryTagIntervalLaps();
            activity = activity.TryParseLactateMeasurements();
            activity = activity.TryParseFeelingParameter();
            activity = activity.TryAdjustBislettLaps();
            return activity;
        }

        private DetailedActivity StripPrivateData(DetailedActivity activity, long athleteId)
        {
            if (activity.Athlete.Id == athleteId || athleteId == 0)
            {
                return activity;
            }

            if (activity.Private || activity.Visibility != "everyone")
            {
                throw new InvalidOperationException("Activity is private");
            }

            activity = activity with
            {
                PrivateNote = string.Empty
            };

            if (activity.HeartrateOptOut)
            {
                activity = activity with
                {
                    AverageHeartrate = 0,
                    MaxHeartrate = 0,
                    Laps = activity.Laps?.Select(lap => lap with
                    {
                        AverageHeartrate = 0,
                        MaxHeartrate = 0
                    }).ToList()
                };
            }

            return activity;
        }

        public async Task ToggleIgnoreIntervals(long id)
        {
            var activity = await _permanentStorageService.GetOrAdd<DetailedActivity>(
                $"DetailedActivity:{id}",
                () => throw new InvalidOperationException());

            activity = activity with {IgnoreIntervals = !activity.IgnoreIntervals};
            await _permanentStorageService.AddOrUpdate($"DetailedActivity:{id}", TimeSpan.MaxValue, activity);
            _memoryCacheService.Remove($"DetailedActivity:{id}");
        }

        public void RemoveActivity(long id)
        {
            _permanentStorageService.Remove($"DetailedActivity:{id}");
            _memoryCacheService.Remove($"DetailedActivity:{id}");
        }

        public bool HasActivity(long id)
        {
            return _permanentStorageService.ContainsKey($"DetailedActivity:{id}");
        }

        /// <summary>
        ///     Returns all activities for the logged in user
        /// </summary>
        /// <param name="accessToken">Strava access token</param>
        /// <param name="athleteId">Strava athlete Id</param>
        public Task<IReadOnlyList<SummaryActivity>> GetActivities(string accessToken, long athleteId)
        {
            return _memoryCacheService.GetOrAdd(
                $"GetActivities:{athleteId}",
                TimeSpan.FromMinutes(10),
                () => _GetActivities(accessToken, athleteId));
        }

        private async Task<IReadOnlyList<SummaryActivity>> _GetActivities(string accessToken, long athleteId)
        {
            var activitiesCache = await _permanentStorageService.Get<ActivitiesCache>($"ActivitiesCache:{athleteId}");

            if (activitiesCache == null)
            {
                activitiesCache = new ActivitiesCache
                {
                    Activities = new List<SummaryActivity>(),
                    LastSyncDate = DateTimeOffset.UtcNow.AddYears(-10)
                };
            }

            var result = new List<SummaryActivity>();
            IReadOnlyList<SummaryActivity> activities;
            var page = 1;

            do
            {
                activities = await Get<IReadOnlyList<SummaryActivity>>(
                    accessToken,
                    $"https://www.strava.com/api/v3/athlete/activities?page={page}&per_page=200&after={activitiesCache.LastSyncDate.ToUnixTimeSeconds()}");

                result.AddRange(activities);
                page++;
            } while (activities.Any());

            activitiesCache.Activities.RemoveAll(activity => result.Any(a => a.Id == activity.Id));
            activitiesCache.Activities.AddRange(result);

            activitiesCache.Activities =
                activitiesCache.Activities.OrderByDescending(activity => activity.StartDate).ToList();

            activitiesCache.LastSyncDate = DateTimeOffset.UtcNow.AddMonths(-1);
            await _permanentStorageService.AddOrUpdate($"ActivitiesCache:{athleteId}", TimeSpan.MaxValue,
                activitiesCache);

            return activitiesCache.Activities.Where(IsValidActivityType).ToList();
        }

        private bool IsValidActivityType(SummaryActivity activity)
        {
            switch (activity.Type)
            {
                case "Run":
                case "Ride":
                case "VirtualRide":
                case "Swim":
                case "NordicSki":
                case "Rowing":
                    return true;
                default:
                    return false;
            }
        }
    }

    public class ActivitiesCache
    {
        public DateTimeOffset LastSyncDate { get; set; }
        public List<SummaryActivity> Activities { get; set; }
    }
}