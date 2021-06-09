using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Activities.Strava.Authentication.Models;
using AspNet.Security.OAuth.Strava;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;

namespace Activities.Strava.Authentication
{
    public class StravaOAuthService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private static readonly ConcurrentDictionary<string, SemaphoreSlim> AsyncLocks = new();

        public StravaOAuthService(
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration
        )
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        public async Task<OAuthToken> GetOrRefreshToken(OAuthToken token)
        {
            if (!(token.ExpiresAt < DateTimeOffset.UtcNow.AddMinutes(5)))
            {
                return token;
            }

            var semaphoreSlim = AsyncLocks.GetOrAdd(token.RefreshToken, new SemaphoreSlim(1, 1));
            await semaphoreSlim.WaitAsync();

            try
            {
                if (!(token.ExpiresAt < DateTimeOffset.UtcNow.AddMinutes(5)))
                {
                    return token;
                }

                var client = _httpClientFactory.CreateClient();

                var pairs = new List<KeyValuePair<string, string>>
                {
                    new("grant_type", "refresh_token"),
                    new("refresh_token", token.RefreshToken),
                    new("client_id", _configuration["Strava:ClientId"]),
                    new("client_secret", _configuration["Strava:Secret"])
                };

                using var tokenResponse = await client.SendAsync(
                    new HttpRequestMessage(HttpMethod.Post, new Uri(StravaAuthenticationDefaults.TokenEndpoint))
                        { Content = new FormUrlEncodedContent(pairs) });

                if (!tokenResponse.IsSuccessStatusCode)
                {
                    throw new InvalidOperationException(tokenResponse.StatusCode.ToString());
                }

                var json = await tokenResponse.Content.ReadAsStringAsync();
                var refreshedToken = JsonConvert.DeserializeObject<RefresToken>(json);

                return new OAuthToken
                {
                    AccessToken = refreshedToken.AccessToken,
                    RefreshToken = refreshedToken.RefreshToken,
                    TokenType = refreshedToken.TokenType,
                    ExpiresAt = DateTime.UtcNow.AddSeconds(refreshedToken.ExpiresIn)
                };
            }
            finally
            {
                semaphoreSlim.Release();
            }
        }
    }
}