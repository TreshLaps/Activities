using System.Linq;
using System.Threading.Tasks;
using Activities.Strava.Activities;
using Activities.Strava.Authentication;
using Activities.Strava.Endpoints;
using Activities.Web.Pages.Activities.Models;
using Microsoft.AspNetCore.Mvc;

namespace Activities.Web.Pages.Activities
{
    public class ActivitiesController : BaseActivitiesController
    {
        public ActivitiesController(ActivitiesClient activitiesClient) : base(activitiesClient)
        {
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
            var activities = (await GetActivitiesGroupByDate(filterRequest))
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
}
