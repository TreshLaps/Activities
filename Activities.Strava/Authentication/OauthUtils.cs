using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.Extensions.DependencyInjection;

namespace Activities.Strava.Authentication
{
    public static class OauthUtils
    {
        public static async Task OnValidatePrincipal(CookieValidatePrincipalContext context)
        {
            var token = new OAuthToken
            {
                AccessToken = context.Properties.GetTokens().First(token => token.Name == "access_token").Value,
                RefreshToken = context.Properties.GetTokens().First(token => token.Name == "refresh_token").Value,
                TokenType = context.Properties.GetTokens().First(token => token.Name == "token_type").Value,
                ExpiresAt = DateTime.Parse(context.Properties.GetTokens().First(token => token.Name == "expires_at").Value)
            };

            if (!(token.ExpiresAt < DateTimeOffset.UtcNow.AddMinutes(5)))
            {
                return;
            }

            var stravaOAuthService = context.HttpContext.RequestServices.GetService<StravaOAuthService>();
            var updatedToken = await stravaOAuthService.GetOrRefreshToken(token);

            context.Properties.StoreTokens(
                new[]
                {
                    new AuthenticationToken { Name = "access_token", Value = updatedToken.AccessToken },
                    new AuthenticationToken { Name = "refresh_token", Value = updatedToken.RefreshToken },
                    new AuthenticationToken { Name = "token_type", Value = updatedToken.TokenType },
                    new AuthenticationToken { Name = "expires_at", Value = updatedToken.ExpiresAt.ToString("u") }
                });

            context.ShouldRenew = true;
        }
    }
}