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

            return new StravaAthleteToken
            {
                AthleteId = Convert.ToInt64(httpContext.User.Claims.First(claim => claim.Type == ClaimTypes.NameIdentifier).Value),
                AccessToken = await httpContext.GetTokenAsync("access_token")
            };
        }
    }
}
