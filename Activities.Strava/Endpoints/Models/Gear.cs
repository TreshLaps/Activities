using Newtonsoft.Json;

namespace Activities.Strava.Endpoints.Models
{
    public class Gear
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("primary")]
        public bool Primary { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("resource_state")]
        public int ResourceState { get; set; }

        [JsonProperty("distance")]
        public int Distance { get; set; }
    }
}