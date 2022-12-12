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

            if (intervalLaps.Any(i => i.TotalElevationGain > 0))
            {
                return false;
            }

            var measurements = GetSpeedsFromDescription(activity.Description);
            measurements.AddRange(GetSpeedsFromDescription(activity.PrivateNote));

            // Avoid intervals where user types "XXkm/t" once
            if (measurements.Count < 2)
            {
                return false;
            }

            if (measurements.Count != intervalLaps.Count)
            {
                return false;
            }

            foreach (var measurement in measurements)
            {
                if (intervalLaps.Count >= measurement.Lap)
                {
                    // km/h and seconds -> meter
                    intervalLaps[measurement.Lap - 1].Distance = measurement.Value * intervalLaps[measurement.Lap - 1].ElapsedTime / 3.6;
                }
            }

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
                @"(\d+-)(\d+-+d+)*(-\d+)km/t"
            };

            foreach (var regex in regexes)
            {
                var matches = Regex.Matches(description, regex, RegexOptions.Multiline);

                foreach (Match match in matches)
                {
                    result = match.Groups[1].Value.Replace("km/t", "").Split('-').Select((i, index) => (Convert.ToDouble(i.Replace(",", "."), CultureInfo.InvariantCulture), index + 1)).ToList();
                }
            }

            return result;
        }
    }
}
