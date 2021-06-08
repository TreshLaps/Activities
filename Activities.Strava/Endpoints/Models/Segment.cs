using System.Collections.Generic;
using Newtonsoft.Json;

namespace Activities.Strava.Endpoints.Models
{
    public class Segment
    {
        [JsonProperty("id")] public long Id { get; set; }

        [JsonProperty("resource_state")] public int ResourceState { get; set; }

        [JsonProperty("name")] public string Name { get; set; }

        [JsonProperty("activity_type")] public string ActivityType { get; set; }

        [JsonProperty("distance")] public double Distance { get; set; }

        [JsonProperty("average_grade")] public double AverageGrade { get; set; }

        [JsonProperty("maximum_grade")] public double MaximumGrade { get; set; }

        [JsonProperty("elevation_high")] public double ElevationHigh { get; set; }

        [JsonProperty("elevation_low")] public double ElevationLow { get; set; }

        [JsonProperty("start_latlng")] public List<double> StartLatlng { get; set; }

        [JsonProperty("end_latlng")] public List<double> EndLatlng { get; set; }

        [JsonProperty("elevation_profile")] public object ElevationProfile { get; set; }

        [JsonProperty("start_latitude")] public double StartLatitude { get; set; }

        [JsonProperty("start_longitude")] public double StartLongitude { get; set; }

        [JsonProperty("end_latitude")] public double EndLatitude { get; set; }

        [JsonProperty("end_longitude")] public double EndLongitude { get; set; }

        [JsonProperty("climb_category")] public int ClimbCategory { get; set; }

        [JsonProperty("city")] public string City { get; set; }

        [JsonProperty("state")] public string State { get; set; }

        [JsonProperty("country")] public string Country { get; set; }

        [JsonProperty("private")] public bool Private { get; set; }

        [JsonProperty("hazardous")] public bool Hazardous { get; set; }

        [JsonProperty("starred")] public bool Starred { get; set; }
    }
}