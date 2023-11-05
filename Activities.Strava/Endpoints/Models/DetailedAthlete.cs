using System.Collections.Generic;
using Newtonsoft.Json;

namespace Activities.Strava.Endpoints.Models
{
    public class DetailedAthlete
    {
        [JsonProperty("id")]
        public long Id { get; init; }

        [JsonProperty("username")]
        public string Username { get; init; }

        [JsonProperty("resource_state")]
        public int ResourceState { get; init; }

        [JsonProperty("firstname")]
        public string Firstname { get; init; }

        [JsonProperty("lastname")]
        public string Lastname { get; init; }

        [JsonProperty("clubs")]
        public List<SummaryClub> Clubs { get; init; }
    }
}