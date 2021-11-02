using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Activities.Core.Extensions;
using Activities.Strava.Authentication.Models;
using Activities.Strava.Endpoints;
using Activities.Strava.Endpoints.Models;

namespace Activities.Strava.Activities
{
    public class IntervalStatisticsService
    {
        private readonly ActivitiesClient _activitiesClient;

        public IntervalStatisticsService(ActivitiesClient activitiesClient)
        {
            _activitiesClient = activitiesClient;
        }

        public async Task<double> GetAveragePace(StravaAthleteToken stravaAthleteToken, TimeSpan fromTime, string activityType)
        {
            var activities = (await _activitiesClient.GetActivities(stravaAthleteToken.AccessToken, stravaAthleteToken.AthleteId))
                .Where(activity => activity.Type == activityType)
                .Where(activity => activity.StartDate >= DateTime.Now - fromTime)
                .ToList();

            var intervalLaps = (await activities.ForEachAsync(4, activity => _activitiesClient.GetActivity(stravaAthleteToken.AccessToken, activity.Id)))
                .Where(activity => activity?.Laps?.Any(lap => lap.IsInterval) == true)
                .SelectMany(activity => activity.Laps.Where(lap => lap.IsInterval))
                .ToList();

            return intervalLaps.Average();
        }
    }

    public static class LapExtensions
    {
        public static double Average(this IEnumerable<Lap> laps)
        {
            var totalTime = 0.0;
            var pace = 0.0;

            foreach (var lap in laps)
            {
                totalTime += lap.ElapsedTime;
                pace += lap.AverageSpeed * lap.ElapsedTime;
            }

            return pace / totalTime;
        }
    }
}