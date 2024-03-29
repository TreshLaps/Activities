using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;
using Activities.Strava.Endpoints.Models;

namespace Activities.Strava.Activities
{
    // Supports overriding measured speed by writing laps; especially useful
    // for treadmill users. Supports these syntaxes (with/without some whitespace):
    //
    //   1-5: 4:00/km (no support for miles!)
    //   1-5: 15 km/t (or km/h)
    //   1-5: 15.3 km/t (or km/h)
    //   1-5: 15,3 km/t (or km/h)
    //   1,3,5,7-9: 15,3 km/t (or km/h)
    //
    // Where e.g. 1-5 can be a range or just a single number. If overlapping overrides
    // exist, it is undefined which one wins.
    public static class ManualSpeedOverrideService
    {
        public static DetailedActivity TryParseManualSpeedOverrides(this DetailedActivity activity)
        {
            var overrides = GetSpeedOverridesFromDescription(activity.Description);
            overrides.AddRange(GetSpeedOverridesFromDescription(activity.PrivateNote));
            if (!overrides.Any())
            {
                return activity;
            }

            foreach (var o in overrides)
            {
                activity = activity with
                {
                    Laps = activity.Laps
                        .Select((lap, index) => index == o.Lap ? lap with
                        {
                            MovingTime = lap.ElapsedTime,
                            AverageSpeed = o.Speed,
                            MaxSpeed = o.Speed,
                            Distance = o.Speed * lap.ElapsedTime
                        } : lap)
                        .ToList()
                };
            }

            // Recalculate global values, now that we may have changed laps.
            activity = activity with
            {
                Distance = activity.Laps.Sum((lap) => lap.Distance),
                MovingTime = activity.Laps.Sum((lap) => lap.MovingTime),
                MaxSpeed = activity.Laps.Max((lap) => lap.MaxSpeed),
            };
            activity = activity with
            {
                AverageSpeed = activity.Distance / activity.MovingTime
            };

            return activity;
        }

        public static List<(double Speed, int Lap)> GetSpeedOverridesFromDescription(string description)
        {
            var result = new List<(double Speed, int Lap)>();

            if (string.IsNullOrWhiteSpace(description))
            {
                return result;
            }

            var lapsRegex = @"(?<laps> \d+ (?: [-–] \d+ )? (?: \s* , \s* \d+ (?: [-–] \d+ )? )* )";

            var paceMatches = Regex.Matches(
                description,
                lapsRegex + @"\s* : \s* (?<min> \d+) : (?<sec> \d+) \s* / \s* km",
                RegexOptions.Multiline | RegexOptions.IgnorePatternWhitespace);
            foreach (Match match in paceMatches)
            {
                var min = Convert.ToInt32(match.Groups["min"].Value);
                var sec = Convert.ToInt32(match.Groups["sec"].Value);
                var speed = 1000.0 / (min * 60 + sec);
                foreach (var lap in ParseLapRanges(match.Groups["laps"].Value))
                {
                    result.Add((speed, lap));
                }
            }

            var speedMatches = Regex.Matches(
                description,
                lapsRegex + @"\s* : \s* (?<speed> \d+ (?: [.,] \d* )? ) \s* km \s* / \s* [th]",
                RegexOptions.Multiline | RegexOptions.IgnorePatternWhitespace);
            foreach (Match match in speedMatches)
            {
                var speed = Convert.ToDouble(match.Groups["speed"].Value.Replace(",", "."),
                    CultureInfo.InvariantCulture) / 3.6;
                foreach (var lap in ParseLapRanges(match.Groups["laps"].Value))
                {
                    result.Add((speed, lap));
                }
            }

            return result;
        }

        static List<int> ParseLapRanges(string description)
        {
            var result = new List<int>();
            foreach (var range in description.Split(","))
            {
                var match = Regex.Match(
                    range,
                    @"(?<startLap> \d+) (?:[-–] (?<endLap> \d+))?",
                    RegexOptions.Multiline | RegexOptions.IgnorePatternWhitespace);
                var startLap = Convert.ToInt32(match.Groups["startLap"].Value);
                var endLap = startLap;
                if (match.Groups["endLap"].Success)
                {
                    endLap = Convert.ToInt32(match.Groups["endLap"].Value);
                }
                for (var lap = startLap; lap <= endLap; ++lap)
                {
                    result.Add(lap - 1);
                }
            }
            return result;
        }
    }
}
