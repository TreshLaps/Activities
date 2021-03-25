using Newtonsoft.Json;

namespace Activities.Strava.Endpoints.Models
{
    public class Activity
    {
        [JsonProperty("id")]
        public object Id { get; set; }

        [JsonProperty("resource_state")]
        public int ResourceState { get; set; }
    }
}