using Newtonsoft.Json;

namespace Activities.Strava.Endpoints.Models
{
    public class Athlete
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("resource_state")]
        public int ResourceState { get; set; }
    }
}