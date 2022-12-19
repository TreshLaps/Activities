using Activities.Strava.Endpoints.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Activities.Strava.Activities;

public static class BislettService
{
    // Update when logic is modified to trigger recalculation.
    private const string Version = "2022-12-19_3";
    private const double BislettLapDistance = 546.5;

    private const double MaxWholeMinuteFactor = 0.03;
    private const double MaxWholeHundredMeterFactor = 0.1; // 0.1 == 10 meters
    private const double Max500MeterFactor = 0.1;
    private const double MaxDistanceFactor = 0.2;
    private const double MaxAverageDistanceFactor = 0.2;


    public static bool TryAdjustBislettLaps(this DetailedActivity activity)
    {
        if (activity._BislettVersion == Version)
        {
            return false;
        }

        activity._BislettVersion = Version;

        var intervalLaps = activity.Laps?.Where(lap => lap.IsInterval).ToList() ?? new List<Lap>();
        var distanceFactors = new List<double>();

        // Reset activity if it was wrongly detected before
        if (activity.IsBislettInterval)
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

        if (HasIntervalLapsWithSegments(activity))
        {
            return true;
        }

        if (intervalLaps.Count <= 2)
        {
            return true;
        }

        if (intervalLaps.All(lap => lap.PaceZone > 0) && intervalLaps.Sum(lap => lap.TotalElevationGain) > 5)
        {
            return true;
        }

        if (intervalLaps.Sum(lap => lap.TotalElevationGain) / intervalLaps.Sum(lap => lap.Distance) > 0.01)
        {
            return true;
        }

        foreach (var lap in intervalLaps)
        {
            var laps = lap.Distance / BislettLapDistance;
            var distanceFactor = FlipOverFifty(laps % 1);
            distanceFactor /= Math.Round(laps);
            distanceFactors.Add(distanceFactor);
        }

        if (!distanceFactors.Any())
        {
            return true;
        }

        var name = activity.Name;
        var averageFactor = distanceFactors.Average();
        var maxFactor = distanceFactors.Max();

        var averageElapsedTime = intervalLaps.Average(lap => FlipOverFifty((double) lap.ElapsedTime / 60 % 1));
        var isTooCloseToAWholeMinute = averageElapsedTime < MaxWholeMinuteFactor;

        var averageDistance = intervalLaps.Average(lap => FlipOverFifty(lap.Distance / 100 % 1));
        var isTooCloseToWhole100Meter = averageDistance < MaxWholeHundredMeterFactor;

        var isTooCloseTo500Meters = intervalLaps.All(lap => FlipOverFifty(lap.Distance / 500 % 1) < Max500MeterFactor);

        if (isTooCloseToAWholeMinute || isTooCloseToWhole100Meter || isTooCloseTo500Meters)
        {
        }
        else if (maxFactor < MaxDistanceFactor && averageFactor < MaxAverageDistanceFactor)
        {
            activity.IsBislettInterval = true;

            foreach (var lap in intervalLaps)
            {
                var laps = lap.Distance / BislettLapDistance;

                lap.OriginalDistance = lap.Distance;
                lap.OriginalAverageSpeed = lap.AverageSpeed;

                lap.Distance = BislettLapDistance * Math.Round(laps);
                lap.AverageSpeed = lap.Distance / lap.ElapsedTime;
            }

            return true;
        }

        return true;
    }

    private static double FlipOverFifty(double value)
    {
        if (value > 0.5)
        {
            return 1.0 - value;
        }

        return value;
    }

    private static bool HasIntervalLapsWithSegments(DetailedActivity activity)
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
            .Any(segment =>
                intervalLaps.Any(lap => segment.StartDate >= lap.StartDate && segment.StartDate < lap.EndDate));
    }
}