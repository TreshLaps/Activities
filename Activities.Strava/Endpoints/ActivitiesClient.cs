using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Activities.Core.Caching;
using Activities.Strava.Endpoints.Models;

namespace Activities.Strava.Endpoints
{
    public class ActivitiesClient : BaseStravaClient
    {
        private readonly ICachingService _cachingService;
        private readonly IPermanentStorageService _permanentStorageService;

        public ActivitiesClient(IHttpClientFactory httpClientFactory, ICachingService cachingService, IPermanentStorageService permanentStorageService) : base(httpClientFactory)
        {
            _cachingService = cachingService;
            _permanentStorageService = permanentStorageService;
        }

        /// <summary>
        /// Returns a specific activity
        /// </summary>
        /// <param name="accessToken">Strava access token</param>
        /// <param name="id">Activity Id</param>
        public Task<DetailedActivity> GetActivity(string accessToken, long id)
        {
            return _cachingService.GetOrAdd(
                $"DetailedActivity:{id}",
                TimeSpan.MaxValue,
                () => Get<DetailedActivity>(accessToken, $"https://www.strava.com/api/v3/activities/{id}"));
        }

        /// <summary>
        /// Returns all activities for the logged in user
        /// </summary>
        /// <param name="accessToken">Strava access token</param>
        /// <param name="athleteId">Strava athlete Id</param>
        public Task<IReadOnlyList<SummaryActivity>> GetActivities(string accessToken, long athleteId)
        {
            return _cachingService.GetOrAdd(
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
                activities = await Get<IReadOnlyList<SummaryActivity>>(accessToken, $"https://www.strava.com/api/v3/athlete/activities?page={page}&per_page=200&after={activitiesCache.LastSyncDate.ToUnixTimeSeconds()}");
                result.AddRange(activities);
                page++;
                
            } while (activities.Any());

            foreach (var activity in result)
            {
                if (activitiesCache.Activities.Any(a => a.Id == activity.Id))
                {
                    continue;
                }
                
                activitiesCache.Activities.Add(activity);
            }

            activitiesCache.Activities = activitiesCache.Activities.OrderByDescending(activity => activity.StartDate).ToList();
            activitiesCache.LastSyncDate = DateTimeOffset.UtcNow.AddMonths(-1);
            await _permanentStorageService.Add($"ActivitiesCache:{athleteId}", activitiesCache);
            return activitiesCache.Activities;
        }
    }

    public class ActivitiesCache
    {
        public DateTimeOffset LastSyncDate { get; set; }
        public List<SummaryActivity> Activities { get; set; }
    }
}
