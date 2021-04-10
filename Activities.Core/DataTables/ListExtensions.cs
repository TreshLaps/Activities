using System;
using System.Collections.Generic;
using System.Linq;

namespace Activities.Core.DataTables
{
    public static class ListExtensions
    {
        public static void CalculateFactorsFor<T>(this List<T> items, Func<T, ItemValue> propertyFunc, bool dynamicMinValue = false)
        {
            var properties = items
                .Where(item => propertyFunc(item) != null)
                .Select(propertyFunc)
                .ToList();

            if (!properties.Any())
            {
                return;
            }

            var valueOffset = 0.0;
            var maxValue = properties.Max(property => property.Value);

            if (dynamicMinValue)
            {
                var minValue = properties.Min(property => property.Value);
                valueOffset = Math.Max(minValue * 0.99, 0.0) * -1;
            }

            foreach (var property in properties.Where(property => valueOffset > property.Value * -1))
            {
                property.Factor = Math.Round(1.0 / (maxValue + valueOffset) * (property.Value + valueOffset), 2);
            }
        }

        public static double? AverageOrNull<T>(this IEnumerable<T> items, Func<T, double?> selector)
        {
            var values = items
                .Select(selector)
                .Where(value => value != null)
                .Cast<double>()
                .ToList();

            return values.Any() ? values.Average(): null;
        }

        public static double? SumOrNull<T>(this IEnumerable<T> items, Func<T, double?> selector)
        {
            var values = items
                .Select(selector)
                .Where(value => value != null)
                .Cast<double>()
                .ToList();

            return values.Any() ? values.Sum(): null;
        }
    }
}
