using System.Linq;
using System.Threading.Tasks;
using Activities.Core.Extensions;
using Activities.Strava.Authentication;
using Activities.Strava.Endpoints;
using Microsoft.AspNetCore.Mvc;

namespace Activities.Web.Pages.Authentication
{
    [ApiController]
    [Route("api/[controller]")]
    [StravaAuthenticationFilter]
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
            var stravaAthlete = await HttpContext.TryGetStravaAthlete();
            var activities = await _activitiesClient.GetActivities(stravaAthlete.AccessToken, stravaAthlete.AthleteId);

            return activities
                .Select(
                    activity => new
                    {
                        activity.Id,
                        activity.Type,
                        activity.Name,
                        StartDate = activity.StartDate.ToString("dd.MM.yyyy"),
                        Distance = activity.Distance.ToKmString(),
                        AverageSpeed = activity.AverageSpeed.ToPaceString()
                    })
                .ToList();
        }
    }
}
