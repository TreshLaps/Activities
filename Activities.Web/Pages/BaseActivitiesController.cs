using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Activities.Core.Extensions;
using Activities.Strava.Activities;
using Activities.Strava.Authentication;
using Activities.Strava.Endpoints;
using Microsoft.AspNetCore.Mvc;

namespace Activities.Web.Pages
{
    public class BaseActivitiesController : ControllerBase
    {
        protected readonly ActivitiesClient _activitiesClient;

        public BaseActivitiesController(ActivitiesClient activitiesClient)
        {
            _activitiesClient = activitiesClient;
        }

        protected async Task<List<ActivityDataSummary>> GetActivities(FilterRequest filterRequest)
        {
            var stravaAthlete = await HttpContext.TryGetStravaAthlete();
            var activityList = (await _activitiesClient.GetActivities(stravaAthlete.AccessToken, stravaAthlete.AthleteId))
                .Where(filterRequest.Keep)
                .ToList();
            
            return (await activityList.ForEachAsync(4, activity => _activitiesClient.GetActivity(stravaAthlete.AccessToken, activity.Id)))
                .Where(activity => activity != null)
                .ToActivitySummary(filterRequest);
        }

        protected async Task<Dictionary<string, List<ActivityDataSummary>>> GetActivitiesGroupByDate(FilterRequest filterRequest)
        {
            var result = await GetActivities(filterRequest);
            var (startDate, endDate) = filterRequest.GetDateRange();
            var groupKey = filterRequest.Duration == FilterDuration.LastMonths ? GroupKey.Week : GroupKey.Month;

            if (filterRequest.GroupKey.HasValue)
            {
                groupKey = filterRequest.GroupKey.Value;
            }

            return result.GroupByDate(groupKey, activity => activity.Activity.StartDate, startDate, endDate);
        }
    }
}
