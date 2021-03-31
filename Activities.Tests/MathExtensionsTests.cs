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
            var paceString = metersPerSecond.ToMinPerKmString().Replace(":", ".");
            Assert.AreEqual(pace.ToString("0.00", CultureInfo.InvariantCulture) + "/km", paceString);
        }
    }
}
