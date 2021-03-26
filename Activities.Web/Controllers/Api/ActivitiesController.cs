using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Activities.Core.Extensions;
using Activities.Strava.Endpoints;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;

namespace Activities.Web.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    public class ActivitiesController : ControllerBase
    {
        private readonly ActivitiesClient _activitiesClient;

        public ActivitiesController(ActivitiesClient activitiesClient)
        {
            _activitiesClient = activitiesClient;
        }

        [HttpGet]
        public async Task<dynamic> Get()
        {
            var accessToken = await HttpContext.GetTokenAsync("access_token");
            var athleteId = Convert.ToInt64(HttpContext.User.Claims.First(claim => claim.Type == ClaimTypes.NameIdentifier).Value);
            var activities = await _activitiesClient.GetActivities(accessToken, athleteId);

            return activities
                .Select(
                    activity => new
                    {
                        activity.Id,
                        activity.Type,
                        activity.Name,
                        StartDate = activity.StartDate.ToString("dd.MM.yyyy"),
                        Distance = activity.Distance.ToKmString(),
                        AverageSpeed = activity.AverageSpeed.ToMinPerKmString()
                    })
                .ToList();
        }
    }
}
