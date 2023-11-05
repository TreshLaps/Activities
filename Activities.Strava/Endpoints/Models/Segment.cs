using System.Collections.Generic;
using Newtonsoft.Json;

namespace Activities.Strava.Endpoints.Models
{
    public class Segment
    {
        [JsonProperty("id")]
        public long Id { get; init; }

        [JsonProperty("resource_state")]
        public int ResourceState { get; init; }

        [JsonProperty("name")]
        public string Name { get; init; }

        [JsonProperty("activity_type")]
        public string ActivityType { get; init; }

        [JsonProperty("distance")]
        public double Distance { get; init; }

        [JsonProperty("average_grade")]
        public double AverageGrade { get; init; }

        [JsonProperty("maximum_grade")]
        public double MaximumGrade { get; init; }

        [JsonProperty("elevation_high")]
        public double ElevationHigh { get; init; }

        [JsonProperty("elevation_low")]
        public double ElevationLow { get; init; }

        [JsonProperty("start_latlng")]
        public List<double> StartLatlng { get; init; }

        [JsonProperty("end_latlng")]
        public List<double> EndLatlng { get; init; }

        [JsonProperty("elevation_profile")]
        public object ElevationProfile { get; init; }

        [JsonProperty("start_latitude")]
        public double StartLatitude { get; init; }

        [JsonProperty("start_longitude")]
        public double StartLongitude { get; init; }

        [JsonProperty("end_latitude")]
        public double EndLatitude { get; init; }

        [JsonProperty("end_longitude")]
        public double EndLongitude { get; init; }

        [JsonProperty("climb_category")]
        public int ClimbCategory { get; init; }

        [JsonProperty("city")]
        public string City { get; init; }

        [JsonProperty("state")]
        public string State { get; init; }

        [JsonProperty("country")]
        public string Country { get; init; }

        [JsonProperty("private")]
        public bool Private { get; init; }

        [JsonProperty("hazardous")]
        public bool Hazardous { get; init; }

        [JsonProperty("starred")]
        public bool Starred { get; init; }
    }
}