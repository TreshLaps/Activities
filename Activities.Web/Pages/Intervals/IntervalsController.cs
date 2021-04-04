using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Activities.Core.Extensions;
using Activities.Strava.Authentication;
using Activities.Strava.Endpoints;
using Activities.Strava.Endpoints.Models;
using Microsoft.AspNetCore.Mvc;

namespace Activities.Web.Pages.Intervals
{
    [ApiController]
    [Route("api/[controller]")]
    [StravaAuthenticationFilter]
    public class IntervalsController : ControllerBase
    {
        private readonly ActivitiesClient _activitiesClient;

        public IntervalsController(ActivitiesClient activitiesClient)
        {
            _activitiesClient = activitiesClient;
        }

        [HttpGet]
        public async Task<dynamic> Get(string type = "Run", string duration = "LastMonths", int year = 0, double? minPace = null, double? maxPace = null, bool outliersFilter = false)
        {
            var stravaAthlete = await HttpContext.TryGetStravaAthlete();
            var activities = (await _activitiesClient.GetActivities(stravaAthlete.AccessToken, stravaAthlete.AthleteId)).AsEnumerable();
            GroupKey groupKey;
            DateTime endDate;

            if (type != null && type != "All")
            {
                activities = activities.Where(activity => activity.Type == type);
            }

            if (duration == "LastMonths")
            {
                endDate = DateTime.Today.GetStartOfWeek().AddDays(-7 * 20);
                activities = activities.Where(activity => activity.StartDate >= endDate);
                groupKey = GroupKey.Week;
            }
            else if (duration == "LastYear")
            {
                endDate = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 01).AddYears(-1);
                activities = activities.Where(activity => activity.StartDate >= endDate);
                groupKey = GroupKey.Month;
            }
            else if (duration == "Year")
            {
                endDate = new DateTime(year, 01, 01);
                activities = activities.Where(activity => activity.StartDate >= endDate);
                groupKey = GroupKey.Month;
            }
            else
            {
                endDate = new DateTime(DateTime.Today.Year, 01, 01);
                activities = activities.Where(activity => activity.StartDate >= endDate);
                groupKey = GroupKey.Month;
            }

            var detailedActivities = await activities.ForEachAsync(4, activity => _activitiesClient.GetActivity(stravaAthlete.AccessToken, activity.Id));
            var intervalActivities = detailedActivities
                .Select(
                    activity => new
                    {
                        Activity = activity,
                        IntervalLaps = activity.Laps?
                            .Where(lap => IsIntervalWithinPace(lap, minPace, maxPace))
                            .ToList()
                    })
                .Where(activity => activity.IntervalLaps?.Any() == true)
                .ToList();

            var allLaps = intervalActivities.SelectMany(activity => activity.IntervalLaps).ToList();
            var maxDistance = allLaps.Any() ? allLaps.Max(lap => lap.Distance) : 0;
            var maxDuration = allLaps.Any() ? allLaps.Max(lap => lap.ElapsedTime) : 0;
            var maxSpeed = allLaps.Any() ? allLaps.Max(lap => lap.AverageSpeed) : 0;
            var maxHeartrate = allLaps.Any() ? allLaps.Max(lap => lap.AverageHeartrate) : 0;

            var intervalGroups = intervalActivities
                .GroupByDate(groupKey, activity => activity.Activity.StartDate, endDate);

            var intervals = intervalGroups
                .Select(month => new
                {
                    Date = month.Key,
                    Activities = month.Value
                        .Select(activity =>
                        {
                            return new
                            {
                                activity.Activity.Id,
                                Date = activity.Activity.StartDate.ToString("ddd dd. MMM yyyy"),
                                activity.Activity.Name,
                                activity.Activity.Description,
                                Interval_AverageSpeed = activity.IntervalLaps.Average(lap => lap.AverageSpeed).ToMinPerKmString(),
                                Interval_AverageHeartrate = $"{activity.IntervalLaps.Average(lap => lap.AverageHeartrate):0} bpm",
                                Interval_Laps = GetLapsResult(activity.IntervalLaps, maxDistance, maxSpeed, maxHeartrate, maxDuration),
                                Laktat = GetLactate(activity.Activity)
                            };
                        })
                        .ToList()
                })
                .ToList();
            
