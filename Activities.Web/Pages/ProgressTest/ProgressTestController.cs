using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
    public class ProgressTestController : ControllerBase
    {
        private readonly ActivitiesClient _activitiesClient;

        public ProgressTestController(ActivitiesClient activitiesClient)
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
                Week = await GetList(activities, GroupKey.Week),
                Month = await GetList(activities, GroupKey.Month)
            };
        }
        
        private async Task<List<ResultItem>> GetList(IEnumerable<SummaryActivity> activities, GroupKey groupBy)
        {
            var stravaAthlete = await HttpContext.TryGetStravaAthlete();
            DateTime endDate;
            
            if (groupBy == GroupKey.Week)
            {
                endDate = DateTime.Today.GetStartOfWeek().AddDays(-7 * 9);
                activities = activities.Where(activity => activity.StartDate >= endDate);
            }
            else
            {
                endDate = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 01).AddMonths(-6);
                activities = activities.Where(activity => activity.StartDate >= endDate);
            }

            var detailedActivities = await activities.ForEachAsync(4, activity => _activitiesClient.GetActivity(stravaAthlete.AccessToken, activity.Id));

            var result = detailedActivities
                .GroupByDate(groupBy, activity => activity.StartDate, endDate)
                .Select(group =>
                {
                    if (group.Value?.Any() != true)
                    {
                        return new ResultItem
                        {
                            Name = group.Key,
                            ActivityCount = 0
                        };
                    }
                    
                    ResultItemValue intervalDistance = null;
                    ResultItemValue intervalPace = null;
                    ResultItemValue intervalElapsedTime = null;
                    ResultItemValue intervalHeartrate = null;
                    ResultItemValue lactate = null;

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
                        intervalDistance = new ResultItemValue(intervalLaps.Sum(lap => lap.Distance));
                        intervalPace = new ResultItemValue(intervalLaps.Average(lap => lap.AverageSpeed));
                        intervalElapsedTime = new ResultItemValue(intervalLaps.Sum(lap => lap.ElapsedTime));
                        intervalHeartrate = intervalLaps.Any(lap => lap.AverageHeartrate > 0)
                            ? new ResultItemValue(intervalLaps.Where(lap => lap.AverageHeartrate > 0).Average(lap => lap.AverageHeartrate))
                            : null;
                    }

                    if (lactates.Any())
                    {
                        lactate = new ResultItemValue(lactates.Average());
                    }
                    
                    return new ResultItem
                    {
                        Name = group.Key,
                        ActivityCount = group.Value.Count,
                        Distance = new ResultItemValue(group.Value.Sum(activity => activity.Distance)),
                        Pace = new ResultItemValue(group.Value.Average(activity => activity.AverageSpeed)),
                        ElapsedTime = new ResultItemValue(group.Value.Sum(activity => activity.ElapsedTime)),
                        Heartrate = group.Value.Any(activity => activity.AverageHeartrate > 0) ? new ResultItemValue(group.Value.Where(activity => activity.AverageHeartrate > 0).Average(activity => activity.AverageHeartrate)) : null,
                        IntervalDistance = intervalDistance,
                        IntervalPace = intervalPace,
                        IntervalElapsedTime = intervalElapsedTime,
                        IntervalHeartrate = intervalHeartrate,
                        Lactate = lactate
                    };
                })
                .ToList();

            AppendFactor(result, item => item.Distance);
            AppendFactor(result, item => item.Pace, -3);
            AppendFactor(result, item => item.ElapsedTime);
            AppendFactor(result, item => item.Heartrate, -100);
            AppendFactor(result, item => item.IntervalDistance);
            AppendFactor(result, item => item.IntervalPace, -3);
            AppendFactor(result, item => item.IntervalElapsedTime);
            AppendFactor(result, item => item.IntervalHeartrate, -100);
            AppendFactor(result, item => item.Lactate);

            return result;
        }

        private void AppendFactor(List<ResultItem> items, Func<ResultItem, ResultItemValue> propertyFunc, double valueOffset = 0)
        {
            var properties = items
                .Where(item => propertyFunc(item) != null)
                .Select(propertyFunc)
                .ToList();

            if (!properties.Any())
            {
                return;
            }

            var maxValue = properties.Max(property => property.Value);

            foreach (var property in properties)
            {
                property.Factor = Math.Round(1.0 / (maxValue + valueOffset) * (property.Value + valueOffset), 2);
            }
        }
    }

    public class ResultItem
    {
        public string Name { get; set; }
        public int ActivityCount { get; set; }
        public ResultItemValue Distance { get; set; }
        public ResultItemValue Pace { get; set; }
        public ResultItemValue ElapsedTime { get; set; }
        public ResultItemValue Heartrate { get; set; }
        
        public ResultItemValue IntervalDistance { get; set; }
        public ResultItemValue IntervalPace { get; set; }
        public ResultItemValue IntervalElapsedTime { get; set; }
        public ResultItemValue IntervalHeartrate { get; set; }
        
        public ResultItemValue Lactate { get; set; }
    }

    public class ResultItemValue
    {
        public double Value { get; set; }
        public double Factor { get; set; }
        
        public ResultItemValue(double value)
        {
            Value = value;
        }
    }
}
