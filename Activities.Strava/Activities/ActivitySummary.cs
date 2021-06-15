using System.Collections.Generic;
using System.Linq;
using Activities.Core.DataTables;
using Activities.Core.Extensions;
using Activities.Strava.Endpoints.Models;

namespace Activities.Strava.Activities
{
    public static class ActivitySummary
    {
        public static List<ActivityDataSummary> ToActivitySummary(this IEnumerable<DetailedActivity> activities, FilterRequest filterRequest)
        {
            var result = activities
                .Select(
                    activity =>
                    {
                        ItemValue distance = null;
                        ItemValue elapsedTime = null;
                        ItemValue pace = null;
                        ItemValue heartrate = null;
                        ItemValue lactate = null;
                    ItemValue Feeling = null;

                        if (filterRequest.DataType == FilterDataType.Activity)
                        {
                            distance = new ItemValue(activity.Distance, ItemValueType.DistanceInMeters);
                            elapsedTime = new ItemValue(activity.MovingTime, ItemValueType.TimeInSeconds);
                            pace = new ItemValue(activity.AverageSpeed, ItemValueType.MetersPerSecond);
                            heartrate = activity.AverageHeartrate > 0 ? new ItemValue(activity.AverageHeartrate, ItemValueType.Heartrate) : null;
                            lactate = activity.AverageLactate.HasValue ? new ItemValue(activity.AverageLactate.Value, ItemValueType.Lactate) : null;
                        }
                        else if (filterRequest.DataType == FilterDataType.Interval)
                        {
                            var intervalLaps = activity.Laps?.Where(lap => lap.IsInterval).ToList();

                            if (intervalLaps?.Any() == true)
                            {
                                distance = new ItemValue(intervalLaps.Sum(lap => lap.Distance), ItemValueType.DistanceInMeters);
                                elapsedTime = new ItemValue(intervalLaps.Sum(lap => lap.ElapsedTime), ItemValueType.TimeInSeconds);
                                pace = new ItemValue(
                                    intervalLaps.AveragePace(lap => lap.ElapsedTime, lap => lap.AverageSpeed).Value,
                                    ItemValueType.MetersPerSecond);
                                heartrate = ItemValue.TryCreate(
                                    intervalLaps.Where(lap => lap.AverageHeartrate > 0).AverageOrNull(lap => lap.AverageHeartrate),
                                    ItemValueType.Heartrate);
                                lactate = ItemValue.TryCreate(
                                    intervalLaps.Where(lap => lap.Lactate > 0).AverageOrNull(lap => lap.Lactate),
                                    ItemValueType.Lactate);
                                Feeling = activity.Feeling.HasValue ? new ItemValue(activity.Feeling.Value, ItemValueType.Feeling) : null;
                            }
                        }
                        else if (filterRequest.DataType == FilterDataType.Threshold && filterRequest.MinPace.HasValue && filterRequest.MaxPace.HasValue)
                        {
                            if (activity.Laps != null)
                            {
                                var thresholdLaps = activity.Laps
                                    .Where(
                                        lap => lap.ElapsedTime > 120 &&
                                               lap.AverageSpeed >= filterRequest.MinPace.Value.ToMetersPerSecond() &&
                                               lap.AverageSpeed <= filterRequest.MaxPace.Value.ToMetersPerSecond())
                                    .ToList();

                                if (thresholdLaps.Any())
                                {
                                    distance = new ItemValue(thresholdLaps.Sum(lap => lap.Distance), ItemValueType.DistanceInMeters);
                                    elapsedTime = new ItemValue(thresholdLaps.Sum(lap => lap.ElapsedTime), ItemValueType.TimeInSeconds);
                                    pace = new ItemValue(
                                        thresholdLaps.AveragePace(lap => lap.ElapsedTime, lap => lap.AverageSpeed).Value,
                                        ItemValueType.MetersPerSecond);
                                    heartrate = ItemValue.TryCreate(
                                        thresholdLaps.Where(lap => lap.AverageHeartrate > 0).AverageOrNull(lap => lap.AverageHeartrate),
                                        ItemValueType.Heartrate);
                                    lactate = ItemValue.TryCreate(
                                        thresholdLaps.Where(lap => lap.Lactate > 0).AverageOrNull(lap => lap.Lactate),
                                        ItemValueType.Number);
                                    Feeling = activity.Feeling.HasValue ? new ItemValue(activity.Feeling.Value, ItemValueType.Feeling) : null;
                                }
                            }
                            else if (activity.ElapsedTime > 120 &&
                                     activity.AverageSpeed >= filterRequest.MinPace.Value.ToMetersPerSecond() &&
                                     activity.AverageSpeed <= filterRequest.MaxPace.Value.ToMetersPerSecond())
                            {
                                distance = new ItemValue(activity.Distance, ItemValueType.DistanceInMeters);
                                elapsedTime = new ItemValue(activity.MovingTime, ItemValueType.TimeInSeconds);
                                pace = new ItemValue(activity.AverageSpeed, ItemValueType.MetersPerSecond);
                                heartrate = activity.AverageHeartrate > 0 ? new ItemValue(activity.AverageHeartrate, ItemValueType.Heartrate) : null;
                                lactate = activity.AverageLactate.HasValue ? new ItemValue(activity.AverageLactate.Value, ItemValueType.Lactate) : null;
                            Feeling = activity.Feeling.HasValue ? new ItemValue(activity.Feeling.Value, ItemValueType.Feeling) : null;
                            }
                        }

                        return new ActivityDataSummary
                        {
                            Activity = activity,
                            Distance = distance,
                            ElapsedTime = elapsedTime,
                            Pace = pace,
                            Heartrate = heartrate,
                        Lactate = lactate,
                            Feeling = Feeling
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
        public ItemValue Feeling { get; set; }
    }
}
