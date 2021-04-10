using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Activities.Core.DataTables;
using Activities.Core.Extensions;
using Activities.Strava.Activities;
using Activities.Strava.Authentication;
using Activities.Strava.Endpoints;
using Activities.Strava.Endpoints.Models;
using Microsoft.AspNetCore.Mvc;

namespace Activities.Web.Pages.ProgressTest
{
    [ApiController]
    [Route("api/[controller]")]
    [StravaAuthenticationFilter]
    public class ProgressController : ControllerBase
    {
        private readonly ActivitiesClient _activitiesClient;

        public ProgressController(ActivitiesClient activitiesClient)
        {
            _activitiesClient = activitiesClient;
        }

        [HttpGet]
        public async Task<List<ProgressResultItem>> Get([FromQuery] FilterRequest filterRequest)
        {
            var stravaAthlete = await HttpContext.TryGetStravaAthlete();
            var activities = (await _activitiesClient.GetActivities(stravaAthlete.AccessToken, stravaAthlete.AthleteId))
                .Where(filterRequest.Keep)
                .ToList();

            var (startDate, endDate) = filterRequest.GetDateRange();
            return await GetProgress(activities, filterRequest.Duration == FilterDuration.LastMonths ? GroupKey.Week : GroupKey.Month, startDate, endDate, filterRequest.DataType);
        }

        [HttpGet("summary")]
        public async Task<dynamic> GetSummary()
        {
            var stravaAthlete = await HttpContext.TryGetStravaAthlete();
            var startDate = DateTime.Today;
            var endDate = DateTime.Today.GetStartOfWeek().AddDays(-7 * 5);
            
            var activities = (await _activitiesClient.GetActivities(stravaAthlete.AccessToken, stravaAthlete.AthleteId))
                .Where(activity => activity.StartDate >= endDate)
                .GroupBy(activity => activity.Type)
                .OrderByDescending(group => group.Count())
                .ToList();

            var result = new List<dynamic>();

            foreach (var activity in activities)
            {
                result.Add(new
                {
                    Name = activity.First().Type,
                    Summary = await GetProgress(activity.ToList(), GroupKey.Week, startDate, endDate)
                });
            }

            return result;
        }
        
        private async Task<List<ProgressResultItem>> GetProgress(IEnumerable<SummaryActivity> activities, GroupKey groupBy, DateTime startDate, DateTime endDate, FilterDataType dataType = FilterDataType.Activity)
        {
            var stravaAthlete = await HttpContext.TryGetStravaAthlete();
            var detailedActivities = await activities.ForEachAsync(4, activity => _activitiesClient.GetActivity(stravaAthlete.AccessToken, activity.Id));

            var result = detailedActivities
                .Where(activity => activity != null)
                .ToActivitySummary(dataType)
                .GroupByDate(groupBy, activity => activity.Activity.StartDate, startDate, endDate)
                .Select(group =>
                {
                    if (group.Value?.Any() != true)
                    {
                        return new ProgressResultItem
                        {
                            Name = group.Key,
                            ActivityCount = 0
                        };
                    }
                    
                    var heartrates = group.Value
                        .Where(item => item.Heartrate != null)
                        .Select(item => item.Heartrate.Value)
                        .ToList();
                    
                    var lactates = group.Value
                        .Where(item => item.Lactate != null)
                        .Select(item => item.Lactate.Value)
                        .ToList();
                    
                    return new ProgressResultItem
                    {
                        Name = group.Key,
                        ActivityCount = group.Value.Count,
                        Distance = new ItemValue(group.Value.Sum(item => item.Distance.Value), ItemValueType.DistanceInMeters),
                        ElapsedTime = new ItemValue(group.Value.Sum(item => item.ElapsedTime.Value), ItemValueType.TimeInSeconds),
                        Pace = new ItemValue(group.Value.Average(item => item.Pace.Value), ItemValueType.MetersPerSecond),
                        Heartrate = heartrates.Any() ? new ItemValue(heartrates.Average(), ItemValueType.Heartrate) : null,
                        Lactate = lactates.Any() ? new ItemValue(lactates.Average(), ItemValueType.Number) : null,
                    };
                })
                .ToList();
            
            result.CalculateFactorsFor(item => item.Distance);
            result.CalculateFactorsFor(item => item.ElapsedTime);
            result.CalculateFactorsFor(item => item.Pace, true);
            result.CalculateFactorsFor(item => item.Heartrate, true);
            result.CalculateFactorsFor(item => item.Lactate, true);

            return result;
        }
    }

    public class ProgressResultItem
    {
        public string Name { get; set; }
        public int ActivityCount { get; set; }
        public ItemValue Distance { get; set; }
        public ItemValue Pace { get; set; }
        public ItemValue ElapsedTime { get; set; }
        public ItemValue Heartrate { get; set; }
        public ItemValue Lactate { get; set; }
    }
}
