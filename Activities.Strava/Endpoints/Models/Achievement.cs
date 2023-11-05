using Newtonsoft.Json;

namespace Activities.Strava.Endpoints.Models
{
    public class Achievement
    {
        [JsonProperty("type_id")]
        public int TypeId { get; init; }

        [JsonProperty("type")]
        public string Type { get; init; }

        [JsonProperty("rank")]
        public int Rank { get; init; }
    }
}