            var measurements = intervalGroups
                .Select(month =>
                {
                    if (!month.Value.Any())
                    {
                        return new { 
                            Date = string.Empty, 
                            Lactate = (double?) null
                        };
                    }
                    
                    var measures = month.Value
                        .Select(activity => GetLactate(activity.Activity))
                        .Where(activity => activity.Any())
                        .Select(activity => activity.Average())
                        .ToList();

                    var averageFileTime = (long)month.Value.Average(activity => activity.Activity.StartDate.ToFileTime());
                    var averageDate = DateTime.FromFileTime(averageFileTime);
                    
                    return new
                    {
                        Date = averageDate.ToString("yyyy-MM-dd"),
                        Lactate = measures.Any() ? (double?)Math.Round(measures.Median(), 1) : null
                    };
                })
                .Where(item => item.Lactate.HasValue)
                .ToList();
            
            var allMeasurements = intervalActivities
                .Select(activity => new
                {
                    Date = activity.Activity.StartDate,
                    Lactate = GetLactate(activity.Activity)
                })
                .SelectMany(activity => activity.Lactate.Select(lactate => new
                {
                    Date = activity.Date,
                    Lactate = lactate
                }))
                .ToList();
            
            var distances = detailedActivities
                .GroupByDate(groupKey, activity => activity.StartDate, endDate)
                .Select(month =>
                {
                    var intervalsForMonth = intervalGroups[month.Key];
                    var intervalDistance = intervalsForMonth == null ? 0.0 : Math.Round(intervalsForMonth.Where(activity => activity.IntervalLaps != null).Sum(activity => activity.IntervalLaps.Where(lap => IsIntervalWithinPace(lap, minPace, maxPace)).Sum(lap => lap.Distance)) / 1000 , 2);
                    
                    return new
                    {
                        Date = month.Key,
                        NonIntervalDistance = Math.Round((month.Value.Sum(activity => activity.Distance) / 1000) - intervalDistance, 2),
                        IntervalDistance = intervalDistance
                    };
                })
                .ToList();
            
            var paces = intervalGroups
                .Select(month =>
                {
                    var shortPaces = new List<double>();
                    var mediumPaces = new List<double>();
                    var longPaces = new List<double>();
                    var shortPaceMaxThreshold = 2 * 60;
                    var mediumPaceMaxThreshold = 10 * 60;

                    foreach (var activity in month.Value)
                    {
                        if (activity.IntervalLaps.Any(lap => lap.ElapsedTime < shortPaceMaxThreshold))
                        {
                            shortPaces.Add(activity.IntervalLaps.Where(lap => lap.ElapsedTime < shortPaceMaxThreshold).Average(lap => lap.AverageSpeed));
                        }
                        
                        if (activity.IntervalLaps.Any(lap => lap.ElapsedTime >= shortPaceMaxThreshold && lap.ElapsedTime < mediumPaceMaxThreshold))
                        {
                            mediumPaces.Add(activity.IntervalLaps.Where(lap => lap.ElapsedTime >= shortPaceMaxThreshold && lap.ElapsedTime < mediumPaceMaxThreshold).Average(lap => lap.AverageSpeed));
                        }
                        
                        if (activity.IntervalLaps.Any(lap => lap.ElapsedTime >= mediumPaceMaxThreshold))
                        {
                            longPaces.Add(activity.IntervalLaps.Where(lap => lap.ElapsedTime >= mediumPaceMaxThreshold).Average(lap => lap.AverageSpeed));
                        }
                    }
                    
                    var averageShortPace = shortPaces.Any() ? shortPaces.Average() : 0;
                    var averageMediumPace = mediumPaces.Any() ? mediumPaces.Average() : 0;
                    var averageLongPace = longPaces.Any() ? longPaces.Average() : 0;

                    var shortString = averageShortPace > 0 ? $"\r\n- Short: {averageShortPace.ToMinPerKmString()} (< 2 min)" : null;
                    var mediumString = averageMediumPace > 0 ? $"\r\n- Medium: {averageMediumPace.ToMinPerKmString()}" : null;
                    var longString = averageLongPace > 0 ? $"\r\n- Long: {averageLongPace.ToMinPerKmString()} (> 10 min)" : null;
                    
                    return new
                    {
                        Date = month.Key,
                        AverageShortPace = averageShortPace,
                        AverageMediumPace = averageMediumPace,
                        AverageLongPace = averageLongPace,
                        Label = $"{month.Key}{shortString}{mediumString}{longString}\r\n\r\nActivities: {month.Value.Count()}"
                    };
                })
                .ToList();

