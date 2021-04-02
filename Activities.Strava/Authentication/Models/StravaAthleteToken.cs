namespace Activities.Strava.Authentication.Models
{
    public class StravaAthleteToken
    {
        public long AthleteId { get; init; }
        public string AccessToken { get; init; }
    }
}