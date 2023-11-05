using Newtonsoft.Json;

namespace Activities.Strava.Endpoints.Models
{
    public class SimilarActivities
    {
        [JsonProperty("effort_count")]
        public int EffortCount { get; init; }

        [JsonProperty("average_speed")]
        public double AverageSpeed { get; init; }

        [JsonProperty("min_average_speed")]
        public double MinAverageSpeed { get; init; }

        [JsonProperty("mid_average_speed")]
        public double MidAverageSpeed { get; init; }

        [JsonProperty("max_average_speed")]
        public double MaxAverageSpeed { get; init; }

        [JsonProperty("pr_rank")]
        public object PrRank { get; init; }

        [JsonProperty("frequency_milestone")]
        public object FrequencyMilestone { get; init; }

        [JsonProperty("trend")]
        public Trend Trend { get; init; }

        [JsonProperty("resource_state")]
        public int ResourceState { get; init; }
    }
}