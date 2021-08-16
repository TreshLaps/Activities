using System;
using System.Collections.Generic;
using System.Linq;
using Activities.Strava.Endpoints.Models;

namespace Activities.Strava.Activities
{
    public static class IntervalService
    {
        // Update when logic is modified to trigger recalculation.
        private const string Version = "2021-08-12";

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
                if (!IsIntervalLap(i, activity.Laps, true))
                {
                    continue;
                }

                var similarLaps = GetSimilarLaps(i, activity.Laps, 0.1);

                if (similarLaps.Count < 2)
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

            // Remove first lap if it's slower than the rest of the intervals by a given margin.
            if (activity.Laps.Count > 1 && activity.Laps[0].IsInterval)
            {
                var isSlowestLapByMargin =
                    activity.Laps[0].AverageSpeed < activity.Laps.Skip(1).Where(lap => lap.IsInterval).Min(lap => lap.AverageSpeed) * 0.99;

                if (isSlowestLapByMargin)
                {
                    activity.Laps[0].IsInterval = false;
                }
            }

            if (IsAutoLapOrSimilar(activity.Laps))
            {
                foreach (var lap in activity.Laps)
                {
                    lap.IsInterval = false;
                }
            }

            return true;
        }

        private static bool IsAutoLapOrSimilar(List<Lap> laps)
        {
            if (laps.Count < 3)
            {
                return false;
            }

            var lapsOrderedByDistance = laps.OrderBy(lap => lap.Distance).Skip(1).SkipLast(1).ToList();
            var averageDistance = lapsOrderedByDistance.Average(lap => lap.Distance);

            return lapsOrderedByDistance.Sum(lap => Math.Abs(lap.Distance - averageDistance)) < 20 * laps.Count;
        }

        public static List<(Lap Lap, int LapIndex)> GetSimilarLaps(int lapIndex, List<Lap> laps, double threshold)
        {
            var compareLap = laps[lapIndex];
            var result = new List<(Lap Lap, int LapIndex)>();

            for (var i = 0; i < laps.Count; i++)
            {
                var isNotFirstLapOrSimilar = i != 0 || IsProbablyNotIntervalLap(laps[i]) && IsPauseLapComparedTo(i, laps, laps[i + 1]);

                if (!IsIntervalLap(i, laps, perfectMatch: false) && isNotFirstLapOrSimilar)
                {
                    continue;
                }

                var isCloseInSpeed = GetSpeedDifference(compareLap, laps[i]) < threshold;
                var isFasterThan = laps[i].AverageSpeed >= compareLap.AverageSpeed;
                var isCloseInDuration = compareLap.MovingTime < 60 || Math.Abs(laps[i].MovingTime - compareLap.MovingTime) < compareLap.MovingTime * 2;

                if ((isCloseInSpeed || isFasterThan) && isCloseInDuration)
                {
                    result.Add((laps[i], i));
                }
            }

            return result;
        }

        private static bool IsIntervalLap(int lapIndex, List<Lap> laps, bool perfectMatch = true)
        {
            var lap = laps[lapIndex];

            if (IsProbablyNotIntervalLap(lap))
            {
                return false;
            }

            var prevLapIsPause = lapIndex == 0 || IsPauseLapComparedTo(lapIndex - 1, laps, lap);
            var nextLapIsPause = lapIndex + 1 == laps.Count || IsPauseLapComparedTo(lapIndex + 1, laps, lap);

            var isPauseLapOnBothSides = prevLapIsPause && nextLapIsPause;
            var isPauseLapOnEitherSides = (lapIndex != 0 && prevLapIsPause) || (lapIndex + 1 != laps.Count && nextLapIsPause);

            if (perfectMatch && !isPauseLapOnBothSides)
            {
                return false;
            }

            if (!perfectMatch && !isPauseLapOnEitherSides)
            {
                return false;
            }

            return true;
        }

        private static bool IsPauseLapComparedTo(int lapIndex, List<Lap> laps, Lap intervalLap)
        {
            var lap = laps[lapIndex];

            if (lap.ElapsedTime < 10)
            {
                return false;
            }

            var isSlowerThanIntervalLap = lap.AverageSpeed < intervalLap.AverageSpeed;
            var isLessThanDoubleDistanceOfIntervalLap = lap.Distance < intervalLap.Distance * 2;
            var isGreatDistanceDifference = Math.Abs(lap.Distance - intervalLap.Distance) > Math.Max(lap.Distance, intervalLap.Distance) * 0.5;
            var isShortLap = lap.Distance < 500;
            var isStationary = lap.MovingTime < lap.ElapsedTime / 2;

            var isShortAndStationary = isShortLap && isStationary;
            var isShortAndSlower = isShortLap && isSlowerThanIntervalLap;
            var isLongAndSlowerAndDifferent = !isShortLap && isSlowerThanIntervalLap && isLessThanDoubleDistanceOfIntervalLap && isGreatDistanceDifference;

            var isIdenticalInDistance = Math.Abs(lap.Distance - intervalLap.Distance) < 20;
            var isIdenticalInDuration = Math.Abs(lap.ElapsedTime - intervalLap.ElapsedTime) < 10;
            var isIdentical = lap.Distance > 100 && isIdenticalInDistance && isIdenticalInDuration;

            if (isIdentical)
            {
                return false;
            }

            return isShortAndStationary || isShortAndSlower || isLongAndSlowerAndDifferent;
        }

        private static double GetSpeedDifference(Lap lap, Lap otherLap) => Math.Abs(Math.Log(lap.AverageSpeed) - Math.Log(otherLap.AverageSpeed));

        private static bool IsProbablyNotIntervalLap(Lap lap) => lap.MovingTime < 10 ||
                                                                 (lap.Distance < 500 && Math.Abs(lap.MovingTime - lap.ElapsedTime) > 30) ||
                                                                 lap.MovingTime > 60 * 60 ||
                                                                 lap.Distance > 11000 ||
                                                                 lap.AverageSpeed * 3.6 < 8;
    }
}