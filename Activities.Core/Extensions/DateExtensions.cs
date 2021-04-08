using System;
using System.Collections.Generic;
using System.Linq;

namespace Activities.Core.Extensions
{
    public static class DateExtensions
    {
        public static string GetGroupKey(this DateTime date, GroupKey key)
        {
            if (key == GroupKey.Week)
            {
                var startOfWeek = date.GetStartOfWeek();
                return $"{startOfWeek:dd.} - {startOfWeek.AddDays(6):dd. MMM}";
            }
            
            return date.ToString("MMM yyyy");
        }

        public static Dictionary<string, List<T>> GroupByDate<T>(this IEnumerable<T> items, GroupKey groupKey, Func<T, DateTime> datePropertyFunc, DateTime startDate, DateTime endDate)
        {
            if (startDate < endDate)
            {
                throw new ArgumentOutOfRangeException(nameof(startDate), "startDate has to be higher than endDate");
            }
            
            var groups = new Dictionary<string, List<T>>();
            var groupedItems = items
                .GroupBy(item => datePropertyFunc(item).GetGroupKey(groupKey))
                .ToDictionary(item => item.Key, item => item.ToList());
            var currentDate = startDate;

            if (groupKey == GroupKey.Week)
            {
                do
                {
                    var currentKey = currentDate.GetGroupKey(groupKey);
                    groups.Add(currentKey, groupedItems.ContainsKey(currentKey) ? groupedItems[currentKey] : new List<T>());
                    currentDate = currentDate.AddDays(-7);
                } while (currentDate >= endDate);
            }
            else
            {
                do
                {
                    var currentKey = currentDate.GetGroupKey(groupKey);
                    groups.Add(currentKey, groupedItems.ContainsKey(currentKey) ? groupedItems[currentKey] : new List<T>());
                    currentDate = currentDate.AddMonths(-1);
                } while (currentDate >= endDate);
            }

            return groups;
        }
    }

    public enum GroupKey
    {
        Week,
        Month
    }
}