            return new
            {
                Intervals = intervals,
                Measurements = measurements,
                AllMeasurements = allMeasurements,
                Distances = distances,
                Paces = paces
            };
        }

        private List<LapResult> GetLapsResult(List<Lap> laps, double? maxDistance = null, double? maxSpeed = null, double? maxHeartrate = null, double? maxDuration = null)
        {
            if (laps == null)
            {
                return new List<LapResult>();
            }

            var maxLapDistance = maxDistance ?? laps.Max(lap => lap.Distance);
            var maxLapDuration = maxDuration ?? laps.Max(lap => lap.ElapsedTime);
            var maxLapSpeed = maxSpeed ?? laps.Max(lap => lap.AverageSpeed);
            var maxLapHeartrate = maxHeartrate ?? laps.Max(lap => lap.AverageHeartrate);
            
            return laps
                .Select(lap => new LapResult(lap, maxLapDistance, maxLapSpeed, maxLapHeartrate, maxLapDuration))
                .ToList();
        }

        private bool IsIntervalWithinPace(Lap lap, double? minPace, double? maxPace)
        {
            return lap.IsInterval && (minPace == null || lap.AverageSpeed >= minPace.Value.ToMetersPerSecond()) && (maxPace == null || lap.AverageSpeed <= maxPace.Value.ToMetersPerSecond());
        }

        private IReadOnlyList<double> GetLactate(DetailedActivity activity)
        {
            var result = new List<double>();

            if (activity.Lactate.HasValue)
            {
                result.Add(activity.Lactate.Value);
            }

            if (activity.Laps == null)
            {
                return result;
            }

            foreach (var lap in activity.Laps)
            {
                if (lap.Lactate.HasValue)
                {
                    result.Add(lap.Lactate.Value);
                }
            }

            return result;
        }
    }

    public class LapResult
    {
        public LapResult(Lap lap, double maxDistance, double maxSpeed, double maxHeartrate, double maxDuration)
        {
            Id = lap.Id;
            IsInterval = lap.IsInterval;
            Distance = lap.Distance;
            AverageSpeed = lap.AverageSpeed;
            AverageHeartrate = (int)lap.AverageHeartrate;
            ElapsedTime = lap.ElapsedTime;
            Lactate = lap.Lactate;

            DistanceFactor = 1.0 / Math.Round(maxDistance / 1000, 1) * Math.Round(lap.Distance / 1000, 1);
            AverageSpeedFactor = 1.0 / maxSpeed * lap.AverageSpeed;
            AverageHeartrateFactor = Math.Max(1.0 / (maxHeartrate - 100) * (lap.AverageHeartrate - 100), 0.0);
            DurationFactor = 1.0 / maxDuration * lap.ElapsedTime;
        }


        public long Id { get; init; }
        public bool IsInterval { get; init; }
        public double Distance { get; init; }
        public double AverageSpeed { get; init; }
        public int AverageHeartrate { get; init; }
        public int ElapsedTime { get; init; }
        public double? Lactate { get; init; }
        
        public double DistanceFactor { get; init; }
        public double AverageSpeedFactor { get; init; }
        public double AverageHeartrateFactor { get; init; }
        public double DurationFactor { get; init; }
    }
}
