using System.Collections.Generic;
using Activities.Strava.Endpoints.Models;

namespace Activities.Strava.Syncing.Models
{
    public class BatchJob
    {
        public string AccessToken { get; set; }
        public long AthleteId { get; set; }
        public IReadOnlyList<SummaryActivity> Activities { get; set; }
        public double Progress { get; set; }
    }
}