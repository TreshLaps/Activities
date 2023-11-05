using System.Collections.Generic;
using Newtonsoft.Json;

namespace Activities.Strava.Endpoints.Models
{
    public class Trend
    {
        [JsonProperty("speeds")]
        public List<double> Speeds { get; init; }

        [JsonProperty("current_activity_index")]
        public int? CurrentActivityIndex { get; init; }

        [JsonProperty("min_speed")]
        public double MinSpeed { get; init; }

        [JsonProperty("mid_speed")]
        public double MidSpeed { get; init; }

        [JsonProperty("max_speed")]
        public double MaxSpeed { get; init; }

        [JsonProperty("direction")]
        public int Direction { get; init; }
    }
}