using System;
using Activities.Core.Extensions;
using Activities.Strava.Endpoints.Models;

namespace Activities.Strava.Activities
{
    public record FilterRequest
    {
        public string Type { get; init; }
        public FilterDuration Duration { get; init; }
        public int Year { get; init; }
        public FilterDataType DataType { get; init; }
        public double? MinPace { get; set; }
        public double? MaxPace { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public GroupKey? GroupKey { get; set; }
        public string SearchString { get; set; }

        public bool Keep(SummaryActivity activity)
        {
            if (!string.IsNullOrEmpty(Type) && Type != "All" && activity.Type != Type)
            {
                return false;
            }

            var (startDate, endDate) = GetDateRange();

            if (SearchString != null)
            {
                if (!activity.Name.Contains(SearchString))
                {
                    return false;
                }
            }

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

            if (Duration == FilterDuration.Custom)
            {
                if (StartDate.HasValue && activity.StartDate > StartDate)
                {
                    return false;
                }
                
                if (EndDate.HasValue && activity.StartDate < EndDate)
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

                if (startDate > DateTime.Today)
                {
                    startDate = DateTime.Today;
                }
                
                return (startDate, endDate);
            }

            if (Duration == FilterDuration.Custom)
            {
                return (StartDate ?? DateTime.Today, EndDate ?? DateTime.Today.AddYears(-10));
            }

            throw new InvalidOperationException();
        }
    }

    public enum FilterDuration
    {
        None,
        LastMonths,
        LastYear,
        Year,
        Custom
    }

    public enum FilterDataType
    {
        Activity,
        Interval,
        Threshold
    }
}
