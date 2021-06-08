using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Activities.Strava.Authentication.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Activities.Strava.Authentication
{
    public static class HttpContextExtensions
    {
        public static async Task<StravaAthleteToken> TryGetStravaAthlete(this HttpContext httpContext)
        {
            if (httpContext.User.Identity?.IsAuthenticated == false)
            {
                return null;
            }

            var configuration = httpContext.RequestServices.GetService<IConfiguration>();
            var validClubs = configuration["Strava:Clubs"]?.Split(",", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

            if (validClubs?.Any() == true)
            {
                var userClubs = httpContext.User.Claims.FirstOrDefault(claim => claim.Type == "urn:strava:clubs")
                    ?.Value?.Split(",", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

                if (userClubs == null || userClubs.All(userClub => validClubs.Contains(userClub) == false))
                {
                    return null;
                }
            }

            return new StravaAthleteToken
            {
                AthleteId = Convert.ToInt64(httpContext.User.Claims.First(claim => claim.Type == ClaimTypes.NameIdentifier).Value),
                AccessToken = await httpContext.GetTokenAsync("access_token"),
                FullName =
                    $"{httpContext.User.Claims.First(claim => claim.Type == ClaimTypes.GivenName).Value} {httpContext.User.Claims.First(claim => claim.Type == ClaimTypes.Surname).Value}",
                ProfileImageUrl = httpContext.User.Claims.First(claim => claim.Type == "urn:strava:profile-medium").Value
            };
        }

        public static async Task<OAuthToken> TryGetStravaOAuthToken(this HttpContext httpContext)
        {
            var accessToken = await httpContext.GetTokenAsync("access_token");

            if (accessToken == null)
            {
                return null;
            }

            var token = new OAuthToken
            {
                AccessToken = accessToken,
                RefreshToken = await httpContext.GetTokenAsync("refresh_token"),
                TokenType = await httpContext.GetTokenAsync("token_type"),
                ExpiresAt = DateTime.Parse(await httpContext.GetTokenAsync("expires_at"))
            };

            var stravaOAuthService = httpContext.RequestServices.GetService<StravaOAuthService>();
            return await stravaOAuthService.GetOrRefreshToken(token);
        }
    }
}