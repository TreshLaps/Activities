using Humanizer.Localisation;
using System;
using System.Collections.Generic;
using System.Linq;
using Humanizer;

namespace Activities.Core.Extensions
{
    public static class MathExtensions
    {
        public static string ToMinPerKmString(this double metersPerSecond)
        {
            var averageSpeed = 1000 / metersPerSecond / 60;
            var averageSpeedMin = Math.Floor(averageSpeed);
            var averageSpeedSeconds = Math.Round((averageSpeed - averageSpeedMin) * 60);
            return $"{averageSpeedMin}:{(averageSpeedSeconds < 10 ? "0" : "")}{averageSpeedSeconds} /km";
        }

        public static double ToMetersPerSecond(this double minPerKm)
        {
            var averageSpeedMin = Math.Floor(minPerKm);
            var averageSpeedSeconds = (minPerKm - averageSpeedMin) / 0.6;

            return 1000 / (averageSpeedMin * 60 + averageSpeedSeconds);
        }

        public static string ToKmString(this double distanceInMeters)
        {
            return $"{distanceInMeters / 1000:0.00} km";
        }

        public static string ToTimeString(this int seconds)
        {
            if (seconds == 0)
            {
                return "-";
            }

            return TimeSpan.FromSeconds(seconds).Humanize(minUnit: TimeUnit.Minute, maxUnit: TimeUnit.Day, precision: 2);
        }

        public static double Median(this IEnumerable<double> source)
        {
            return source
                .OrderBy(s => s)
                .Skip(source.Count() / 2)
                .First();
        }
    }
}
