using System;
using Activities.Core.Extensions;
using Activities.Strava.Endpoints.Models;

namespace Activities.Strava.Activities
{
    public class FilterRequest
    {
        public string Type { get; init; }
        public FilterDuration Duration { get; init; }
        public int Year { get; init; }

        public bool Keep(SummaryActivity activity)
        {
            if (!string.IsNullOrEmpty(Type) && Type != "All" && activity.Type != Type)
            {
                return false;
            }

            var (startDate, endDate) = GetDateRange();

            if (Duration == FilterDuration.LastMonths)
            {
                if (activity.StartDate.Date < endDate)
                {
                    return false;
                }
            }

            if (Duration == FilterDuration.LastYear)
            {
                if (activity.StartDate.Date < endDate)
                {
                    return false;
                }
            }

            if (Duration == FilterDuration.Year && Year > 2000 && Year <= DateTime.Today.Year)
            {
                if (activity.StartDate.Date < endDate || activity.StartDate.Date > startDate)
                {
                    return false;
                }
            }

            return true;
        }

        public (DateTime StartDate, DateTime EndDate) GetDateRange()
        {
            if (Duration == FilterDuration.LastMonths)
            {
                return (DateTime.Today, DateTime.Today.GetStartOfWeek().AddDays(-7 * 20));
            }

            if (Duration == FilterDuration.LastYear)
            {
                return (DateTime.Today, new DateTime(DateTime.Today.Year, DateTime.Today.Month, 01).AddYears(-1));
            }

            if (Duration == FilterDuration.Year && Year > 2000 && Year <= DateTime.Today.Year)
            {
                var startDate = new DateTime(Year + 1, 01, 01).AddDays(-1);
                var endDate = new DateTime(Year, 01, 01);
                return (startDate, endDate);
            }

            throw new InvalidOperationException();
        }
    }

    public enum FilterDuration
    {
        None,
        LastMonths,
        LastYear,
        Year
    }
}
