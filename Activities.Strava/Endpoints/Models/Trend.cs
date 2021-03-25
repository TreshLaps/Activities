using System.Collections.Generic;
using Newtonsoft.Json;

namespace Activities.Strava.Endpoints.Models
{
    public class Trend
    {
        [JsonProperty("speeds")]
        public List<double> Speeds { get; set; }

        [JsonProperty("current_activity_index")]
        public int CurrentActivityIndex { get; set; }

        [JsonProperty("min_speed")]
        public double MinSpeed { get; set; }

        [JsonProperty("mid_speed")]
        public double MidSpeed { get; set; }

        [JsonProperty("max_speed")]
        public double MaxSpeed { get; set; }

        [JsonProperty("direction")]
        public int Direction { get; set; }
    }
}