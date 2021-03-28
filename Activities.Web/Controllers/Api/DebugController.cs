using System.Threading.Tasks;
using Activities.Core.Caching;
using Activities.Strava.Endpoints;
using Microsoft.AspNetCore.Mvc;

namespace Activities.Web.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    public class DebugController : ControllerBase
    {
        private readonly ActivitiesClient _activitiesClient;
        private readonly ICachingService _cachingService;

        public DebugController(ActivitiesClient activitiesClient, ICachingService cachingService)
        {
            _activitiesClient = activitiesClient;
            _cachingService = cachingService;
        }

        [HttpGet("ClearData")]
        public async Task<IActionResult> ClearData()
        {
            var stravaAthlete = await AuthenticationController.TryGetStravaAthlete(HttpContext);

            if (stravaAthlete == null)
            {
                return Unauthorized();
            }
            
            var activities = await _activitiesClient.GetActivities(stravaAthlete.AccessToken, stravaAthlete.AthleteId);
            _cachingService.Remove($"ActivitiesCache:{stravaAthlete.AthleteId}");

            foreach (var activity in activities)
            {
                _cachingService.Remove($"DetailedActivity:{activity.Id}");
            }
            
            return Ok();
        }
    }
}
