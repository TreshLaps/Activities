using System.IO;
using System.Threading.Tasks;
using Activities.Strava.Activities;
using Activities.Strava.Endpoints.Models;
using Newtonsoft.Json;
using NUnit.Framework;

namespace Activities.Tests;

[TestFixture]
public class ThreadmillIntervalsServiceTests
{
    [TestCase(8224273058, true)]
    [TestCase(8234509877, true)]
    public async Task Detect_interval_laps(long stravaId, bool isThreadmillIntervals)
    {
        var json = await File.ReadAllTextAsync(Path.Combine("BislettActivities", $"{stravaId}.json"));
        var activity = JsonConvert.DeserializeObject<DetailedActivity>(json);
        activity._IntervalVersion = null;
        activity._BislettVersion = null;
        activity._ThreadmillVersion = null;

        activity.TryTagIntervalLaps();
        activity.TryAdjustBislettLaps();
        activity.TryParseThreadmillSpeedMeasurements();

        Assert.AreEqual(isThreadmillIntervals, activity.IsThreadmillInterval, stravaId.ToString());
    }
}
