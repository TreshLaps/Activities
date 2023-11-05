using System.Text.RegularExpressions;
using Activities.Strava.Endpoints.Models;

namespace Activities.Strava.Activities
{
    public static class FeelingService
    {
        public static DetailedActivity TryParseFeelingParameter(this DetailedActivity activity)
        {
            var feeling = GetFeelingFromDescription(activity.Description) ??
                          GetFeelingFromDescription(activity.PrivateNote);

            return activity with {Feeling = feeling};
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