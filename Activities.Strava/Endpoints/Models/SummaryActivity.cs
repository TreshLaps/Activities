using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Activities.Strava.Endpoints.Models
{
    public class SummaryActivity
    {
        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("distance")]
        public double Distance { get; set; }

        [JsonProperty("moving_time")]
        public int MovingTime { get; set; }

        [JsonProperty("elapsed_time")]
        public int ElapsedTime { get; set; }

        [JsonProperty("total_elevation_gain")]
        public double TotalElevationGain { get; set; }

        [JsonProperty("type")]
        public string Type { get; set; }

        [JsonProperty("id")]
        public long Id { get; set; }

        [JsonProperty("start_date")]
        public DateTime StartDate { get; set; }

        [JsonProperty("start_date_local")]
        public DateTime StartDateLocal { get; set; }

        [JsonProperty("timezone")]
        public string Timezone { get; set; }

        [JsonProperty("utc_offset")]
        public double UtcOffset { get; set; }

        [JsonProperty("start_latlng")]
        public List<double> StartLatlng { get; set; }

        [JsonProperty("end_latlng")]
        public List<double> EndLatlng { get; set; }

        [JsonProperty("gear_id")]
        public string GearId { get; set; }

        [JsonProperty("average_speed")]
        public double AverageSpeed { get; set; }

        [JsonProperty("max_speed")]
        public double MaxSpeed { get; set; }

        [JsonProperty("average_heartrate")]
        public double AverageHeartrate { get; set; }

        [JsonProperty("max_heartrate")]
        public double MaxHeartrate { get; set; }

        [JsonProperty("elev_high")]
        public double ElevHigh { get; set; }

        [JsonProperty("elev_low")]
        public double ElevLow { get; set; }

        [JsonProperty("suffer_score")]
        public double? SufferScore { get; set; }

        [JsonProperty("workout_type")]
        public int? WorkoutType { get; set; }

        [JsonProperty("average_cadence")]
        public double? AverageCadence { get; set; }

        [JsonProperty("max_watts")]
        public int? MaxWatts { get; set; }

        [JsonProperty("average_watts")]
        public double? AverageWatts { get; set; }

        [JsonProperty("weighted_average_watts")]
        public int? WeightedAverageWatts { get; set; }

        [JsonProperty("kilojoules")]
        public double? Kilojoules { get; set; }

        [JsonProperty("device_watts")]
        public bool? DeviceWatts { get; set; }
    }
}
