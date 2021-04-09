using System.Linq;
using System.Threading.Tasks;
using Activities.Core.Caching;
using Activities.Core.DataTables;
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
        private readonly ICachingService _cachingService;

        public ActivitiesController(ActivitiesClient activitiesClient, ICachingService cachingService)
        {
            _activitiesClient = activitiesClient;
            _cachingService = cachingService;
        }

        [HttpGet]
        public async Task<dynamic> GetAll()
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
                        Distance = new ItemValue(activity.Distance, ItemValueType.DistanceInMeters),
                        AverageSpeed = new ItemValue(activity.AverageSpeed, ItemValueType.MetersPerSecond)
                    })
                .ToList();
        }

        [HttpGet("{id}")]
        public async Task<dynamic> GetById(long id)
        {
            var stravaAthlete = await HttpContext.TryGetStravaAthlete();

            var activity = await _activitiesClient.GetActivity(stravaAthlete.AccessToken, id);
            return activity;
        }

        [HttpGet("{id}/reimport")]
        public async Task<dynamic> ReimportActivity(long id)
        {
            var stravaAthlete = await HttpContext.TryGetStravaAthlete();
            var activity = await _activitiesClient.GetActivity(stravaAthlete.AccessToken, id);

            if (activity != null)
            {
                _cachingService.Remove($"DetailedActivity:{activity.Id}");
            }

            return await _activitiesClient.GetActivity(stravaAthlete.AccessToken, id);
        }
    }
}
