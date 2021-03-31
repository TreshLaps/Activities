using Humanizer.Localisation;
using System;
using System.Collections.Generic;
using System.Linq;
using Humanizer;

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

            var paceString = $"{averageSpeedMin}:{(averageSpeedSeconds < 10 ? "0" : "")}{averageSpeedSeconds}";
            return showSuffix ? $"{paceString} /km" : paceString;
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
            var dayOfWeek = (int)date.DayOfWeek - 1;

            if (dayOfWeek < 0)
            {
                dayOfWeek = 6;
            }
            
            return date.Date.AddDays(0 - dayOfWeek);
        }
    }
}
