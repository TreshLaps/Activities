using System;
using System.Collections.Generic;
using System.Linq;

namespace Activities.Core.DataTables
{
    public static class ListExtensions
    {
        public static void CalculateFactorsFor<T>(this List<T> items, Func<T, ItemValue> propertyFunc, double valueOffset = 0)
        {
            var properties = items
                .Where(item => propertyFunc(item) != null)
                .Select(propertyFunc)
                .ToList();

            if (!properties.Any())
            {
                return;
            }

            var maxValue = properties.Max(property => property.Value);
            
            foreach (var property in properties.Where(property => valueOffset > property.Value * -1))
            {
                property.Factor = Math.Round(1.0 / (maxValue + valueOffset) * (property.Value + valueOffset), 2);
            }
        }
    }
}
