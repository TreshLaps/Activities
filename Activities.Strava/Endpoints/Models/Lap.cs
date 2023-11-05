using System;
using Newtonsoft.Json;

namespace Activities.Strava.Endpoints.Models
{
    public record Lap
    {
        public double? Lactate { get; init; }

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

        [JsonProperty("total_elevation_gain")]
        public double TotalElevationGain { get; init; }

        [JsonProperty("average_speed")]
        public double AverageSpeed { get; init; }

        [JsonProperty("max_speed")]
        public double MaxSpeed { get; init; }

        [JsonProperty("average_cadence")]
        public double AverageCadence { get; init; }

        [JsonProperty("average_heartrate")]
        public double AverageHeartrate { get; init; }

        [JsonProperty("max_heartrate")]
        public double MaxHeartrate { get; init; }

        [JsonProperty("lap_index")]
        public int LapIndex { get; init; }

        [JsonProperty("split")]
        public int Split { get; init; }

        [JsonProperty("pace_zone")]
        public int PaceZone { get; init; }

        public bool IsInterval { get; init; }
        public double OriginalDistance { get; init; }
        public double OriginalAverageSpeed { get; init; }
    }
}