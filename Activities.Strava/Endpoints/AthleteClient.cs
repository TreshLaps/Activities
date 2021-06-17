using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Activities.Core.Caching;
using Activities.Strava.Endpoints.Models;

namespace Activities.Strava.Endpoints
{
    public class AthleteClient : BaseStravaClient
    {
        private readonly ICachingService _cachingService;

        public AthleteClient(IHttpClientFactory httpClientFactory, ICachingService cachingService) : base(httpClientFactory)
        {
            _cachingService = cachingService;
        }

        public Task<DetailedAthlete> GetAthlete(string accessToken)
        {
            return _cachingService.GetOrAdd(
                $"GetAthlete:{accessToken}",
                TimeSpan.FromMinutes(10),
                () => Get<DetailedAthlete>(accessToken, $"https://www.strava.com/api/v3/athlete"));
        }

        public Task<IReadOnlyList<SummaryClub>> GetAthleteClubs(string accessToken)
        {
            return Get<IReadOnlyList<SummaryClub>>(accessToken, $"https://www.strava.com/api/v3/athlete/clubs?per_page=200");
        }
    }
}