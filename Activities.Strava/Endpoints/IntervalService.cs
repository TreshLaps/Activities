using System;
using System.Collections.Generic;
using System.Linq;
using Activities.Strava.Endpoints.Models;

namespace Activities.Strava.Endpoints
{
    public static class IntervalService
    {
        // Update when logic is modified to trigger recalculation.
        private const string Version = "2021-03-30_13";

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
                
            if (activity.Laps.Count < 5)
            {
                return true;
            }

            for (var i = 1; i < activity.Laps.Count - 1; i++)
            {
                if (!IgnoreLap(activity.Laps[i]) && IsPauseLap(i - 1, activity.Laps) && IsPauseLap(i + 1, activity.Laps))
                {
                    var similarLaps = GetSimilarLaps(i, activity.Laps, 0.1);

                    if (similarLaps.Count >= 3)
                    {
                        foreach (var similarLap in similarLaps)
                        {
                            similarLap.Lap.IsInterval = true;
                        }
                    }
                }
            }

            // Remove interval laps that has no similar interval laps based on distance.
            foreach (var lap in activity.Laps.Where(lap => lap.IsInterval))
            {
                if (lap.Distance < 500 && activity.Laps.Count(lap2 => lap2.IsInterval && Math.Abs(lap.Distance - lap2.Distance) < 200) <= 1)
                {
                    lap.IsInterval = false;
                }
            }

            if (!activity.Laps.Any(lap => lap.IsInterval))
            {
                return true;
            }

            var slowestIntervalPace = activity.Laps.Where(lap => lap.IsInterval).Min(lap => lap.AverageSpeed);

            for (var i = 1; i < activity.Laps.Count - 1; i++)
            {
                var lap = activity.Laps[i];
                
                if (lap.IsInterval || lap.AverageSpeed < slowestIntervalPace || IgnoreLap(lap))
                {
                    continue;
                }
                
                if (lap.Distance < 500 && activity.Laps.Count(lap2 => lap2.IsInterval && Math.Abs(lap.Distance - lap2.Distance) < 200) <= 1)
                {
                    continue;
                }

                if (IsPauseLap(i - 1, activity.Laps) && IsPauseLap(i + 1, activity.Laps))
                {
                    lap.IsInterval = true;
                }
            }

            return true;
        }

        public static List<(Lap Lap, int LapIndex)> GetSimilarLaps(int lapIndex, List<Lap> laps, double threshold)
        {
            var result = new List<(Lap Lap, int LapIndex)>();

            // Don't calculate similarities for pause laps.
            if (IsPauseLap(lapIndex, laps))
            {
                return result;
            }

            for (var i = 0; i < laps.Count; i++)
            {
                if (IsPauseLap(i, laps) || i == lapIndex)
                {
                    continue;
                }

                if (GetSpeedDifference(laps[lapIndex], laps[i]) < threshold)
                {
                    result.Add((laps[i], i));
                }
            }
            
            result.Insert(0, (laps[lapIndex], lapIndex));
            return result;
        }

        public static double GetSpeedDifference(Lap lap, Lap otherLap) => Math.Abs(Math.Log(lap.AverageSpeed) - Math.Log(otherLap.AverageSpeed));

        private static bool IsPauseLap(Lap lap, Lap currentLap)
        {
            if (IsProbablyPauseLap(lap))
            {
                return true;
            }
            
            return lap.AverageSpeed < currentLap.AverageSpeed && (currentLap.AverageSpeed - lap.AverageSpeed) * 3.6 > 3;
        }

        private static bool IsPauseLap(int lapIndex, List<Lap> laps)
        {
            if (IsProbablyNotPauseLap(laps[lapIndex]))
            {
                return false;
            }
            
            var hasPausedNeighbors = false;

            if (lapIndex > 0)
            {
                hasPausedNeighbors = IsPauseLap(laps[lapIndex - 1], laps[lapIndex]);
            }

            if (lapIndex < laps.Count - 1)
            {
                hasPausedNeighbors = hasPausedNeighbors || IsPauseLap(laps[lapIndex + 1], laps[lapIndex]);
            }

            // Don't calculate similarities for pause laps.
            if (IsProbablyPauseLap(laps[lapIndex]) || !hasPausedNeighbors)
            {
                return true;
            }

            return false;
        }
        
        private static bool IsProbablyNotPauseLap(Lap lap) => lap.MovingTime > 5 * 60 || lap.Distance > 1000;
        private static bool IsProbablyPauseLap(Lap lap) => lap.MovingTime < 15 || lap.Distance < 80;
        private static bool IgnoreLap(Lap lap) => lap.MovingTime < 15 || lap.MovingTime > 30 * 60 || lap.Distance < 80 || lap.Distance > 5000 || lap.AverageSpeed * 3.6 < 12;
    }
}
