﻿using System.Collections.Generic;
using System.Linq;
using Activities.Core.DataTables;
using Activities.Strava.Endpoints.Models;

namespace Activities.Strava.Activities
{
    public static class ActivitySummary
    {
        public static List<ActivityDataSummary> ToActivitySummary(this IEnumerable<DetailedActivity> activities, FilterDataType dataType)
        {
            var result = activities
                .Select(activity =>
                {
                    ItemValue distance = null;
                    ItemValue elapsedTime = null;
                    ItemValue pace = null;
                    ItemValue heartrate = null;
                    ItemValue lactate = null;

                    if (dataType == FilterDataType.Activity)
                    {
                        distance = new ItemValue(activity.Distance, ItemValueType.DistanceInMeters);
                        elapsedTime = new ItemValue(activity.MovingTime, ItemValueType.TimeInSeconds);
                        pace = new ItemValue(activity.AverageSpeed, ItemValueType.MetersPerSecond);
                        heartrate = new ItemValue(activity.AverageHeartrate, ItemValueType.Heartrate);
                        heartrate = activity.AverageHeartrate > 0 ? new ItemValue(activity.AverageHeartrate, ItemValueType.Heartrate) : null;
                        lactate = activity.AverageLactate.HasValue ? new ItemValue(activity.AverageLactate.Value, ItemValueType.Number) : null;
                    }
                    else if (dataType == FilterDataType.Interval)
                    {
                        var intervalLaps = activity.Laps?.Where(lap => lap.IsInterval).ToList();

                        if (intervalLaps?.Any() == true)
                        {
                            distance = new ItemValue(intervalLaps.Sum(lap => lap.Distance), ItemValueType.DistanceInMeters);
                            elapsedTime = new ItemValue(intervalLaps.Sum(lap => lap.ElapsedTime), ItemValueType.TimeInSeconds);
                            pace = new ItemValue(intervalLaps.Average(lap => lap.AverageSpeed), ItemValueType.MetersPerSecond);
                            
                            var lapHeartrate = intervalLaps.Where(lap => lap.AverageHeartrate > 0).Select(lap => lap.AverageHeartrate).ToList();
                            heartrate = lapHeartrate.Any() ? new ItemValue(lapHeartrate.Average(), ItemValueType.Heartrate) : null;

                            var lapLactate = intervalLaps.Where(lap => lap.Lactate > 0).Select(lap => lap.Lactate.Value).ToList();
                            lactate = lapLactate.Any() ? new ItemValue(lapLactate.Average(), ItemValueType.Number) : null;
                        }
                    }

                    return new ActivityDataSummary
                    {
                        Activity = activity,
                        Distance = distance,
                        ElapsedTime = elapsedTime,
                        Pace = pace,
                        Heartrate = heartrate,
                        Lactate = lactate
                    };
                })
                .Where(activity => activity.Distance != null)
                .ToList();

            result.CalculateFactorsFor(item => item.Distance);
            result.CalculateFactorsFor(item => item.ElapsedTime);
            result.CalculateFactorsFor(item => item.Pace, true);
            result.CalculateFactorsFor(item => item.Heartrate, true);
            result.CalculateFactorsFor(item => item.Lactate, true);

            return result;
        }
    }

    public class ActivityDataSummary
    {
        public DetailedActivity Activity { get; set; }
        public ItemValue Distance { get; set; }
        public ItemValue ElapsedTime { get; set; }
        public ItemValue Pace { get; set; }
        public ItemValue Heartrate { get; set; }
        public ItemValue Lactate { get; set; }
    }
}
