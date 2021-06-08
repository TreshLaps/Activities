using System;

namespace Activities.Strava.Authentication
{
    public class OAuthToken
    {
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public string TokenType { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}