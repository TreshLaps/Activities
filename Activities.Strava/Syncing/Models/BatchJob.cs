using System;
using System.Collections.Generic;
using Activities.Strava.Authentication;
using Activities.Strava.Endpoints.Models;

namespace Activities.Strava.Syncing.Models
{
    public class BatchJob
    {
        public OAuthToken StravaToken { get; set; }
        public long AthleteId { get; set; }
        public IReadOnlyList<SummaryActivity> Activities { get; set; }
        public double Progress { get; set; }
        public DateTime Created { get; set; }
    }
}