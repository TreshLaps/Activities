using Activities.Strava.Endpoints.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Activities.Strava.Activities;

public static class BislettService
{
    // Update when logic is modified to trigger recalculation.
    private const string Version = "2022-11-30";
    private const int BislettLap = 546;

    public static bool TryAdjustBislettLaps(this DetailedActivity activity)
    {
        if (activity._BislettVersion == Version)
        {
            return false;
        }

        activity._BislettVersion = Version;

        var intervalLaps = activity.Laps?.Where(lap => lap.IsInterval).ToList() ?? new List<Lap>();
        var distanceFactors = new List<double>();

        if (intervalLaps.Any(lap => lap.TotalElevationGain > 0))
        {
            return true;
        }

        foreach (var lap in intervalLaps)
        {
            var laps = lap.Distance / BislettLap;
            var distanceFactor = laps % 1;

            if (distanceFactor > 0.5)
            {
                distanceFactor = 1.0 - distanceFactor;
            }

            distanceFactor = distanceFactor / Math.Round(laps);
            distanceFactors.Add(distanceFactor);
        }

        if (!distanceFactors.Any())
        {
            return true;
        }

        var name = activity.Name;
        var averageFactor = distanceFactors.Average();
        var maxFactor = distanceFactors.Max();

        // Is Bislett lap
        if (maxFactor < 0.1 && averageFactor < 0.08)
        {
            activity.IsBislettInterval = true;

            foreach (var lap in intervalLaps)
            {
                var laps = lap.Distance / BislettLap;

                lap.OriginalDistance = lap.Distance;
                lap.OriginalAverageSpeed = lap.AverageSpeed;

                lap.Distance = BislettLap * Math.Round(laps);
                lap.AverageSpeed = lap.Distance / lap.ElapsedTime;
            }
        }
        else if (activity.IsBislettInterval)
        {
            activity.IsBislettInterval = false;

            foreach (var lap in intervalLaps)
            {
                if (lap.OriginalDistance > 0)
                {
                    lap.Distance = lap.OriginalDistance;
                }

                if (lap.OriginalAverageSpeed > 0)
                {
                    lap.AverageSpeed = lap.OriginalAverageSpeed;
                }
            }
        }

        return true;
    }
}