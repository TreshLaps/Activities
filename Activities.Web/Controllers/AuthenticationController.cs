using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Activities.Core.Authentication;
using Microsoft.AspNetCore.Mvc;
using AspNet.Security.OAuth.Strava;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Activities.Web.Controllers
{
    public class AuthenticationController : Controller
    {
        [HttpGet("~/signin")]
        public IActionResult SignIn()
        {
            return Challenge(new AuthenticationProperties { RedirectUri = "/", AllowRefresh = true }, StravaAuthenticationDefaults.AuthenticationScheme);
        }

        [HttpGet("~/signout")]
        [HttpPost("~/signout")]
        public IActionResult SignOutCurrentUser()
        {
            return SignOut(new AuthenticationProperties { RedirectUri = "/" }, CookieAuthenticationDefaults.AuthenticationScheme);
        }
        
        [HttpGet("~/api/IsAuthenticated")]
        public async Task<bool> IsAuthenticated()
        {
            return (await TryGetStravaAthlete(HttpContext)) != null;
        }

        public static async Task<StravaAthleteToken> TryGetStravaAthlete(HttpContext httpContext)
        {
            if (httpContext.User.Identity?.IsAuthenticated == false)
            {
                return null;
            }

            var configuration = httpContext.RequestServices.GetService<IConfiguration>();
            var validClubs = configuration["Strava:Clubs"]?.Split(",", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

            if (validClubs?.Any() == true)
            {
                var userClubs = httpContext.User.Claims.FirstOrDefault(claim => claim.Type == "urn:strava:clubs")?.Value?.Split(",", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

                if (userClubs == null || userClubs.All(userClub => validClubs.Contains(userClub) == false))
                {
                    return null;
                }
            }

            return new StravaAthleteToken
            {
                AthleteId = Convert.ToInt64(httpContext.User.Claims.First(claim => claim.Type == ClaimTypes.NameIdentifier).Value),
                AccessToken = await httpContext.GetTokenAsync("access_token")
            };
        }
    }
}
