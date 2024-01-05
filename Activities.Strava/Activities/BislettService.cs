using System;
using System.Collections.Generic;
using System.Linq;
using Activities.Strava.Endpoints.Models;

namespace Activities.Strava.Activities;

public static class BislettService
{
    private const double BislettLapDistance = 546.5;
    private const double MaxWholeMinuteFactor = 0.03;
    private const double MaxWholeHundredMeterFactor = 0.1; // 0.1 == 10 meters
    private const double Max500MeterFactor = 0.1;
    private const double MaxDistanceFactor = 0.2;
    private const double MaxAverageDistanceFactor = 0.2;

    public static DetailedActivity TryAdjustBislettLaps(this DetailedActivity activity)
    {
        var intervalLaps = activity.Laps?.Where(lap => lap.IsInterval).ToList() ?? new List<Lap>();
        var distanceFactors = new List<double>();

        if (HasIntervalLapsWithSegments(activity))
        {
            return activity;
        }

        if (intervalLaps.Count <= 2)
        {
            return activity;
        }

        var activityContainsBislett = activity.Description?.ToLower().Contains("bislett") == true ||
                                      activity.Name?.ToLower().Contains("bislett") == true ||
                                      activity.PrivateNote?.ToLower().Contains("bislett") == true;

        if (intervalLaps.All(lap => lap.PaceZone > 0) &&
            intervalLaps.Sum(lap => lap.TotalElevationGain) > (activityContainsBislett ? 50 : 5))
        {
            return activity;
        }

        if (intervalLaps.Sum(lap => lap.TotalElevationGain) / intervalLaps.Sum(lap => lap.Distance) >
            (activityContainsBislett ? 0.1 : 0.01))
        {
            return activity;
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
            return activity;
        }

        var averageFactor = distanceFactors.Average();
        var maxFactor = distanceFactors.Max();

        var averageElapsedTime = intervalLaps.Average(lap => GetDistanceFactor(lap.ElapsedTime, 60));
        var isTooCloseToAWholeMinute = averageElapsedTime < MaxWholeMinuteFactor;

        var averageDistance = intervalLaps.Average(lap => GetDistanceFactor(lap.Distance, 100));
        var isTooCloseToWhole100Meter = averageDistance < MaxWholeHundredMeterFactor;

        var isTooCloseTo500Meters = intervalLaps.All(lap => GetDistanceFactor(lap.Distance, 500) < Max500MeterFactor);

        if (isTooCloseToAWholeMinute || isTooCloseToWhole100Meter || isTooCloseTo500Meters)
        {
        }
        else if (maxFactor < MaxDistanceFactor && averageFactor < MaxAverageDistanceFactor)
        {
            return activity with
            {
                IsBislettInterval = true,
                Laps = activity.Laps?.Select(lap =>
                {
                    var laps = lap.Distance / BislettLapDistance;
                    var correctedDistance = BislettLapDistance * Math.Round(laps);

                    return lap with
                    {
                        OriginalDistance = lap.Distance,
                        Distance = correctedDistance,
                        AverageSpeed = correctedDistance / lap.ElapsedTime
                    };
                }).ToList()
            };
        }

        return activity;
    }

    /// <summary>
    /// Returns a value between 0 and 1, where 0 is the closest to the factor and 1 is the furthest away from the factor.
    /// Example: GetDistanceFactor(50, 60) == 0.1666, GetDistanceFactor(60, 60) == 0, GetDistanceFactor(70, 60) == 0.1666
    /// </summary>
    private static double GetDistanceFactor(double value, double factor)
    {
        return FlipOverFifty(Math.Abs(value % factor - factor) / factor);
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
