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
        [TestCase(@"DetailedActivity.4128570707.json", new [] {2, 4, 6, 8, 10, 12})]
        [TestCase(@"DetailedActivity.4198493186.json", new [] {2, 4, 6, 8, 10, 12, 13})]
        [TestCase("DetailedActivity.5017996322.json", new [] {2, 4, 6, 8, 10, 12, 14, 16})]
        [TestCase("DetailedActivity.1275055990.json", new int[0])]
        [TestCase("DetailedActivity.1164398338.json", new int[0])]
        [TestCase("DetailedActivity.1165907510.json", new int[0])]
        [TestCase("DetailedActivity.2264841884.json", new [] {4, 6, 8, 10, 12})]
        public async Task Detect_interval_laps(string filePath, int[] expectedIntervalLaps)
        {
            var json = await File.ReadAllTextAsync(Path.Combine("Activities", filePath));
            var activity = JsonConvert.DeserializeObject<DetailedActivity>(json);
            activity._IntervalVersion = null;
            
            activity.TryTagIntervalLaps();
            
            Assert.Multiple(
                () =>
                {
                    for (var lapIndex = 0; lapIndex < activity.Laps.Count; lapIndex++)
                    {
                        var lap = activity.Laps[lapIndex];
                        Assert.AreEqual(expectedIntervalLaps.Contains(lapIndex + 1), lap.IsInterval, $"Lap: {lapIndex + 1} ({lap.AverageSpeed.ToMinPerKmString()}, {lap.Distance.ToKmString()}, {lap.ElapsedTime.ToTimeString()})");
                    }
                });
        }
    }
}
