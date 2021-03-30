using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Security.Claims;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Activities.Core.Extensions;
using Activities.Strava.Endpoints;
using Activities.Strava.Endpoints.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;

namespace Activities.Web.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    public class ActivitiesIntervalsController : ControllerBase
    {
        private readonly ActivitiesClient _activitiesClient;

        public ActivitiesIntervalsController(ActivitiesClient activitiesClient)
        {
            _activitiesClient = activitiesClient;
        }

        [HttpGet]
        public async Task<dynamic> Get(string type, string duration, int year, double? minPace, double? maxPace)
        {
            var stravaAthlete = await AuthenticationController.TryGetStravaAthlete(HttpContext);

            if (stravaAthlete == null)
            {
                return Unauthorized();
            }
            
            var activities = (await _activitiesClient.GetActivities(stravaAthlete.AccessToken, stravaAthlete.AthleteId)).AsEnumerable();

            if (type != null)
            {
                activities = activities.Where(activity => activity.Type == type);
            }

            if (duration == "Last12Months")
            {
                activities = activities.Where(activity => activity.StartDate >= new DateTime(DateTime.Today.Year, DateTime.Today.Month, 01).AddYears(-1));
            }
            else if (duration == "Last24Months")
            {
                activities = activities.Where(activity => activity.StartDate >= new DateTime(DateTime.Today.Year, DateTime.Today.Month, 01).AddYears(-2));
            }
            else if (duration == "Year")
            {
                activities = activities.Where(activity => activity.StartDate.Year == year);
            }
            else
            {
                activities = activities.Where(activity => activity.StartDate.Year == DateTime.Today.Year);
            }

            var detailedActivities = await activities.ForEachAsync(4, activity => _activitiesClient.GetActivity(stravaAthlete.AccessToken, activity.Id));

            var intervals = detailedActivities
                .Where(activity => activity.Laps?.Any(lap => IsIntervalWithinPace(lap, minPace, maxPace)) == true)
                .Select(activity =>
                {
                    var intervalLaps = activity.Laps
                        .Where(lap => IsIntervalWithinPace(lap, minPace, maxPace))
                        .ToList();

                    return new
                    {
                        activity.Id,
                        Date = activity.StartDate.ToString("dd.MM.yyyy"),
                        activity.Name,
                        activity.Description,
                        Interval_AverageSpeed = intervalLaps.Average(lap => lap.AverageSpeed).ToMinPerKmString(),
                        Interval_AverageHeartrate = (int)intervalLaps.Average(lap => lap.AverageHeartrate),
                        Interval_Laps = GetLapsResult(intervalLaps),
                        Laktat = GetLactate(activity)
                    };
                })
                .ToList();
            
            var measurements = detailedActivities
                .GroupBy(activity => activity.StartDate.ToString("yyyy-MM"))
                .Select(month =>
                {
                    var measures = month
                        .SelectMany(activity => GetLactate(activity))
                        .ToList();
                    
                    return new
                    {
                        Date = month.Key + "-15",
                        Lactate = measures.Any() ? (double?)measures.Median() : null
                    };
                })
                .Where(item => item.Lactate.HasValue)
                .ToList();
            
            var allMeasurements = detailedActivities
                .Where(activity => activity.Laps?.Any(lap => IsIntervalWithinPace(lap, minPace, maxPace)) == true)
                .Select(activity =>
                {
                    return new
                    {
                        Date = activity.StartDate,
                        Laktat = GetLactate(activity)
                    };
                })
                .SelectMany(activity => activity.Laktat.Select(lactate => new
                {
                    Date = activity.Date,
                    Lactate = lactate
                }))
                .ToList();
            
            var distances = detailedActivities
                .GroupBy(activity => activity.StartDate.ToString("MMM yy"))
                .Select(month =>
                {
                    var intervalDistance = Math.Round(month.Where(activity => activity.Laps != null).Sum(activity => activity.Laps.Where(lap => IsIntervalWithinPace(lap, minPace, maxPace)).Sum(lap => lap.Distance)) / 1000, 2);
                    
                    return new
                    {
                        Date = month.Key,
                        NonIntervalDistance = Math.Round((month.Sum(activity => activity.Distance) / 1000) - intervalDistance, 2),
                        IntervalDistance = intervalDistance
                    };
                })
                .ToList();
            
            var paces = detailedActivities
                .GroupBy(activity => activity.StartDate.ToString("MMM yy"))
                .Select(month =>
                {
                    var monthActivities = month
                        .Where(activity => activity.Laps?.Any(lap => IsIntervalWithinPace(lap, minPace, maxPace)) == true)
                        .ToList();
                    
                    var averagePace = monthActivities.Any() ? monthActivities.Average(activity => activity.Laps.Where(lap => IsIntervalWithinPace(lap, minPace, maxPace)).Average(lap => lap.AverageSpeed)) : 0;
                    
                    return new
                    {
                        Date = month.Key,
                        IntervalPace = averagePace,
                        Label = $"{month.Key} - {averagePace.ToMinPerKmString()} ({monthActivities.Count} activities)"
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

        private List<LapResult> GetLapsResult(List<Lap> laps)
        {
            if (laps == null)
            {
                return new List<LapResult>();
            }

            var maxDistance = laps.Max(lap => lap.Distance);
            var maxDuration = laps.Max(lap => lap.ElapsedTime);
            var maxSpeed = laps.Max(lap => lap.AverageSpeed);
            var maxHeartrate = laps.Max(lap => lap.AverageHeartrate);
            
            return laps
                .Select(lap => new LapResult(lap, maxDistance, maxSpeed, maxHeartrate, maxDuration))
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

        [HttpGet("month")]
        public async Task<dynamic> GetMonth(double minPace)
        {
            var accessToken = await HttpContext.GetTokenAsync("access_token");
            var athleteId = Convert.ToInt64(HttpContext.User.Claims.First(claim => claim.Type == ClaimTypes.NameIdentifier).Value);
            var detailedActivities = new List<DetailedActivity>();
            
            var activities = await _activitiesClient.GetActivities(accessToken, athleteId);
            
            foreach (var activity in activities.Where(activity => activity.Type == "Run" && activity.StartDate > DateTime.Today.AddMonths(-24)))
            {
                var activityDetails = await _activitiesClient.GetActivity(accessToken, activity.Id);
                detailedActivities.Add(activityDetails);
            }

            return detailedActivities
                .Where(activity => activity.Laps?.Any(lap => lap.IsInterval) == true)
                .Select(activity =>
                {
                    var intervalLaps = activity.Laps
                        .Where(lap => lap.IsInterval)
                        .ToList();

                    return new
                    {
                        Date = activity.StartDate,
                        Interval_AverageSpeed = intervalLaps.Average(lap => lap.AverageSpeed),
                        Interval_AverageHeartrate = (int)intervalLaps.Average(lap => lap.AverageHeartrate),
                        Distance = intervalLaps.Sum(lap => lap.Distance),
                        Laktat = GetLactate(activity)
                    };
                })
                .Where(activity => activity.Laktat.Any())
                .Where(activity => activity.Interval_AverageSpeed >= minPace.ToMetersPerSecond())
                .GroupBy(activity => activity.Date.ToString("MMM yyyy"))
                .Select(
                    month => new
                    {
                        Month = month.Key,
                        AverageSpeed = month.Average(activity => activity.Interval_AverageSpeed).ToMinPerKmString(),
                        AverageHeartrate = (int)month.Average(activity => activity.Interval_AverageHeartrate),
                        Distance = month.Sum(activity => activity.Distance).ToKmString(),
                        Laktat = month.SelectMany(activity => activity.Laktat).Average(),
                        MedianLaktat = month.SelectMany(activity => activity.Laktat).Median(),
                        MinLaktat = month.SelectMany(activity => activity.Laktat).Min(),
                        MaxLaktat = month.SelectMany(activity => activity.Laktat).Max(),
                        Measures = month.SelectMany(activity => activity.Laktat).Count()
                    })
                .Select(month => $"{month.Month}: {month.AverageSpeed}, {month.AverageHeartrate}, {month.Distance}, Laktat: {month.Laktat:0.0}, {month.MedianLaktat:0.0} ({month.MinLaktat:0.0}, {month.MaxLaktat:0.0}) {month.Measures} samples")
                .ToList();
        }
    }

    public class LapResult
    {
        public LapResult(Lap lap, double maxDistance, double maxSpeed, double maxHeartrate, double maxDuration)
        {
            Id = lap.Id;
            Distance = lap.Distance.ToKmString();
            AverageSpeed = lap.AverageSpeed.ToMinPerKmString();
            Heartrate = $"{lap.AverageHeartrate:0} bpm";
            Duration = TimeSpan.FromSeconds(lap.ElapsedTime).ToString(@"mm\:ss");
            Lactate = lap.Lactate?.ToString("0.0");

            DistanceFactor = 1.0 / maxDistance * lap.Distance;
            AverageSpeedFactor = 1.0 / maxSpeed * lap.AverageSpeed;
            HeartrateFactor = 1.0 / maxHeartrate * lap.AverageHeartrate;
            DurationFactor = 1.0 / maxDuration * lap.ElapsedTime;
        }

        public long Id { get; init; }
        public string Distance { get; init; }
        public string AverageSpeed { get; init; }
        public string Heartrate { get; init; }
        public string Duration { get; init; }
        public string Lactate { get; init; }
        
        public double DistanceFactor { get; init; }
        public double AverageSpeedFactor { get; init; }
        public double HeartrateFactor { get; init; }
        public double DurationFactor { get; init; }
    }
}
