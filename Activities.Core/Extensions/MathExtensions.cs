using System;
using System.Collections.Generic;
using System.Linq;
using Humanizer;
using Humanizer.Localisation;

namespace Activities.Core.Extensions
{
    public static class MathExtensions
    {
        public static string ToPaceString(this double metersPerSecond, bool showSuffix = false)
        {
            if (double.IsNaN(metersPerSecond) || metersPerSecond == 0.0)
            {
                return string.Empty;
            }

            var averageSpeed = 1000 / metersPerSecond / 60;
            var averageSpeedMin = Math.Floor(averageSpeed);
            var averageSpeedSeconds = Math.Round(averageSpeed % 1 * 60);

            if (averageSpeedSeconds == 60)
            {
                averageSpeedMin += 1;
                averageSpeedSeconds = 0;
            }

            var paceString = $"{averageSpeedMin}:{(averageSpeedSeconds < 10 ? "0" : "")}{averageSpeedSeconds}";
            return showSuffix ? $"{paceString} /km" : paceString;
        }

        public static double? AveragePace<T>(this IEnumerable<T> items, Func<T, double?> durationFunc, Func<T, double?> paceFunc)
        {
            var totalDuration = 0.0;
            var total = 0.0;

            foreach (var item in items)
            {
                var duration = durationFunc(item);
                var pace = paceFunc(item);

                if (duration != null && pace != null)
                {
                    totalDuration += duration.Value;
                    total += pace.Value * duration.Value;
                }
            }

            if (totalDuration == 0.0)
            {
                return null;
            }

            return total / totalDuration;
        }

        public static double ToMetersPerSecond(this double minPerKm)
        {
            // 5.30
            // 5.0 = 1000 / 5.0 / 60
            // 0.30 = 0.3 / 0.6 = 
            // 
            var averageSpeedMin = Math.Floor(minPerKm);
            var averageSpeedSeconds = minPerKm % 1 / 0.6;

            return 1000 / (averageSpeedMin + averageSpeedSeconds) / 60;
        }

        public static string ToKmString(this double distanceInMeters)
        {
            return $"{distanceInMeters / 1000:0.0} km";
        }

        public static string ToTimeString(this int seconds)
        {
            if (seconds == 0)
            {
                return "-";
            }

            return TimeSpan.FromSeconds(seconds).Humanize(minUnit: TimeUnit.Minute, maxUnit: TimeUnit.Day, precision: 2);
        }

        public static string ToTimeStringSeconds(this int seconds)
        {
            return TimeSpan.FromSeconds(seconds).Humanize(minUnit: TimeUnit.Second, maxUnit: TimeUnit.Day, precision: 2);
        }

        public static double Median(this IEnumerable<double> source)
        {
            var items = source.ToList();

            if (items.Count % 2 == 0)
            {
                var index = items.Count / 2;

                return (items[index - 1] + items[index]) / 2.0;
            }

            return items[(int) Math.Floor(items.Count / 2.0)];
        }

        public static DateTime GetStartOfWeek(this DateTime date)
        {
            var dayOfWeek = (int) date.DayOfWeek - 1;

            if (dayOfWeek < 0)
            {
                dayOfWeek = 6;
            }

            return date.Date.AddDays(0 - dayOfWeek);
        }
    }
}