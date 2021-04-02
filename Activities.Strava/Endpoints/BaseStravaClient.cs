using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace Activities.Strava.Endpoints
{
    public abstract class BaseStravaClient
    {
        protected readonly IHttpClientFactory _httpClientFactory;

        protected BaseStravaClient(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        protected async Task<T> Get<T>(string accessToken, string url)
        {
            var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Add("Accept", "application/json");
            request.Headers.Add("Authorization", $"Bearer {accessToken}");

            var client = _httpClientFactory.CreateClient();
            var response = await client.SendAsync(request);

            if (response.StatusCode == HttpStatusCode.TooManyRequests)
            {
                throw new InvalidOperationException("Too many requests");
            }
            else if (!response.IsSuccessStatusCode)
            {
                throw new InvalidOperationException(response.StatusCode.ToString());
            }
                
            var json = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<T>(json);
        }
    }
}