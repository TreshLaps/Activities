using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Activities.Strava.Endpoints.Models
{
    public class SummaryActivity
    {
        [JsonProperty("name")]
        public string Name { get; init; }

        [JsonProperty("distance")]
        public double Distance { get; init; }

        [JsonProperty("moving_time")]
        public int MovingTime { get; init; }

        [JsonProperty("elapsed_time")]
        public int ElapsedTime { get; init; }

        [JsonProperty("total_elevation_gain")]
        public double TotalElevationGain { get; init; }

        [JsonProperty("type")]
        public string Type { get; init; }

        [JsonProperty("id")]
        public long Id { get; init; }

        [JsonProperty("start_date")]
        public DateTime StartDate { get; init; }

        [JsonProperty("start_date_local")]
        public DateTime StartDateLocal { get; init; }

        [JsonProperty("timezone")]
        public string Timezone { get; init; }

        [JsonProperty("utc_offset")]
        public double UtcOffset { get; init; }

        [JsonProperty("start_latlng")]
        public List<double> StartLatlng { get; init; }

        [JsonProperty("end_latlng")]
        public List<double> EndLatlng { get; init; }

        [JsonProperty("gear_id")]
        public string GearId { get; init; }

        [JsonProperty("average_speed")]
        public double AverageSpeed { get; init; }

        [JsonProperty("max_speed")]
        public double MaxSpeed { get; init; }

        [JsonProperty("average_heartrate")]
        public double AverageHeartrate { get; init; }

        [JsonProperty("max_heartrate")]
        public double MaxHeartrate { get; init; }

        [JsonProperty("elev_high")]
        public double ElevHigh { get; init; }

        [JsonProperty("elev_low")]
        public double ElevLow { get; init; }

        [JsonProperty("suffer_score")]
        public double? SufferScore { get; init; }

        [JsonProperty("workout_type")]
        public int? WorkoutType { get; init; }

        [JsonProperty("average_cadence")]
        public double? AverageCadence { get; init; }

        [JsonProperty("max_watts")]
        public int? MaxWatts { get; init; }

        [JsonProperty("average_watts")]
        public double? AverageWatts { get; init; }

        [JsonProperty("weighted_average_watts")]
        public int? WeightedAverageWatts { get; init; }

        [JsonProperty("kilojoules")]
        public double? Kilojoules { get; init; }

        [JsonProperty("device_watts")]
        public bool? DeviceWatts { get; init; }
    }
}