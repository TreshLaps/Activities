using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Activities.Core.DataTables;
using Activities.Core.Extensions;
using Activities.Strava.Activities;
using Activities.Strava.Authentication;
using Activities.Strava.Endpoints;
using Activities.Web.Pages.Progress.Models;
using Microsoft.AspNetCore.Mvc;

namespace Activities.Web.Pages.Progress
{
    public class ProgressController : BaseActivitiesController
    {
        public ProgressController(ActivitiesClient activitiesClient) : base(activitiesClient)
        {
        }

        [HttpGet]
        public async Task<List<ProgressResultItem>> Get([FromQuery] FilterRequest filterRequest)
        {
            var result = (await GetActivitiesGroupByDate(filterRequest))
                .Select(
                    group =>
                    {
                        if (group.Value?.Any() != true)
                        {
                            return new ProgressResultItem
                            {
                                Name = group.Key
                            };
                        }

                        return new ProgressResultItem
                        {
                            Name = group.Key,
                            ActivityCount = ItemValue.TryCreate(group.Value.Count, ItemValueType.Number),
                            Distance = ItemValue.TryCreate(
                                group.Value.Where(item => item.Distance != null).SumOrNull(activity => activity.Distance?.Value),
                                ItemValueType.DistanceInMeters),
                            ElapsedTime = ItemValue.TryCreate(
                                group.Value.Where(item => item.ElapsedTime != null).SumOrNull(activity => activity.ElapsedTime?.Value),
                                ItemValueType.TimeInSeconds),
                            Pace = ItemValue.TryCreate(
                                group.Value.Where(item => item.Pace != null)
                                    .AverageBy(activity => activity.ElapsedTime.Value, activity => activity.Pace.Value),
                                ItemValueType.MetersPerSecond),
                            Heartrate = ItemValue.TryCreate(
                                group.Value.Where(item => item.Heartrate != null).AverageOrNull(activity => activity.Heartrate?.Value),
                                ItemValueType.Heartrate),
                            Lactate = ItemValue.TryCreate(
                                group.Value.Where(item => item.Lactate != null).AverageOrNull(activity => activity.Lactate?.Value),
                                ItemValueType.Lactate)
                        };
                    })
                .ToList();

            result.CalculateFactorsFor(item => item.ActivityCount);
            result.CalculateFactorsFor(item => item.Distance);
            result.CalculateFactorsFor(item => item.ElapsedTime);
            result.CalculateFactorsFor(item => item.Pace, true);
            result.CalculateFactorsFor(item => item.Heartrate, true);
            result.CalculateFactorsFor(item => item.Lactate, true);

            return result;
        }

        [HttpGet("summary")]
        public async Task<dynamic> GetSummary()
        {
            var stravaAthlete = await HttpContext.TryGetStravaAthlete();
            var fromDate = DateTime.Today.GetStartOfWeek().AddDays(-7 * 5);

            var activityTypes = (await _activitiesClient.GetActivities(stravaAthlete.AccessToken, stravaAthlete.AthleteId))
                .Where(activity => activity.StartDate >= fromDate)
                .GroupBy(activity => activity.Type)
                .OrderByDescending(group => group.Count())
                .Select(group => group.Key);

            var result = new List<dynamic>();
            var filterRequest = new FilterRequest
            {
                Duration = FilterDuration.Custom,
                GroupKey = GroupKey.Week,
                EndDate = fromDate
            };

            foreach (var type in activityTypes)
            {
                result.Add(
                    new
                    {
                        Name = type,
                        Summary = await Get(filterRequest with { Type = type })
                    });
            }

            return result;
        }
    }
}