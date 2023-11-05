using Newtonsoft.Json;

namespace Activities.Strava.Endpoints.Models
{
    public class Splits
    {
        [JsonProperty("distance")]
        public double Distance { get; init; }

        [JsonProperty("elapsed_time")]
        public double ElapsedTime { get; init; }

        [JsonProperty("elevation_difference")]
        public double? ElevationDifference { get; init; }

        [JsonProperty("moving_time")]
        public double MovingTime { get; init; }

        [JsonProperty("split")]
        public int Split { get; init; }

        [JsonProperty("average_speed")]
        public double AverageSpeed { get; init; }

        [JsonProperty("average_grade_adjusted_speed")]
        public double? AverageGradeAdjustedSpeed { get; init; }

        [JsonProperty("average_heartrate")]
        public double AverageHeartrate { get; init; }

        [JsonProperty("pace_zone")]
        public int PaceZone { get; init; }
    }
}