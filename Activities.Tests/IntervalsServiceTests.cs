using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Activities.Core.Extensions;
using Activities.Strava.Endpoints;
using Activities.Strava.Endpoints.Models;
using Newtonsoft.Json;
using NUnit.Framework;

namespace Activities.Tests
{
    [TestFixture]
    public class IntervalsServiceTests
    {
        [TestCase(4128570707, new [] {2, 4, 6, 8, 10, 12})]
        [TestCase(4198493186, new [] {2, 4, 6, 8, 10, 12, 13})]
        [TestCase(5017996322, new [] {2, 4, 6, 8, 10, 12, 14, 16})]
        [TestCase(2264841884, new [] {4, 6, 8, 10, 12})]
        [TestCase(2015579716, new [] {2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30 , 32})]
        [TestCase(4997120231, new [] {2, 4, 6, 8, 10, 12, 14, 16, 18, 20})]
        [TestCase(3958433322, new [] {2, 4, 6, 8, 10, 12})]
        [TestCase(3657567570, new [] {2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26})]
        [TestCase(3197658818, new [] {2, 4, 6, 8, 10, 12})]
        [TestCase(4668663223, new [] {2, 4, 6, 8, 10, 12})]
        [TestCase(4619867954, new [] {2, 4, 6, 8, 10, 12, 14, 16})]
        [TestCase(2593351765, new [] {2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28})]
        [TestCase(3476674921, new [] {2, 4, 6, 8, 10, 12, 14, 16, 18, 20})]
        [TestCase(3445099341, new [] {2, 4, 6, 8})]
        [TestCase(4205824685, new [] {2, 4, 6})]
        [TestCase(4142271359, new [] {2, 4, 6, 8})]
        [TestCase(2975423722, new [] {7, 9, 11, 13, 15})]
        [TestCase(2056372884, new [] {4, 6, 8, 10})]
        [TestCase(2131763171, new [] {10, 12, 14, 16})]
        [TestCase(2233746904, new [] {12, 14, 16})]
        [TestCase(4977393213, new [] {1, 2, 4, 5, 7})]
        [TestCase(4491176735, new [] {1, 3, 5, 7, 9})]
        [TestCase(1275055990, new int[0])]
        [TestCase(1164398338, new int[0])]
        [TestCase(1165907510, new int[0])]
        [TestCase(2615379182, new int[0])]
        [TestCase(4076907576, new int[0])]
        [TestCase(3949692949, new int[0])]
        [TestCase(2950561146, new int[0])]
        [TestCase(2725685243, new int[0])]
        [TestCase(4436915217, new int[0])]
        [TestCase(226716622, new int[0])]
        [TestCase(3463728022, new int[0])]
        [TestCase(3902376336, new int[0])]
        [TestCase(3936521519, new int[0])]
        [TestCase(4086161909, new int[0])]
        [TestCase(3689365681, new int[0])]
        public async Task Detect_interval_laps(long stravaId, int[] expectedIntervalLaps)
        {
            var json = await File.ReadAllTextAsync(Path.Combine("Activities", $"DetailedActivity.{stravaId}.json"));
            var activity = JsonConvert.DeserializeObject<DetailedActivity>(json);
            activity._IntervalVersion = null;
            
            activity.TryTagIntervalLaps();
            
            Assert.Multiple(
                () =>
                {
                    for (var lapIndex = 0; lapIndex < activity.Laps.Count; lapIndex++)
                    {
                        var lap = activity.Laps[lapIndex];
                        var expectedResult = expectedIntervalLaps.Contains(lapIndex + 1);
                        
                        Assert.AreEqual(
                            expectedResult, 
                            lap.IsInterval, 
                            $"{(expectedResult ? "Lap not found" : "Didn't expect lap")}: {lapIndex + 1} ({lap.AverageSpeed.ToMinPerKmString()}, {lap.Distance.ToKmString()}, {lap.ElapsedTime.ToTimeString()}) - https://www.strava.com/activities/{stravaId}");
                    }
                });
        }
    }
}
