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

            if (!response.IsSuccessStatusCode)
            {
                throw new RequestFailedException(response.StatusCode);
            }

            var json = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<T>(json);
        }
    }

    public class RequestFailedException : Exception
    {
        public HttpStatusCode StatusCode { get; }

        public RequestFailedException(HttpStatusCode statusCode)
        {
            StatusCode = statusCode;
        }
    }
}