using Newtonsoft.Json;

namespace Activities.Strava.Endpoints.Models
{
    public class Map
    {
        [JsonProperty("id")]
        public string Id { get; init; }

        [JsonProperty("polyline")]
        public string Polyline { get; init; }

        [JsonProperty("resource_state")]
        public int ResourceState { get; init; }

        [JsonProperty("summary_polyline")]
        public string SummaryPolyline { get; init; }
    }
}