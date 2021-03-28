using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;
using Activities.Strava.Endpoints.Models;

namespace Activities.Strava.Endpoints
{
    public static class LactateService
    {
        // Update when logic is modified to trigger recalculation.
        private const string Version = "2021-03-28_3";

        public static bool TryParseLactatMeasurements(this DetailedActivity activity)
        {
            if (activity._LactateVersion == Version)
            {
                return false;
            }

            activity._LactateVersion = Version;

            var measurements = GetLactateFromDescription(activity.Description);
            var intervalLaps = activity.Laps?.Where(lap => lap.IsInterval).ToList() ?? new List<Lap>();

            foreach (var lap in intervalLaps)
            {
                lap.Lactate = null;
            }

            foreach (var measurement in measurements)
            {
                if (measurement.Lap == null)
                {
                    activity.Lactate = measurement.Value;
                }
                else if (intervalLaps.Count >= measurement.Lap.Value)
                {
                    intervalLaps[measurement.Lap.Value - 1].Lactate = measurement.Value;
                }
            }
            
            return true;
        }

        public static List<(double Value, int? Lap)> GetLactateFromDescription(string description)
        {
            var result = new List<(double Value, int? Lap)>();
            
            if (string.IsNullOrWhiteSpace(description))
            {
                return result;
            }
            
            var regexes = new []
            {
                @"^[\W]*([0-9][,\.][0-9])[\W]*\(([0-9]+)\)",
                @"^[\W]*💉[\W]*([0-9][,\.][0-9])[\W]*etter[\W]*([0-9]+)",
                @"^[\W]*💉[\W]*([0-9][,\.][0-9])"
            };

            foreach (var regex in regexes)
            {
                var matches = Regex.Matches(description, regex, RegexOptions.Multiline);

                foreach (Match match in matches)
                {
                    double lactate = Convert.ToDouble(match.Groups[1].Value.Replace(",", "."), CultureInfo.InvariantCulture);
                    int? lap = match.Groups.Count == 3 ? Convert.ToInt32(match.Groups[2].Value) : null;

                    if (lap != null || result.Any(r => r.Value == lactate && r.Lap != null) == false)
                    {
                        result.Add((lactate, lap));
                    }
                }
            }

            return result;
        }
    }
}