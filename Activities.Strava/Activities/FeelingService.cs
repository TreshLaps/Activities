using System.Text.RegularExpressions;
using Activities.Strava.Endpoints.Models;

namespace Activities.Strava.Activities
{
    public static class FeelingService
    {
        // Update when logic is modified to trigger recalculation.
        private const string Version = "2021-06-14";

        public static bool TryParseFeelingParameter(this DetailedActivity activity)
        {
            if (activity._FeelingVersion == Version)
            {
                return false;
            }

            activity._FeelingVersion = Version;

            var parameter = GetFeelingFromDescription(activity.Description);

            if (parameter == null)
            {
                parameter = GetFeelingFromDescription(activity.PrivateNote);
            }

            if (parameter == null)
            {
                return false;
            }

            activity.Feeling = parameter;
            return true;
        }

        private static int? GetFeelingFromDescription(string description)
        {
            int? result = null;

            if (string.IsNullOrWhiteSpace(description))
            {
                return result;
            }

            var match = Regex.Match(description.ToLower(), @"følelse: (lett|vanlig|tung)");

            if (match.Success)
            {
                var feeling = match.Groups[1].Value;

                switch (feeling)
                {
                    case "lett":
                        result = 3;
                        break;
                    case "vanlig":
                        result = 2;
                        break;
                    case "tung":
                        result = 1;
                        break;
                    default:
                        break;
                }
            }

            return result;
        }
    }
}