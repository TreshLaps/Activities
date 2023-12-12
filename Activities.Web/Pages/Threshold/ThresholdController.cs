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
                filterRequest = filterRequest with {Duration = FilterDuration.LastYear};
            }

            var stravaAthlete = await HttpContext.TryGetStravaAthlete();
            var activityList =
                (await _activitiesClient.GetActivities(stravaAthlete.AccessToken, stravaAthlete.AthleteId))
                .Where(filterRequest.Keep)
                .ToList();

            // Strides (100m up/down acceleration) are no more than 30 seconds
            // Ingebrigtsen hill sprints (200 meters) and popular 45/15 workouts, considered threshold if within pace
            var laps = (await activityList.ForEachAsync(4,
                    activity => _activitiesClient.GetActivity(stravaAthlete.AccessToken, stravaAthlete.AthleteId,
                        activity.Id)))
                .Where(activity => activity?.Laps?.Any(lap => lap.IsInterval && lap.ElapsedTime > 30) == true)
                .SelectMany(activity => activity.Laps.Where(lap => lap.IsInterval && lap.ElapsedTime > 30))
                .ToList();

            var medianPace = laps.Select(lap => lap.AverageSpeed).Median();

            // Average pace will show min/500m if showing only rowing activities, and min/km
            // otherwise (including if filter is set to “all”, no matter what kinds of
            // activities are actually visible).
            var activityType = filterRequest.Type;

            return new
            {
                MedianPace = medianPace.ToPaceString(activityType),
                MinPace = (medianPace - 0.4).ToPaceString(activityType),
                MaxPace = (medianPace + 0.4).ToPaceString(activityType)
            };
        }
    }
}
