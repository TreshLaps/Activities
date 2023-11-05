using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Activities.Strava.Endpoints.Models
{
    public class SegmentEffort
    {
        [JsonProperty("id")]
        public long Id { get; init; }

        [JsonProperty("resource_state")]
        public int ResourceState { get; init; }

        [JsonProperty("name")]
        public string Name { get; init; }

        [JsonProperty("activity")]
        public Activity Activity { get; init; }

        [JsonProperty("athlete")]
        public Athlete Athlete { get; init; }

        [JsonProperty("elapsed_time")]
        public int ElapsedTime { get; init; }

        [JsonProperty("moving_time")]
        public int MovingTime { get; init; }

        [JsonProperty("start_date")]
        public DateTime StartDate { get; init; }

        [JsonProperty("start_date_local")]
        public DateTime StartDateLocal { get; init; }

        [JsonProperty("distance")]
        public double Distance { get; init; }

        [JsonProperty("start_index")]
        public int StartIndex { get; init; }

        [JsonProperty("end_index")]
        public int EndIndex { get; init; }

        [JsonProperty("average_cadence")]
        public double AverageCadence { get; init; }

        [JsonProperty("average_heartrate")]
        public double AverageHeartrate { get; init; }

        [JsonProperty("max_heartrate")]
        public double MaxHeartrate { get; init; }

        [JsonProperty("segment")]
        public Segment Segment { get; init; }

        [JsonProperty("pr_rank")]
        public int? PrRank { get; init; }

        [JsonProperty("achievements")]
        public List<Achievement> Achievements { get; init; }

        [JsonProperty("kom_rank")]
        public object KomRank { get; init; }

        [JsonProperty("hidden")]
        public bool Hidden { get; init; }
    }
}