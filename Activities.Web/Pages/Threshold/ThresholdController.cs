using System.Linq;
using System.Threading.Tasks;
using Activities.Core.Extensions;
using Activities.Strava.Activities;
using Activities.Strava.Authentication;
using Activities.Strava.Endpoints;
using Microsoft.AspNetCore.Mvc;

namespace Activities.Web.Pages.Threshold
{
    [ApiController]
    [Route("api/[controller]")]
    [StravaAuthenticationFilter]
    public class ThresholdController : ControllerBase
    {
        private readonly ActivitiesClient _activitiesClient;

        public ThresholdController(ActivitiesClient activitiesClient)
        {
            _activitiesClient = activitiesClient;
        }

        [HttpGet("estimate")]
        public async Task<dynamic> GetEstimate([FromQuery] FilterRequest filterRequest)
        {
            if (filterRequest.Duration == FilterDuration.LastMonths)
            {
                filterRequest = filterRequest with { Duration = FilterDuration.LastYear };
            }
            
            var stravaAthlete = await HttpContext.TryGetStravaAthlete();
            var activityList = (await _activitiesClient.GetActivities(stravaAthlete.AccessToken, stravaAthlete.AthleteId))
                .Where(filterRequest.Keep)
                .ToList();

            var laps = (await activityList.ForEachAsync(4, activity => _activitiesClient.GetActivity(stravaAthlete.AccessToken, activity.Id)))
                .Where(activity => activity?.Laps?.Any(lap => lap.IsInterval && lap.ElapsedTime > 120) == true)
                .SelectMany(activity => activity.Laps.Where(lap => lap.IsInterval && lap.ElapsedTime > 120))
                .ToList();

            var medianPace = laps.Select(lap => lap.AverageSpeed).Median();

            return new
            {
                MedianPace = medianPace.ToPaceString(),
                MinPace = (medianPace - 0.4).ToPaceString(),
                MaxPace = (medianPace + 0.4).ToPaceString()
            };
        }
    }
}
