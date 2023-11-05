using Newtonsoft.Json;

namespace Activities.Strava.Endpoints.Models
{
    public class Sho
    {
        [JsonProperty("id")]
        public string Id { get; init; }

        [JsonProperty("primary")]
        public bool Primary { get; init; }

        [JsonProperty("name")]
        public string Name { get; init; }

        [JsonProperty("resource_state")]
        public int ResourceState { get; init; }

        [JsonProperty("distance")]
        public int Distance { get; init; }
    }
}