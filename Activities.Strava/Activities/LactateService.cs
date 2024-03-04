using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;
using Activities.Strava.Endpoints.Models;

namespace Activities.Strava.Activities
{
    public static class LactateService
    {
        public static DetailedActivity TryParseLactateMeasurements(this DetailedActivity activity)
        {
            var measurements = GetLactateFromDescription(activity.Description);
            measurements.AddRange(GetLactateFromDescription(activity.PrivateNote));
            var intervalLaps = activity.Laps?.Where(lap => lap.IsInterval).ToList() ?? new List<Lap>();

            foreach (var measurement in measurements)
            {
                if (measurement.Lap == null)
                {
                    activity = activity with {Lactate = measurement.Value};
                }
                else if ((activity.Laps != null) & (intervalLaps.Count >= measurement.Lap.Value))
                {
                    var lapIndex = activity.Laps.IndexOf(intervalLaps[measurement.Lap.Value - 1]);
                    activity = activity with
                    {
                        Laps = activity.Laps
                            .Select((lap, index) => index == lapIndex ? lap with {Lactate = measurement.Value} : lap)
                            .ToList()
                    };
                }
            }

            return activity;
        }

        public static List<(double Value, int? Lap)> GetLactateFromDescription(string description)
        {
            var result = new List<(double Value, int? Lap)>();

            if (string.IsNullOrWhiteSpace(description))
            {
                return result;
            }

            var regexes = new[]
            {
                @"([1-2]?[0-9][,\.][0-9])[\W]*\(([0-9]+)\)",
                @"💉[\W]*([1-2]?[0-9][,\.][0-9])[\W]*etter[\W]*([0-9]+)",
                @"([1-2]?[0-9][,\.][0-9])[\W]*etter siste",
                @"💉[\W]*([1-2]?[0-9][,\.][0-9])"
            };

            foreach (var regex in regexes)
            {
                var matches = Regex.Matches(description, regex, RegexOptions.Multiline);

                foreach (Match match in matches)
                {
                    var lactate = Convert.ToDouble(match.Groups[1].Value.Replace(",", "."),
                        CultureInfo.InvariantCulture);

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
