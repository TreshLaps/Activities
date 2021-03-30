using System.Threading.Tasks;
using Activities.Core.Caching;
using Activities.Strava.Endpoints;
using Activities.Strava.Endpoints.Models;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace Activities.Web.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    public class DebugController : ControllerBase
    {
        private readonly ActivitiesClient _activitiesClient;
        private readonly ICachingService _cachingService;
        private readonly IPermanentStorageService _permanentStorageService;

        public DebugController(ActivitiesClient activitiesClient, ICachingService cachingService, IPermanentStorageService permanentStorageService)
        {
            _activitiesClient = activitiesClient;
            _cachingService = cachingService;
            _permanentStorageService = permanentStorageService;
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
        
        [HttpGet("Save/{activityId}")]
        public async Task<IActionResult> Save(long activityId)
        {
            var activity = await _permanentStorageService.Get<DetailedActivity>($"DetailedActivity:{activityId}");
            return Content(JsonConvert.SerializeObject(activity), "application/json");
        }
    }
}
