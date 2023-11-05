using Newtonsoft.Json;

namespace Activities.Strava.Endpoints.Models
{
    public class SummaryClub
    {
        [JsonProperty("id")]
        public long Id { get; init; }

        [JsonProperty("resource_state")]
        public int ResourceState { get; init; }

        [JsonProperty("name")]
        public string Name { get; init; }

        [JsonProperty("profile_medium")]
        public string ProfileMedium { get; init; }

        [JsonProperty("profile")]
        public string Profile { get; init; }

        [JsonProperty("cover_photo")]
        public string CoverPhoto { get; init; }

        [JsonProperty("cover_photo_small")]
        public string CoverPhotoSmall { get; init; }

        [JsonProperty("sport_type")]
        public string SportType { get; init; }

        [JsonProperty("city")]
        public string City { get; init; }

        [JsonProperty("state")]
        public string State { get; init; }

        [JsonProperty("country")]
        public string Country { get; init; }

        [JsonProperty("private")]
        public bool Private { get; init; }

        [JsonProperty("member_count")]
        public int MemberCount { get; init; }

        [JsonProperty("featured")]
        public bool Featured { get; init; }

        [JsonProperty("verified")]
        public bool Verified { get; init; }

        [JsonProperty("url")]
        public string Url { get; init; }
    }
}