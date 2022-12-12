﻿using Activities.Strava.Endpoints.Models;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Activities.Strava.Activities
{
    public static class ThreadmillService
    {
        // Update when logic is modified to trigger recalculation.
        private const string Version = "2022-12-12";

        public static bool TryParseThreadmillSpeedMeasurements(this DetailedActivity activity)
        {
            if (activity._ThreadmillVersion == Version)
            {
                return false;
            }

            activity._ThreadmillVersion = Version;

            var intervalLaps = activity.Laps?.Where(lap => lap.IsInterval).ToList() ?? new List<Lap>();

            // Reset activity if it was wrongly detected before
            if (activity.IsThreadmillInterval)
            {
                activity.IsThreadmillInterval = false;

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

            if (intervalLaps.Any(i => i.TotalElevationGain > 0))
            {
                return true;
            }

            var measurements = GetSpeedsFromDescription(activity.Description);
            measurements.AddRange(GetSpeedsFromDescription(activity.PrivateNote));

            // Avoid intervals where user types "XXkm/t" once
            if (measurements.Count < 2)
            {
                return true;
            }

            activity.IsThreadmillInterval = true;

            if (measurements.Count != intervalLaps.Count)
            {
                return true;
            }

            foreach (var measurement in measurements)
            {
                if (intervalLaps.Count >= measurement.Lap)
                {
                    // km/h and seconds -> meter
                    intervalLaps[measurement.Lap - 1].Distance = measurement.Value * intervalLaps[measurement.Lap - 1].ElapsedTime / 3.6;
                }
            }

            activity.IsThreadmillInterval = true;

            return true;
        }

        public static List<(double Value, int Lap)> GetSpeedsFromDescription(string description)
        {
            var result = new List<(double Value, int Lap)>();

            if (string.IsNullOrWhiteSpace(description))
            {
                return result;
            }

            var regexes = new[]
            {
                @"((\d{1,})+)(\.\d)?-(((\d{1,})+)(\.\d)?-)*((\d{1,})+)(\.\d)?km\/t"
            };

            foreach (var regex in regexes)
            {
                var matches = Regex.Matches(description, regex, RegexOptions.Multiline);

                foreach (Match match in matches)
                {
                    result = match.Value.Replace("km/t", "").Replace(",", ".").Split('-').Select((i, index) => (Convert.ToDouble(i, CultureInfo.InvariantCulture), index + 1)).ToList();
                }
            }

            return result;
        }
    }
}
