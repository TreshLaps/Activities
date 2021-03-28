using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using AspNet.Security.OAuth.Strava;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;

namespace Activities.Core.Authentication
{
    public static class OauthUtils
    {
        private static readonly ConcurrentDictionary<string, SemaphoreSlim> AsyncLocks = new();

        public static async Task OnValidatePrincipal(CookieValidatePrincipalContext context)
        {
            var expiresAt = DateTime.Parse(context.Properties.GetTokens().First(token => token.Name == "expires_at").Value);

            if (!(expiresAt < DateTimeOffset.UtcNow.AddMinutes(5)))
            {
                return;
            }

            var refreshToken = context.Properties.GetTokens().First(token => token.Name == "refresh_token").Value;

            var semaphoreSlim = AsyncLocks.GetOrAdd(refreshToken, new SemaphoreSlim(1, 1));
            await semaphoreSlim.WaitAsync();

            try
            {
                expiresAt = DateTime.Parse(context.Properties.GetTokens().First(token => token.Name == "expires_at").Value);

                if (!(expiresAt < DateTimeOffset.UtcNow.AddMinutes(5)))
                {
                    return;
                }

                var httpClientFactory = context.HttpContext.RequestServices.GetService<IHttpClientFactory>();
                var configuration = context.HttpContext.RequestServices.GetService<IConfiguration>();
                var client = httpClientFactory.CreateClient();

                var pairs = new List<KeyValuePair<string, string>>
                {
                    new("grant_type", "refresh_token"), 
                    new("refresh_token", refreshToken), 
                    new("client_id", configuration["Strava:ClientId"]), 
                    new("client_secret", configuration["Strava:Secret"])
                };

                using var tokenResponse = await client.SendAsync(new HttpRequestMessage(HttpMethod.Post, new Uri(StravaAuthenticationDefaults.TokenEndpoint)) { Content = new FormUrlEncodedContent(pairs) });

                var json = await tokenResponse.Content.ReadAsStringAsync();
                var refreshedToken = JsonConvert.DeserializeObject<RefresToken>(json);

                context.Properties.StoreTokens(new[] { new AuthenticationToken { Name = "access_token", Value = refreshedToken.AccessToken }, new AuthenticationToken { Name = "refresh_token", Value = refreshedToken.RefreshToken }, new AuthenticationToken { Name = "token_type", Value = refreshedToken.TokenType }, new AuthenticationToken { Name = "expires_at", Value = DateTime.UtcNow.AddSeconds(refreshedToken.ExpiresIn).ToString("u") } });

                context.ShouldRenew = true;
            }
            finally
            {
                semaphoreSlim.Release();
            }
        }
    }

    public class StravaAthleteToken
    {
        public long AthleteId { get; init; }
        public string AccessToken { get; init; }
    }
    
    public class RefresToken
    {
        [JsonProperty("token_type")]
        public string TokenType { get; set; }

        [JsonProperty("access_token")]
        public string AccessToken { get; set; }

        [JsonProperty("expires_at")]
        public int ExpiresAt { get; set; }

        [JsonProperty("expires_in")]
        public int ExpiresIn { get; set; }

        [JsonProperty("refresh_token")]
        public string RefreshToken { get; set; }
    }
}
