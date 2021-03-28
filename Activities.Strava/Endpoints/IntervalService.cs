using System;
using System.Collections.Generic;
using System.Linq;
using Activities.Strava.Endpoints.Models;

namespace Activities.Strava.Endpoints
{
    public static class IntervalService
    {
        // Update when logic is modified to trigger recalculation.
        private const string Version = "2021-03-28_19";

        public static bool TryTagIntervalLaps(this DetailedActivity activity)
        {
            if (activity._IntervalVersion == Version)
            {
                return false;
            }

            activity._IntervalVersion = Version;
                
            if (activity.Laps == null)
            {
                return true;
            }

            foreach (var lap in activity.Laps)
            {
                lap.IsInterval = false;
            }
                
            if (activity.Laps.Count < 7)
            {
                return true;
            }

            var minMaxLaps = activity.Laps
                .OrderBy(lap => lap.Distance)
                .Skip(2)
                .SkipLast(2)
                .ToList();

            if (Math.Abs(minMaxLaps.First().Distance - minMaxLaps.Last().Distance) < 100)
            {
                return true;
            }

            //if (activity.Laps.Count(lap => lap.Distance > 200 || lap.ElapsedTime > 60) < 6)
            //{
            //    return true;
            //}

            //var laps = activity.Laps
            //    .Where(lap => lap.Distance > 200 || lap.ElapsedTime > 60)
            //    .ToList();

            var speedGroup = activity.Laps
                .Where(lap => lap.ElapsedTime - lap.MovingTime < 10)
                .GroupBy(lap => Math.Floor(lap.AverageSpeed * 3.6))
                .OrderByDescending(s => s.Key)
                .ToList();
            
            var fastestGroup = speedGroup.FirstOrDefault(s => s.Count() > 1);

            if (fastestGroup == null)
            {
                return true;
            }
                
            var avgSpeedInKmHour = fastestGroup.Average(lap => lap.AverageSpeed * 3.6);
            var speedDifference = avgSpeedInKmHour;
            var intervalLaps = new List<Lap>();

            for (var i = 0; i < speedGroup.Count; i++)
            {
                var group = speedGroup[i];

                if (group.Key >= speedDifference - 1)
                {
                    speedDifference = group.Key;
                    intervalLaps.AddRange(group);
                }
            }

            foreach (var lap in intervalLaps)
            {
                lap.IsInterval = true;
            }

            var revertedLaps = new List<int>();
            
            for (var i = 1; i < activity.Laps.Count - 1; i++)
            {
                var lap = activity.Laps[i];

                if (lap.IsInterval && activity.Laps[i - 1].IsInterval && activity.Laps[i + 1].IsInterval)
                {
                    revertedLaps.Add(i);
                }
            }

            if (revertedLaps.Count >= 1)
            {
                foreach (var lap in activity.Laps)
                {
                    lap.IsInterval = false;
                }
            }

            if (activity.Laps.Count(lap => lap.IsInterval) < 4)
            {
                foreach (var lap in activity.Laps)
                {
                    lap.IsInterval = false;
                }
            }

            //var speedDifferenceInKmHour = 0.5;

            //var intervalLaps = laps
            //    .Where(lap => lap.AverageSpeed >= medianSpeed - speedDifference)
            //    .ToList();

            //var medianDistance = intervalLaps
            //    .OrderBy(lap => lap.Distance)
            //    .Skip(intervalLaps.Count / 2)
            //    .First()
            //    .Distance;

            //intervalLaps = intervalLaps
            //    .Where(lap => lap.Distance >= medianDistance / 3 && lap.Distance <= medianDistance * 3)
            //    .ToList();

            //// Detect runs with "Auto lap" enabled.
            //if (intervalLaps.Count > Math.Max(activity.Laps.Count - 4, activity.Laps.Count / 2.5))
            //{
            //    return true;
            //}

            //// We require a minimum of 4 laps for an activity to be considered intervals.
            //if (intervalLaps.Count < 4)
            //{
            //    return true;
            //}

            return true;
        }
    }
}
