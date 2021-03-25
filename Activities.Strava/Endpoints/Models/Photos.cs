using Newtonsoft.Json;

namespace Activities.Strava.Endpoints.Models
{
    public class Photos
    {
        [JsonProperty("primary")]
        public object Primary { get; set; }

        [JsonProperty("count")]
        public int Count { get; set; }
    }
}