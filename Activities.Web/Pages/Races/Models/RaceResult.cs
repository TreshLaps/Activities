using System;

namespace Activities.Web.Pages.Races.Models
{
    public class RaceResult
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public int MovingTime { get; set; }
        public DateTime StartDate { get; set; }
        public double Distance { get; set; }
        public double AverageSpeed { get; set; }
    }
}