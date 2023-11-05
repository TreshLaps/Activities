using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;

namespace Activities.Strava.Endpoints.Models
{
    public record DetailedActivity
    {
        public bool IsBislettInterval { get; init; }

        public int? Feeling { get; init; }

        public double? Lactate { get; init; }

        public bool IgnoreIntervals { get; init; }

        [JsonProperty("resource_state")]
        public int ResourceState { get; init; }

        [JsonProperty("athlete")]
        public Athlete Athlete { get; init; }

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

        [JsonProperty("workout_type")]
        public int? WorkoutType { get; init; }

        [JsonProperty("id")]
        public long Id { get; init; }

        [JsonProperty("external_id")]
        public string ExternalId { get; init; }

        [JsonProperty("upload_id")]
        public long? UploadId { get; init; }

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

        [JsonProperty("achievement_count")]
        public int AchievementCount { get; init; }

        [JsonProperty("kudos_count")]
        public int KudosCount { get; init; }

        [JsonProperty("comment_count")]
        public int CommentCount { get; init; }

        [JsonProperty("athlete_count")]
        public int AthleteCount { get; init; }

        [JsonProperty("photo_count")]
        public int PhotoCount { get; init; }

        [JsonProperty("map")]
        public Map Map { get; init; }

        [JsonProperty("trainer")]
        public bool Trainer { get; init; }

        [JsonProperty("commute")]
        public bool Commute { get; init; }

        [JsonProperty("manual")]
        public bool Manual { get; init; }

        [JsonProperty("private")]
        public bool Private { get; init; }

        [JsonProperty("visibility")]
        public string Visibility { get; init; }

        [JsonProperty("flagged")]
        public bool Flagged { get; init; }

        [JsonProperty("gear_id")]
        public string GearId { get; init; }

        [JsonProperty("from_accepted_tag")]
        public bool? FromAcceptedTag { get; init; }

        [JsonProperty("upload_id_str")]
        public string UploadIdStr { get; init; }

        [JsonProperty("average_speed")]
        public double AverageSpeed { get; init; }

        [JsonProperty("max_speed")]
        public double MaxSpeed { get; init; }

        [JsonProperty("average_cadence")]
        public double AverageCadence { get; init; }

        [JsonProperty("has_heartrate")]
        public bool HasHeartrate { get; init; }

        [JsonProperty("average_heartrate")]
        public double AverageHeartrate { get; init; }

        [JsonProperty("max_heartrate")]
        public double MaxHeartrate { get; init; }

        [JsonProperty("heartrate_opt_out")]
        public bool HeartrateOptOut { get; init; }

        [JsonProperty("display_hide_heartrate_option")]
        public bool DisplayHideHeartrateOption { get; init; }

        [JsonProperty("max_watts")]
        public int MaxWatts { get; init; }

        [JsonProperty("elev_high")]
        public double ElevHigh { get; init; }

        [JsonProperty("elev_low")]
        public double ElevLow { get; init; }

        [JsonProperty("pr_count")]
        public int PrCount { get; init; }

        [JsonProperty("total_photo_count")]
        public int TotalPhotoCount { get; init; }

        [JsonProperty("has_kudoed")]
        public bool HasKudoed { get; init; }

        [JsonProperty("suffer_score")]
        public double? SufferScore { get; init; }

        [JsonProperty("description")]
        public string Description { get; init; }

        [JsonProperty("private_note")]
        public string PrivateNote { get; init; }

        [JsonProperty("calories")]
        public double Calories { get; init; }

        [JsonProperty("perceived_exertion")]
        public object PerceivedExertion { get; init; }

        [JsonProperty("prefer_perceived_exertion")]
        public bool? PreferPerceivedExertion { get; init; }

        [JsonProperty("segment_efforts")]
        public List<SegmentEffort> SegmentEfforts { get; init; }

        [JsonProperty("splits_metric")]
        public List<Splits> SplitsMetric { get; init; }

        [JsonProperty("splits_standard")]
        public List<Splits> SplitsStandard { get; init; }

        [JsonProperty("laps")]
        public List<Lap> Laps { get; init; }

        [JsonProperty("unmerged_laps")]
        public List<Lap> UnmergedLaps { get; init; }

        [JsonProperty("best_efforts")]
        public List<BestEffort> BestEfforts { get; init; }

        [JsonProperty("gear")]
        public Gear Gear { get; init; }

        [JsonProperty("photos")]
        public Photos Photos { get; init; }

        [JsonProperty("device_name")]
        public string DeviceName { get; init; }

        [JsonProperty("embed_token")]
        public string EmbedToken { get; init; }

        [JsonProperty("similar_activities")]
        public SimilarActivities SimilarActivities { get; init; }

        [JsonProperty("available_zones")]
        public List<string> AvailableZones { get; init; }

        public double? AverageLactate
        {
            get
            {
                var items = new List<double>();

                if (Lactate > 0)
                {
                    items.Add(Lactate.Value);
                }

                if (Laps != null)
                {
                    items.AddRange(Laps.Where(lap => lap.Lactate.HasValue).Select(lap => lap.Lactate.Value));
                }

                if (!items.Any())
                {
                    return null;
                }

                return items.Average();
            }
        }

        public bool IsRace => WorkoutType is 1 or 11;
    }
}