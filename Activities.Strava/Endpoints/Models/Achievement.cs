using Newtonsoft.Json;

namespace Activities.Strava.Endpoints.Models
{
    public class Achievement
    {
        [JsonProperty("type_id")]
        public int TypeId { get; set; }

        [JsonProperty("type")]
        public string Type { get; set; }

        [JsonProperty("rank")]
        public int Rank { get; set; }
    }
}