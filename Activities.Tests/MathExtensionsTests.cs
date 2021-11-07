using System;
using System.Globalization;
using Activities.Core.Extensions;
using NUnit.Framework;

namespace Activities.Tests
{
    [TestFixture]
    public class MathExtensionsTests
    {
        [TestCase(3.0)]
        [TestCase(3.1)]
        [TestCase(3.2)]
        [TestCase(3.3)]
        [TestCase(3.4)]
        [TestCase(3.5)]
        [TestCase(3.59)]
        public void Speed(double pace)
        {
            var metersPerSecond = pace.ToMetersPerSecond();
            var paceString = metersPerSecond.ToPaceString().Replace(":", ".");
            Assert.AreEqual(pace.ToString("0.00", CultureInfo.InvariantCulture), paceString);
        }

        [TestCase("2021-03-31", "2021-03-29")]
        [TestCase("2021-03-29", "2021-03-29")]
        [TestCase("2021-04-04", "2021-03-29")]
        [TestCase("2021-03-28", "2021-03-22")]
        public void DayOfWeek(string dateString, string startOfWeekDateString)
        {
            var date = DateTime.Parse(dateString);
            var expectedResult = DateTime.Parse(startOfWeekDateString);

            Assert.AreEqual(expectedResult, date.GetStartOfWeek(), $"{date:yyyy-MM-dd}: got {date.GetStartOfWeek():yyyy-MM-dd}");
        }

        [TestCase(2, new double[] { 1, 2, 3 })]
        [TestCase(2.5, new double[] { 1, 2, 3, 4 })]
        [TestCase(3, new double[] { 1, 2, 3, 4, 5 })]
        [TestCase(3.5, new double[] { 6, 2, 3, 4, 5, 1 })]
        public void MedianTests(double expectedResult, double[] values)
        {
            Assert.AreEqual(expectedResult, values.Median());
        }
    }
}