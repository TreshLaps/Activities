using System.Text.RegularExpressions;
using Activities.Strava.Endpoints.Models;

namespace Activities.Strava.Activities
{
    public static class FeelingService
    {
        // Update when logic is modified to trigger recalculation.
        private const string Version = "2021-08-19_v2";

        public static bool TryParseFeelingParameter(this DetailedActivity activity)
        {
            if (activity._FeelingVersion == Version)
            {
                return false;
            }

            activity._FeelingVersion = Version;
            activity.Feeling = GetFeelingFromDescription(activity.Description) ?? GetFeelingFromDescription(activity.PrivateNote);
            return true;
        }

        private static int? GetFeelingFromDescription(string description)
        {
            if (string.IsNullOrWhiteSpace(description))
            {
                return null;
            }

            var match = Regex.Match(description.ToLower(), @"følelse([: ]*)(lett|vanlig|tung)");

            if (match.Success)
            {
                var feeling = match.Groups[2].Value;

                switch (feeling)
                {
                    case "lett":
                        return 3;
                    case "vanlig":
                        return 2;
                    case "tung":
                        return 1;
                }
            }

            return null;
        }
    }
}