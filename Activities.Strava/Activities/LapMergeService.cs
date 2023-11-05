// Try to merge autolaps.
//
// Watches often are set to autolap every kilometer, which can interfere with our
// interval detection. (The FIT file contains information about what happened,
// but it's not available in the data from Strava, and in any case, if running
// 1K intervals the user could very well be stopping on the autolap, making it
// a real lap.) We try to detect this case and merge them into the next lap
// if it seems to make sense.

using System;
using System.Collections.Generic;
using System.Linq;
using Activities.Strava.Endpoints.Models;

namespace Activities.Strava.Activities;

public static class LapMergeService
{
    // Update when logic is modified to trigger recalculation.
    // Note that if you update this, you'll also need to bump IntervalService.Version
    // and BislettService.Version, so that they use the correct input.
    private const string Version = "2023-11-05";

    // By far the most common autolap for us will be 1000 meters, but we also support multiples.
    // Watches seem to be quite flexible here (e.g. Garmin watches support any multiple of
    // 50 meters, and probably also miles if you're in the US), but that would be unusual to set.
    private const double autolapBaseMeters = 1000;

    // Usually, autolapping goes exactly on the dot, but sometimes, it can be e.g. 993 meters,
    // so we need a little bit of leeway.
    private const double lapMarginMeters = 10;

    // When checking if we want to merge one lap into the next, we only accept it if the average
    // speed difference is no more than 10%. Setting this higher seems to cause problems with
    // e.g. rowing activities, where the difference between warmup and actual intervals can be
    // fairly low in absolute terms.
    private const double lapSpeedMergingTolerance = 0.1;

    public static bool TryMergeAutoLaps(this DetailedActivity activity)
    {
        if (activity._MergeLapsVersion == Version)
        {
            return false;
        }

        activity._MergeLapsVersion = Version;
        activity._IntervalVersion = null;
        activity._BislettVersion = null;
        activity._LactateVersion = null;

        // Take a backup of the laps if none exist, so that we can start with a clean slate
        // when upgrading to a newer version of the logic. (We never write to UnmergedLaps
        // after this.)
        if (activity.UnmergedLaps == null)
        {
            activity.ResetBislettLaps();
            activity.UnmergedLaps = activity.Laps;
        }
        activity.Laps = activity.UnmergedLaps;  // If we have early exit below.

        if (activity.UnmergedLaps == null ||
            activity.UnmergedLaps.Count < 2 ||
            !activity.UnmergedLaps.SkipLast(1).Any(IsProbablyAutoLap))
        {
            // No autolaps, so nothing to do.
            return true;
        }

        var allLapsExceptLast = activity.UnmergedLaps.SkipLast(1);
        if ((double)allLapsExceptLast.Count(IsProbablyAutoLap) / allLapsExceptLast.Count() >= 0.8)
        {
            // All, or almost all, are autolaps, so this is just one long activity with
            // no manual laps (or just one or two manual laps).
            // It will probably be rejected by IntervalService.IsAutoLapOrSimilar() later
            // (although its logic is slightly different).
            return true;
        }

        // Go through the list of laps, and merge them greedily if they are autolaps
        // and similar enough to the next lap. This isn't ideal (e.g. there are situations
        // where this would allow only merging 1 with 2 but merging 2+3+4 would be better),
        // but it's a reasonable heuristic.
        activity.Laps = new List<Lap>();
        var lapsToMerge = new List<Lap>();
        for (int i = 0; i < activity.UnmergedLaps.Count; ++i)
        { 
            var lap = activity.UnmergedLaps[i];
            lapsToMerge.Add(lap);
            if (i != activity.UnmergedLaps.Count - 1 &&
                IsProbablyAutoLap(lap) &&
                NearlySameSpeed(lap, activity.UnmergedLaps[i + 1]))
            {
                // Merge this lap into the next one.
                continue;
            }

            // This lap wasn't an autolap.
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
            var mergedLap = lap with {
                LapIndex = activity.Laps.Count + 1,
                Distance = lapsToMerge.Sum(lap => lap.Distance),
                ElapsedTime = lapsToMerge.Sum(lap => lap.ElapsedTime),
                MovingTime = lapsToMerge.Sum(lap => lap.MovingTime),
                AverageSpeed = AverageWeightedByTime(lapsToMerge, lap => lap.AverageSpeed),
                MaxSpeed = lapsToMerge.Max(lap => lap.MaxSpeed),
                AverageHeartrate = AverageWeightedByTime(lapsToMerge, lap => lap.AverageHeartrate),
                AverageCadence = AverageWeightedByTime(lapsToMerge, lap => lap.AverageCadence),
            };
            activity.Laps.Add(mergedLap);
            lapsToMerge.Clear();
        }

        return true;
    }

    // The FIT file generally says what is an autolap or not, but Strava doesn't carry
    // that information through, so we're left with heuristics.
    static bool IsProbablyAutoLap(Lap lap)
    {
        var roundedDistance = Math.Round(lap.Distance / autolapBaseMeters) * autolapBaseMeters;
        if (roundedDistance <= 0)
        {
            return false;
        }
        return Math.Abs(lap.Distance - roundedDistance) < lapMarginMeters;
    }

    static bool NearlySameSpeed(Lap a, Lap b)
    {
        double v_a = Math.Max(a.AverageSpeed, b.AverageSpeed);
        double v_b = Math.Min(a.AverageSpeed, b.AverageSpeed);
        return v_a / v_b - 1.0 <= lapSpeedMergingTolerance;
    }

    static double AverageWeightedByTime(List<Lap> laps, Func<Lap, double> func)
    {
        if (laps.Count == 1)
        {
            // Avoid numerical issues for the trivial case.
            return func(laps[0]);
        }
        return laps.Sum(lap => func(lap) * lap.ElapsedTime) / laps.Sum(lap => lap.ElapsedTime);
    }
}
