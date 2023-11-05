using System.Linq;
using Activities.Strava.Endpoints.Models;

namespace Activities.Strava.Activities;

public static class ResetOldValuesService
{
    public static DetailedActivity ResetOldValues(this DetailedActivity activity)
    {
        activity = activity with
        {
            Feeling = null,
            Lactate = null,
            IsBislettInterval = false
        };

        if (activity.UnmergedLaps != null)
        {
            activity = activity with
            {
                Laps = activity.UnmergedLaps
            };
        }

        if (activity.Laps != null)
        {
            activity = activity with
            {
                Laps = activity.Laps
                    .Select(lap => lap with
                    {
                        IsInterval = false,
                        Lactate = null,
                        Distance = lap.OriginalDistance > 0 ? lap.OriginalDistance : lap.Distance,
                        AverageSpeed = lap.OriginalAverageSpeed > 0 ? lap.OriginalAverageSpeed : lap.AverageSpeed
                    })
                    .ToList()
            };
        }

        return activity;
    }
}