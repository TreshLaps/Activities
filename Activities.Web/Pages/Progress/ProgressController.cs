using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Activities.Core.DataTables;
using Activities.Core.Extensions;
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
        public async Task<dynamic> Get(string type = "Run")
        {
            var stravaAthlete = await HttpContext.TryGetStravaAthlete();
            var activities = await _activitiesClient.GetActivities(stravaAthlete.AccessToken, stravaAthlete.AthleteId);

            if (type != null && type != "All")
            {
                activities = activities.Where(activity => activity.Type == type).ToList();
            }

            return new
            {
                Week = await GetProgress(activities, GroupKey.Week, 5),
                Month = await GetProgress(activities, GroupKey.Month, 12)
            };
        }

        [HttpGet("summary")]
        public async Task<dynamic> GetSummary()
        {
            var stravaAthlete = await HttpContext.TryGetStravaAthlete();
            var activities = (await _activitiesClient.GetActivities(stravaAthlete.AccessToken, stravaAthlete.AthleteId))
                .Where(activity => activity.StartDate >= DateTime.Today.GetStartOfWeek().AddDays(-7 * 5))
                .GroupBy(activity => activity.Type)
                .OrderByDescending(group => group.Count())
                .ToList();

            var result = new List<dynamic>();

            foreach (var activity in activities)
            {
                result.Add(new
                {
                    Name = activity.First().Type,
                    Summary = await GetProgress(activity.ToList(), GroupKey.Week, 5)
                });
            }

            return result;
        }
        
        private async Task<List<ProgressResultItem>> GetProgress(IEnumerable<SummaryActivity> activities, GroupKey groupBy, int groupCount)
        {
            var stravaAthlete = await HttpContext.TryGetStravaAthlete();
            DateTime startDate;
            DateTime endDate;
            
            if (groupBy == GroupKey.Week)
            {
                startDate = DateTime.Today;
                endDate = DateTime.Today.GetStartOfWeek().AddDays(-7 * groupCount);
                activities = activities.Where(activity => activity.StartDate >= endDate);
            }
            else
            {
                startDate = DateTime.Today;
                endDate = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 01).AddMonths(groupCount * -1);
                activities = activities.Where(activity => activity.StartDate >= endDate);
            }

            var detailedActivities = await activities.ForEachAsync(4, activity => _activitiesClient.GetActivity(stravaAthlete.AccessToken, activity.Id));

            var result = detailedActivities
                .GroupByDate(groupBy, activity => activity.StartDate, startDate, endDate)
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
                    
                    ItemValue intervalDistance = null;
                    ItemValue intervalPace = null;
                    ItemValue intervalElapsedTime = null;
                    ItemValue intervalHeartrate = null;
                    ItemValue lactate = null;

                    var intervalLaps = group.Value
                        .Where(activity => activity.Laps?.Any(lap => lap.IsInterval) == true)
                        .SelectMany(activity => activity.Laps.Where(lap => lap.IsInterval))
                        .ToList();

                    var lactates = group.Value
                        .Select(
                            activity =>
                            {
                                if (activity.Lactate.HasValue)
                                {
                                    return activity.Lactate.Value;
                                }

                                var lactateLaps = activity.Laps?.Where(lap => lap.Lactate.HasValue).ToList();

                                if (lactateLaps?.Any() == true)
                                {
                                    return lactateLaps.Average(lap => lap.Lactate);
                                }

                                return null;
                            })
                        .Where(lactate => lactate.HasValue)
                        .Cast<double>()
                        .ToList();

                    if (intervalLaps.Any())
                    {
                        intervalDistance = new ItemValue(intervalLaps.Sum(lap => lap.Distance), ItemValueType.DistanceInMeters);
                        intervalPace = new ItemValue(intervalLaps.Average(lap => lap.AverageSpeed), ItemValueType.MetersPerSecond);
                        intervalElapsedTime = new ItemValue(intervalLaps.Sum(lap => lap.ElapsedTime), ItemValueType.TimeInSeconds);
                        intervalHeartrate = intervalLaps.Any(lap => lap.AverageHeartrate > 0)
                            ? new ItemValue(intervalLaps.Where(lap => lap.AverageHeartrate > 0).Average(lap => lap.AverageHeartrate), ItemValueType.Heartrate)
                            : null;
                    }

                    if (lactates.Any())
                    {
                        lactate = new ItemValue(lactates.Average(), ItemValueType.Number);
                    }
                    
                    return new ProgressResultItem
                    {
                        Name = group.Key,
                        ActivityCount = group.Value.Count,
                        Distance = new ItemValue(group.Value.Sum(activity => activity.Distance), ItemValueType.DistanceInMeters),
                        Pace = new ItemValue(group.Value.Average(activity => activity.AverageSpeed), ItemValueType.MetersPerSecond),
                        ElapsedTime = new ItemValue(group.Value.Sum(activity => activity.MovingTime), ItemValueType.TimeInSeconds),
                        Heartrate = group.Value.Any(activity => activity.AverageHeartrate > 0) ? new ItemValue(group.Value.Where(activity => activity.AverageHeartrate > 0).Average(activity => activity.AverageHeartrate), ItemValueType.Heartrate) : null,
                        IntervalDistance = intervalDistance,
                        IntervalPace = intervalPace,
                        IntervalElapsedTime = intervalElapsedTime,
                        IntervalHeartrate = intervalHeartrate,
                        Lactate = lactate
                    };
                })
                .ToList();
            
            result.CalculateFactorsFor(item => item.Distance);
            result.CalculateFactorsFor(item => item.Pace, -2.5);
            result.CalculateFactorsFor(item => item.ElapsedTime);
            result.CalculateFactorsFor(item => item.Heartrate, -100);
            result.CalculateFactorsFor(item => item.IntervalDistance);
            result.CalculateFactorsFor(item => item.IntervalPace, -2.5);
            result.CalculateFactorsFor(item => item.IntervalElapsedTime);
            result.CalculateFactorsFor(item => item.IntervalHeartrate, -100);
            result.CalculateFactorsFor(item => item.Lactate);

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
        
        public ItemValue IntervalDistance { get; set; }
        public ItemValue IntervalPace { get; set; }
        public ItemValue IntervalElapsedTime { get; set; }
        public ItemValue IntervalHeartrate { get; set; }
        
        public ItemValue Lactate { get; set; }
    }
}
