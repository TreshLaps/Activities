using System.Collections.Generic;
using Activities.Strava.Endpoints;
using NUnit.Framework;

namespace Activities.Tests
{
    [TestFixture]
    public class LactateServiceTests
    {
        [Test]
        public void Should_match_text_format_1()
        {
            var description = @"
                Introtext...

                2,4 (4)
                2.5 (6)
                Outrotekst..";
            
            var expectedResult = new List<(double Value, int? Lap)>()
            {
                (2.4, 4),
                (2.5, 6)
            };

            var result = LactateService.GetLactateFromDescription(description);
            
            Assert.AreEqual(expectedResult.Count, result.Count);

            for (var i = 0; i < expectedResult.Count; i++)
            {
                Assert.AreEqual(expectedResult[i].Value, result[i].Value);
                Assert.AreEqual(expectedResult[i].Lap, result[i].Lap);
            }
        }
        
        [Test]
        public void Should_match_text_format_2()
        {
            var description = @"
                2x6m, 60sp
                6x 5m, 60sp
                💉 2,4 etter 4.
                💉 2,5.
                Vind rætt imot vestover. God stemning, men halvstive bein.";
            
            var expectedResult = new List<(double Value, int? Lap)>()
            {
                (2.4, 4),
                (2.5, null)
            };

            var result = LactateService.GetLactateFromDescription(description);
            
            Assert.AreEqual(expectedResult.Count, result.Count);

            for (var i = 0; i < expectedResult.Count; i++)
            {
                Assert.AreEqual(expectedResult[i].Value, result[i].Value);
                Assert.AreEqual(expectedResult[i].Lap, result[i].Lap);
            }
        }
    }
}
