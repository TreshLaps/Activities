using Newtonsoft.Json;

namespace Activities.Strava.Endpoints.Models
{
    public class SimilarActivities
    {
        [JsonProperty("effort_count")]
        public int EffortCount { get; set; }

        [JsonProperty("average_speed")]
        public double AverageSpeed { get; set; }

        [JsonProperty("min_average_speed")]
        public double MinAverageSpeed { get; set; }

        [JsonProperty("mid_average_speed")]
        public double MidAverageSpeed { get; set; }

        [JsonProperty("max_average_speed")]
        public double MaxAverageSpeed { get; set; }

        [JsonProperty("pr_rank")]
        public object PrRank { get; set; }

        [JsonProperty("frequency_milestone")]
        public object FrequencyMilestone { get; set; }

        [JsonProperty("trend")]
        public Trend Trend { get; set; }

        [JsonProperty("resource_state")]
        public int ResourceState { get; set; }
    }
}