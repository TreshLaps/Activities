using System.IO;
using System.Threading.Tasks;
using Activities.Strava.Endpoints;
using Activities.Strava.Endpoints.Models;
using Newtonsoft.Json;
using NUnit.Framework;

namespace Activities.Tests;

[TestFixture]
public class BislettIntervalsServiceTests
{
    [TestCase(8215675956, true)]
    [TestCase(8215447861, true)]
    [TestCase(8224195215, true)]
    [TestCase(8153844342, true)]
    [TestCase(8132028269, true)]
    [TestCase(8185243869, true)]
    [TestCase(8258013918, true)]
    [TestCase(8252118394, true)]
    //[TestCase(8244335179, true)]
    [TestCase(8162696670, false)]
    [TestCase(8122964707, false)]
    [TestCase(8181362347, false)]
    [TestCase(8151972136, false)]
    [TestCase(8130531366, false)]
    [TestCase(7850048611, false)]
    [TestCase(8085782747, false)]
    [TestCase(6371150381, false)]
    [TestCase(3117056036, false)]
    [TestCase(8236989700, false)]
    [TestCase(5651625314, false)]
    [TestCase(5056176334, false)]
    //[TestCase(3057102438, false)]
    public async Task Detect_interval_laps(long stravaId, bool isBislettInterval)
    {
        var json = await File.ReadAllTextAsync(Path.Combine("BislettActivities", $"{stravaId}.json"));
        var activity = JsonConvert.DeserializeObject<DetailedActivity>(json);
        activity = ActivitiesClient.ProcessActivity(activity);

        Assert.AreEqual(isBislettInterval, activity.IsBislettInterval, $"https://www.strava.com/activities/{stravaId}");
    }
}