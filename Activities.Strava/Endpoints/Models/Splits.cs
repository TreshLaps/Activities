using Newtonsoft.Json;

namespace Activities.Strava.Endpoints.Models
{
    public class Splits
    {
        [JsonProperty("distance")] public double Distance { get; set; }

        [JsonProperty("elapsed_time")] public double ElapsedTime { get; set; }

        [JsonProperty("elevation_difference")] public double? ElevationDifference { get; set; }

        [JsonProperty("moving_time")] public double MovingTime { get; set; }

        [JsonProperty("split")] public int Split { get; set; }

        [JsonProperty("average_speed")] public double AverageSpeed { get; set; }

        [JsonProperty("average_grade_adjusted_speed")]
        public double? AverageGradeAdjustedSpeed { get; set; }

        [JsonProperty("average_heartrate")] public double AverageHeartrate { get; set; }

        [JsonProperty("pace_zone")] public int PaceZone { get; set; }
    }
}