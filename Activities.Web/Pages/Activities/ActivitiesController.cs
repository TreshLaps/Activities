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
using Activities.Web.Pages.Activities.Models;
using Microsoft.AspNetCore.Mvc;
using Activity = Activities.Web.Pages.Activities.Models.Activity;

namespace Activities.Web.Pages.Activities;

public class ActivitiesController : BaseActivitiesController
{
    private readonly IntervalStatisticsService _intervalStatisticsService;

    public ActivitiesController(
        ActivitiesClient activitiesClient,
        IntervalStatisticsService intervalStatisticsService) : base(activitiesClient)
    {
        _intervalStatisticsService = intervalStatisticsService;
    }

    [HttpGet("{id}")]
    public async Task<ActivityResult> GetActivity(long id)
    {
        var stravaAthlete = await HttpContext.TryGetStravaAthlete();
        var activity = await _activitiesClient.GetActivity(stravaAthlete.AccessToken, stravaAthlete.AthleteId, id);
        var averageIntervalPace = 0.0;
        var last60DaysIntervalPace = 0.0;

        if (activity.Laps?.Any(lap => lap.IsInterval) == true)
        {
            averageIntervalPace = activity.Laps.Where(lap => lap.IsInterval).Average(lap => lap.AverageSpeed);
            last60DaysIntervalPace =
                await _intervalStatisticsService.GetAveragePace(stravaAthlete, TimeSpan.FromDays(60), activity.Type);
        }

        return new ActivityResult
        {
            Activity = activity,
            AverageIntervalPace = averageIntervalPace,
            Last60DaysIntervalPace = last60DaysIntervalPace
        };
    }

    [HttpPost("{id}/reimport")]
    public void RemoveActivity(long id)
    {
        _activitiesClient.RemoveActivity(id);
    }

    [HttpPost("{id}/toggleIgnoreIntervals")]
    public Task ToggleIgnoreIntervals(long id)
    {
        return _activitiesClient.ToggleIgnoreIntervals(id);
    }

    [HttpGet]
    public async Task<ActivitiesResult> Get([FromQuery] FilterRequest filterRequest)
    {
        var activities = (await GetActivitiesGroupByDate(filterRequest))
            .Select(
                month => new ActivityGroup
                {
                    Name = month.Key,
                    Items = month.Value.Select(
                            activitySummary => new Activity
                            {
                                Id = activitySummary.Activity.Id,
                                Date = activitySummary.Activity.StartDate.ToString("ddd dd."),
                                Name = activitySummary.Activity.Name,
                                Type = activitySummary.Activity.Type,
                                IsBislettInterval = activitySummary.Activity.IsBislettInterval,
                                IsRace = activitySummary.Activity.IsRace,
                                Description = activitySummary.Activity.Description,
                                Distance = activitySummary.Distance,
                                ElapsedTime = activitySummary.ElapsedTime,
                                Pace = activitySummary.Pace,
                                Heartrate = activitySummary.Heartrate,
                                Lactate = activitySummary.Lactate,
                                Feeling = activitySummary.Feeling
                            })
                        .ToList()
                })
            .ToList();

        return new ActivitiesResult
        {
            Activities = activities
        };
    }

    [HttpGet("summary")]
    public async Task<List<Activity>> GetSummary()
    {
        var activities = (await GetActivitySummaries(
                new FilterRequest
                {
                    Duration = FilterDuration.LastMonths
                }))
            .Take(6)
            .Select(
                activitySummary => new Activity
                {
                    Id = activitySummary.Activity.Id,
                    Date = activitySummary.Activity.StartDate.ToString("ddd dd."),
                    Name = activitySummary.Activity.Name,
                    Type = activitySummary.Activity.Type,
                    IsBislettInterval = activitySummary.Activity.IsBislettInterval,
                    IsRace = activitySummary.Activity.IsRace,
                    Description = activitySummary.Activity.Description,
                    Distance = activitySummary.Distance,
                    ElapsedTime = activitySummary.ElapsedTime,
                    Pace = activitySummary.Pace,
                    Heartrate = activitySummary.Heartrate,
                    Lactate = activitySummary.Lactate,
                    Feeling = activitySummary.Feeling
                })
            .ToList();

        return activities;
    }

