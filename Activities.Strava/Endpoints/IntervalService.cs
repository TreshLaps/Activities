using System.Collections.Generic;
using System.Linq;
using Activities.Strava.Endpoints.Models;

namespace Activities.Strava.Endpoints
{
    public static class IntervalService
    {
        public static void TagIntervalLaps(this IEnumerable<DetailedActivity> activities)
        {
            foreach (var activity in activities)
            {
                if (activity.Laps == null || activity.Laps.Count(lap => lap.Distance > 200 && lap.ElapsedTime > 60) < 6)
                {
                    continue;
                }
                
                var laps = activity.Laps
                    .Where(lap => lap.Distance > 200 && lap.ElapsedTime > 60)
                    .ToList();
                    
                var medianSpeed = laps
                    .OrderBy(lap => lap.AverageSpeed)
                    .Skip(laps.Count / 2)
                    .First()
                    .AverageSpeed;

                var speedDifference = 0.5;

                var intervalLaps = laps
                    .Where(lap => lap.AverageSpeed >= medianSpeed - speedDifference)
                    .ToList();
                    
                var medianDistance = intervalLaps
                    .OrderBy(lap => lap.Distance)
                    .Skip(intervalLaps.Count / 2)
                    .First()
                    .Distance;
                    
                intervalLaps = intervalLaps
                    .Where(lap => lap.Distance >= medianDistance / 3 && lap.Distance <= medianDistance * 3)
                    .ToList();

                foreach (var lap in intervalLaps)
                {
                    lap.IsInterval = true;
                }
            }
        }
    }
}
