using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Activities.Strava.Endpoints.Models
{
    public class SegmentEffort
    {
        [JsonProperty("id")]
        public object Id { get; set; }

        [JsonProperty("resource_state")]
        public int ResourceState { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("activity")]
        public Activity Activity { get; set; }

        [JsonProperty("athlete")]
        public Athlete Athlete { get; set; }

        [JsonProperty("elapsed_time")]
        public int ElapsedTime { get; set; }

        [JsonProperty("moving_time")]
        public int MovingTime { get; set; }

        [JsonProperty("start_date")]
        public DateTime StartDate { get; set; }

        [JsonProperty("start_date_local")]
        public DateTime StartDateLocal { get; set; }

        [JsonProperty("distance")]
        public double Distance { get; set; }

        [JsonProperty("start_index")]
        public int StartIndex { get; set; }

        [JsonProperty("end_index")]
        public int EndIndex { get; set; }

        [JsonProperty("average_cadence")]
        public double AverageCadence { get; set; }

        [JsonProperty("average_heartrate")]
        public double AverageHeartrate { get; set; }

        [JsonProperty("max_heartrate")]
        public double MaxHeartrate { get; set; }

        [JsonProperty("segment")]
        public Segment Segment { get; set; }

        [JsonProperty("pr_rank")]
        public int? PrRank { get; set; }

        [JsonProperty("achievements")]
        public List<Achievement> Achievements { get; set; }

        [JsonProperty("kom_rank")]
        public object KomRank { get; set; }

        [JsonProperty("hidden")]
        public bool Hidden { get; set; }
    }
}