    [HttpGet("{id}/similar")]
    public async Task<dynamic> GetSimilarActivity(long id)
    {
        var stravaAthlete = await HttpContext.TryGetStravaAthlete();
        var mainActivity = await _activitiesClient.GetActivity(stravaAthlete.AccessToken, stravaAthlete.AthleteId, id);

        if (mainActivity.Laps?.Any(lap => lap.IsInterval) != true)
        {
            return NotFound();
        }

        var activities = (await GetDetailedActivities(
                new FilterRequest
                {
                    Type = mainActivity.Type,
                    Duration = FilterDuration.Custom,
                    StartDate = DateTime.UtcNow,
                    EndDate = DateTime.UtcNow.AddYears(-3)
                }))
            .Where(activity => activity.Laps?.Any(lap => lap.IsInterval) == true)
            .Where(activity => IsSimilarActivity(mainActivity, activity))
            .ToList();

        var startDate = activities.OrderByDescending(activity => activity.StartDate).First().StartDate;
        var endDate = activities.OrderByDescending(activity => activity.StartDate).Last().StartDate;

        var groupedActivities = activities
            .ToActivitySummary(
                new FilterRequest
                {
                    DataType = FilterDataType.Interval
                })
            .GroupByDate(GroupKey.Month, activity => activity.Activity.StartDate, startDate, endDate)
            .Select(
                month => new ActivityGroup
                {
                    Name = month.Key,
                    Items = month.Value.Select(
                            activitySummary => new Activity
                            {
                                Id = activitySummary.Activity.Id,
                                Date = activitySummary.Activity.StartDate.ToString("ddd dd."),
                                Name = activitySummary.Activity.Name,
                                Type = activitySummary.Activity.Type,
                                IsBislettInterval = activitySummary.Activity.IsBislettInterval,
                                IsRace = activitySummary.Activity.IsRace,
                                Description = activitySummary.Activity.Description,
                                Distance = activitySummary.Distance,
                                ElapsedTime = activitySummary.ElapsedTime,
                                Pace = activitySummary.Pace,
                                Heartrate = activitySummary.Heartrate,
                                Lactate = activitySummary.Lactate,
                                Laps = new ItemValue(activitySummary.Activity.Laps.Count(lap => lap.IsInterval),
                                    ItemValueType.AverageNumber),
                                Feeling = activitySummary.Feeling
                            })
                        .ToList()
                })
            .ToList();

        return new ActivitiesResult
        {
            Activities = groupedActivities
        };
    }

    private bool IsSimilarActivity(DetailedActivity activity1, DetailedActivity activity2)
    {
        switch (activity1.IsBislettInterval)
        {
            case true when activity2.IsBislettInterval:
                return true;
            case true:
                return false;
        }

        if (activity1.StartLatlng?.Count != 2 || activity2.StartLatlng?.Count != 2)
        {
            return false;
        }

        if (Math.Abs(activity1.StartLatlng[0] - activity2.StartLatlng[0]) > 1 ||
            Math.Abs(activity1.StartLatlng[1] - activity2.StartLatlng[1]) > 1)
        {
            return false;
        }

        var lapsDifference =
            Math.Abs(activity1.Laps.Count(lap => lap.IsInterval) - activity2.Laps.Count(lap => lap.IsInterval));

        var lapsDistanceDifference = Math.Abs(
                                         activity1.Laps.Where(lap => lap.IsInterval).Average(lap => lap.Distance) -
                                         activity2.Laps.Where(lap => lap.IsInterval).Average(lap => lap.Distance)) /
                                     100;

        var segmentsDifference = GetSegmentDifference(GetIntervalSegments(activity1), GetIntervalSegments(activity2));

        var differenceScore = lapsDifference + lapsDistanceDifference + segmentsDifference;
        return differenceScore < 10;
    }

    private int GetSegmentDifference(List<long> segments1, List<long> segments2)
    {
        var difference = 0;
        difference += segments1.Count(segment => !segments2.Contains(segment));
        difference += segments2.Count(segment => !segments1.Contains(segment));
        return difference;
    }

    private List<long> GetIntervalSegments(DetailedActivity activity)
    {
        var intervalLaps = activity.Laps
            .Where(lap => lap.IsInterval)
            .Select(
                lap => new
                {
                    lap.StartDate,
                    EndDate = lap.StartDate.AddSeconds(lap.ElapsedTime)
                })
            .ToList();

        return activity.SegmentEfforts
            .Where(segment =>
                intervalLaps.Any(lap => segment.StartDate >= lap.StartDate && segment.StartDate < lap.EndDate))
            .Select(segment => segment.Segment.Id)
            .Distinct()
            .ToList();
    }
}