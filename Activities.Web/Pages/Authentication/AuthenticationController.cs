using System.Threading.Tasks;
using Activities.Strava.Authentication;
using AspNet.Security.OAuth.Strava;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;

namespace Activities.Web.Authentication
{
    [ApiController]
    [Route("api/[controller]")]
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
        
        [HttpGet("user")]
        public async Task<dynamic> GetUser()
        {
            var stravaAthlete = await HttpContext.TryGetStravaAthlete();

            if (stravaAthlete == null)
            {
                return null;
            }

            return new
            {
                stravaAthlete.AthleteId,
                stravaAthlete.FullName,
                stravaAthlete.ProfileImageUrl
            };
        }
    }
}
