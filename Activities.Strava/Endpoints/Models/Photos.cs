using Newtonsoft.Json;

namespace Activities.Strava.Endpoints.Models
{
    public class Photos
    {
        [JsonProperty("primary")]
        public object Primary { get; init; }

        [JsonProperty("count")]
        public int Count { get; init; }
    }
}