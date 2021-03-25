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

        public ActivitiesClient(IHttpClientFactory httpClientFactory, ICachingService cachingService) : base(httpClientFactory)
        {
            _cachingService = cachingService;
        }

        public Task<IReadOnlyList<SummaryActivity>> GetActivities(string accessToken, DateTime fromDatetTime, DateTime toDateTime)
        {
            return _cachingService.GetOrAdd(
                $"GetActivities:{accessToken}:{fromDatetTime:yyyy-MM-dd}:{toDateTime:yyyy-MM-dd}",
                TimeSpan.FromMinutes(10),
                () => _GetActivities(accessToken, fromDatetTime.Date, toDateTime.Date));
        }

        private async Task<IReadOnlyList<SummaryActivity>> _GetActivities(string accessToken, DateTime fromDatetTime, DateTime toDateTime)
        {
            var before = ((DateTimeOffset) toDateTime).ToUnixTimeSeconds();
            var after = ((DateTimeOffset) fromDatetTime).ToUnixTimeSeconds();
            var result = new List<SummaryActivity>();
            IReadOnlyList<SummaryActivity> activities;
            var page = 1;

            do
            {
                activities = await Get<IReadOnlyList<SummaryActivity>>(accessToken, $"https://www.strava.com/api/v3/athlete/activities?page={page}&per_page=200&before={before}&after={after}");
                result.AddRange(activities);
                page++;
                
            } while (activities.Any());

            return result;
        }

        public Task<DetailedActivity> GetActivity(string accessToken, long id)
        {
            return _cachingService.GetOrAdd(
                $"DetailedActivity:{id}",
                TimeSpan.MaxValue,
                () => Get<DetailedActivity>(accessToken, $"https://www.strava.com/api/v3/activities/{id}"));
        }
    }
}
