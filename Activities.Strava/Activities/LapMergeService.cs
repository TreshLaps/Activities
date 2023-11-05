// Try to merge auto laps.
//
// Watches often are set to auto lap every kilometer, which can interfere with our
// interval detection. (The FIT file contains information about what happened,
// but it's not available in the data from Strava, and in any case, if running
// 1K intervals the user could very well be stopping on the auto lap, making it
// a real lap.) We try to detect this case and merge them into the next lap
// if it seems to make sense.

using System;
using System.Collections.Generic;
using System.Linq;
using Activities.Strava.Endpoints.Models;

namespace Activities.Strava.Activities;

public static class LapMergeService
{
    // By far the most common auto lap for us will be 1000 meters, but we also support multiples.
    // Watches seem to be quite flexible here (e.g. Garmin watches support any multiple of
    // 50 meters, and probably also miles if you're in the US), but that would be unusual to set.
    private const double AutoLapBaseMeters = 1000;

    // Usually, auto lapping goes exactly on the dot, but sometimes, it can be e.g. 993 meters,
    // so we need a little bit of leeway.
    private const double LapMarginMeters = 10;

    // When checking if we want to merge one lap into the next, we only accept it if the average
    // speed difference is no more than 10%. Setting this higher seems to cause problems with
    // e.g. rowing activities, where the difference between warmup and actual intervals can be
    // fairly low in absolute terms.
    private const double LapSpeedMergingTolerance = 0.1;

    public static DetailedActivity TryMergeAutoLaps(this DetailedActivity activity)
    {
        if (activity.Laps == null ||
            activity.Laps.Count < 2 ||
            !activity.Laps.SkipLast(1).Any(IsProbablyAutoLap))
        {
            // No auto laps, so nothing to do.
            return activity;
        }

        var allLapsExceptLast = activity.Laps.SkipLast(1).ToList();

        if ((double) allLapsExceptLast.Count(IsProbablyAutoLap) / allLapsExceptLast.Count >= 0.8)
        {
            // All, or almost all, are auto laps, so this is just one long activity with
            // no manual laps (or just one or two manual laps).
            // It will probably be rejected by IntervalService.IsAutoLapOrSimilar() later
            // (although its logic is slightly different).
            return activity;
        }

        // Go through the list of laps, and merge them greedily if they are auto laps
        // and similar enough to the next lap. This isn't ideal (e.g. there are situations
        // where this would allow only merging 1 with 2 but merging 2+3+4 would be better),
        // but it's a reasonable heuristic.
        var newLaps = new List<Lap>();
        var lapsToMerge = new List<Lap>();

        for (var i = 0; i < activity.Laps.Count; ++i)
        {
            var tempLap = activity.Laps[i];
            lapsToMerge.Add(tempLap);

            if (i != activity.Laps.Count - 1 &&
                IsProbablyAutoLap(tempLap) &&
                NearlySameSpeed(tempLap, activity.Laps[i + 1]) &&
                !IsStationary(activity.Laps[i + 1]))
            {
                // Merge this lap into the next one.
                continue;
            }

            // This lap wasn't an auto lap.
            //
            // Merge together all laps that are to be merged (which may be just the lap
            // itself, which will then be added unchanged except for the lap index).
            // Merging AverageSpeed weighted by time is, perhaps surprisingly, correct;
            // merging speeds often requires using the harmonic mean, but then those
            // are weighted by distance, not time.
            //
            // NOTE: It's not clear what all the fields are, (e.g. StartIndex and EndIndex),
            // or how to merge all of them (e.g. Athlete), so some are just copied wholesale
            // from the last lap in the group.
            var mergedLap = tempLap with
            {
                LapIndex = activity.Laps.Count + 1,
                Distance = lapsToMerge.Sum(lap => lap.Distance),
                ElapsedTime = lapsToMerge.Sum(lap => lap.ElapsedTime),
                MovingTime = lapsToMerge.Sum(lap => lap.MovingTime),
                AverageSpeed = AverageWeightedByTime(lapsToMerge, lap => lap.AverageSpeed),
                MaxSpeed = lapsToMerge.Max(lap => lap.MaxSpeed),
                AverageHeartrate = AverageWeightedByTime(lapsToMerge, lap => lap.AverageHeartrate),
                AverageCadence = AverageWeightedByTime(lapsToMerge, lap => lap.AverageCadence),
            };

            newLaps.Add(mergedLap);
            lapsToMerge.Clear();
        }

        return activity with {Laps = newLaps};
    }

    private static bool IsStationary(Lap lap)
    {
        return lap.MovingTime < lap.ElapsedTime / 2;
    }

    // The FIT file generally says what is an auto lap or not, but Strava doesn't carry
    // that information through, so we're left with heuristics.
    private static bool IsProbablyAutoLap(Lap lap)
    {
        var roundedDistance = Math.Round(lap.Distance / AutoLapBaseMeters) * AutoLapBaseMeters;

        if (roundedDistance <= 0)
        {
            return false;
        }

        return Math.Abs(lap.Distance - roundedDistance) < LapMarginMeters;
    }

    private static bool NearlySameSpeed(Lap a, Lap b)
    {
        var vA = Math.Max(a.AverageSpeed, b.AverageSpeed);
        var vB = Math.Min(a.AverageSpeed, b.AverageSpeed);
        return vA / vB - 1.0 <= LapSpeedMergingTolerance;
    }

    private static double AverageWeightedByTime(List<Lap> laps, Func<Lap, double> func)
    {
        if (laps.Count == 1)
        {
            // Avoid numerical issues for the trivial case.
            return func(laps[0]);
        }

        return laps.Sum(lap => func(lap) * lap.ElapsedTime) / laps.Sum(lap => lap.ElapsedTime);
    }
}