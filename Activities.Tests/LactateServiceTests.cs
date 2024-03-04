using Activities.Strava.Activities;
using NUnit.Framework;

namespace Activities.Tests
{
    [TestFixture]
    public class LactateServiceTests
    {
        [TestCase(@"...
                2,4 (4)
                2.5 (6)
                ...",
            0, 
            2.4, 
            4)]
        [TestCase(@"...
                2,4 (4)
                2.5 (6)
                ...", 
            1, 
            2.5, 
            6)]
        [TestCase(@"...
                2,4 (4)
                12.5 (6)
                ...",
            1,
            12.5,
            6)]
        [TestCase(@"...
                La: 3.3 (3) (171, 3:17)
                ...", 
            0, 
            3.3, 
            3)]
        [TestCase(@"...
                💉 2,4 etter 4.
                💉 2,5.
                ...", 
            0, 
            2.4, 
            4)]
        [TestCase(@"...
                💉 2,4 etter 4.
                💉 2,5.
                ...", 
            1, 
            2.5, 
            null)]
        [TestCase(@"...
                2,4 etter siste.
                ...", 
            0, 
            2.4, 
            null)]
        public void Should_match_text_format(string description, int expectedValueIndex, double expectedLactate, int? expectedLap)
        {
            var result = LactateService.GetLactateFromDescription(description);
            
            Assert.Less(expectedValueIndex, result.Count);
            Assert.AreEqual(expectedLactate, result[expectedValueIndex].Value);
            Assert.AreEqual(expectedLap, result[expectedValueIndex].Lap);
        }
    }
}
