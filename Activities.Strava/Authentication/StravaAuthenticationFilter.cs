using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Activities.Strava.Authentication
{
    public class StravaAuthenticationFilter : Attribute, IAsyncAuthorizationFilter
    {
        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var stravaAthlete = await context.HttpContext.TryGetStravaAthlete();

            if (stravaAthlete == null)
            {
                context.Result = new UnauthorizedResult();
            }
        }
    }
}
