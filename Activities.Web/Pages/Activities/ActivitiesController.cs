using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Activities.Core.DataTables;
using Activities.Core.Extensions;
using Activities.Strava.Activities;
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
        
        [HttpGet("{id}")]
        public async Task<dynamic> GetActivity(long id)
        {
            var stravaAthlete = await HttpContext.TryGetStravaAthlete();
            var activity = await _activitiesClient.GetActivity(stravaAthlete.AccessToken, id);
            return activity;
        }

        [HttpGet]
        public async Task<ActivitiesResult> Get([FromQuery] FilterRequest filterRequest)
        {
            var stravaAthlete = await HttpContext.TryGetStravaAthlete();
            var activityList = (await _activitiesClient.GetActivities(stravaAthlete.AccessToken, stravaAthlete.AthleteId))
                .Where(filterRequest.Keep)
                .ToList();
            
            var groupKey = filterRequest.Duration == FilterDuration.LastMonths ? GroupKey.Week : GroupKey.Month;
            var (startDate, endDate) = filterRequest.GetDateRange();

            var activities = (await activityList.ForEachAsync(4, activity => _activitiesClient.GetActivity(stravaAthlete.AccessToken, activity.Id)))
                .Where(activity => activity != null)
                .ToActivitySummary(filterRequest.DataType)
                .GroupByDate(groupKey, activity => activity.Activity.StartDate, startDate, endDate)
                .Select(month => new ActivityGroup
                {
                    Name = month.Key,
                    Items = month.Value.Select(activitySummary => new Activity
                    {
                        Id = activitySummary.Activity.Id,
                        Date = activitySummary.Activity.StartDate.ToString("ddd dd. MMM"),
                        Name = activitySummary.Activity.Name,
                        Type = activitySummary.Activity.Type,
                        Description = activitySummary.Activity.Description,
                        Distance = activitySummary.Distance,
                        ElapsedTime = activitySummary.ElapsedTime,
                        Pace = activitySummary.Pace,
                        Heartrate = activitySummary.Heartrate,
                        Lactate = activitySummary.Lactate
                    }).ToList()
                })
                .ToList();

            return new ActivitiesResult
            {
                Activities = activities
            };
        }
    }

    public class ActivitiesResult
    {
        public List<ActivityGroup> Activities { get; set; }
    }

    public class ActivityGroup
    {
        public string Name { get; set; }
        public List<Activity> Items { get; set; }
    }

    public class Activity
    {
        public long Id { get; set; }
        public string Type { get; set; }
        public string Date { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public ItemValue Distance { get; set; }
        public ItemValue ElapsedTime { get; set; }
        public ItemValue Pace { get; set; }
        public ItemValue Heartrate { get; set; }
        public ItemValue Lactate { get; set; }
    }
}
