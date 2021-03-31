using System;
using System.Collections.Generic;
using System.Linq;
using Activities.Strava.Endpoints.Models;

namespace Activities.Strava.Endpoints
{
    public static class IntervalService
    {
        // Update when logic is modified to trigger recalculation.
        private const string Version = "2021-03-31_2";

        public static bool TryTagIntervalLaps(this DetailedActivity activity)
        {
            if (activity._IntervalVersion == Version)
            {
                return false;
            }

            activity._IntervalVersion = Version;
            activity._LactateVersion = null;
                
            if (activity.Laps == null)
            {
                return true;
            }

            foreach (var lap in activity.Laps)
            {
                lap.IsInterval = false;
            }

            for (var i = 1; i < activity.Laps.Count - 1; i++)
            {
                if (!IsIntervalLap(i, activity.Laps))
                {
                    continue;
                }

                var similarLaps = GetSimilarLaps(i, activity.Laps, 0.1);

                if (similarLaps.Count < 3)
                {
                    continue;
                }

                foreach (var similarLap in similarLaps)
                {
                    similarLap.Lap.IsInterval = true;
                }
            }

            // Remove short interval laps that has no similar interval laps based on distance.
            foreach (var lap in activity.Laps.Where(lap => lap.IsInterval))
            {
                if (lap.Distance < 500 && activity.Laps.Count(lap2 => lap2.IsInterval && Math.Abs(lap.Distance - lap2.Distance) < 200) <= 1)
                {
                    lap.IsInterval = false;
                }
            }

            return true;
        }

        public static List<(Lap Lap, int LapIndex)> GetSimilarLaps(int lapIndex, List<Lap> laps, double threshold)
        {
            var compareLap = laps[lapIndex];
            var result = new List<(Lap Lap, int LapIndex)>();

            for (var i = 0; i < laps.Count; i++)
            {
                if (IsProbablyNotIntervalLap(laps[i]))
                {
                    continue;
                }

                var isCloseInSpeed = GetSpeedDifference(compareLap, laps[i]) < threshold;
                var isFasterThan = laps[i].AverageSpeed >= compareLap.AverageSpeed;

                if (isCloseInSpeed || isFasterThan)
                {
                    result.Add((laps[i], i));
                }
            }
            
            return result;
        }

        private static bool IsIntervalLap(int lapIndex, List<Lap> laps)
        {
            var lap = laps[lapIndex];
            
            if (IsProbablyNotIntervalLap(lap))
            {
                return false;
            }

            if (!IsPauseLapComparedTo(lapIndex - 1, laps, lap) || !IsPauseLapComparedTo(lapIndex + 1, laps, lap))
            {
                return false;
            }

            return true;
        }

        private static bool IsPauseLapComparedTo(int lapIndex, List<Lap> laps, Lap intervalLap)
        {
            var lap = laps[lapIndex];

            var isSlowerThanIntervalLap = lap.AverageSpeed < intervalLap.AverageSpeed;
            var isLessThanDoubleDistanceOfIntervalLap = lap.Distance < intervalLap.Distance * 2;
            var IsGreatDistanceDifference = Math.Abs(lap.Distance - intervalLap.Distance) > Math.Max(lap.Distance, intervalLap.Distance) * 0.5;
            var isShortLap = lap.Distance < 500;
            var isStationary = lap.MovingTime < lap.ElapsedTime / 2;

            var isShortAndStationary = isShortLap && isStationary;
            var isShortAndSlower = isShortLap && isSlowerThanIntervalLap;
            var isLongAndSlowerAndDifferent = !isShortLap && isSlowerThanIntervalLap && isLessThanDoubleDistanceOfIntervalLap && IsGreatDistanceDifference;
            
            return isShortAndStationary || isShortAndSlower || isLongAndSlowerAndDifferent;
        }

        private static double GetSpeedDifference(Lap lap, Lap otherLap) => Math.Abs(Math.Log(lap.AverageSpeed) - Math.Log(otherLap.AverageSpeed));
        private static bool IsProbablyNotIntervalLap(Lap lap) => lap.MovingTime < 10 || lap.MovingTime > 60 * 60 || lap.Distance > 11000 || lap.AverageSpeed * 3.6 < 12;
    }
}
