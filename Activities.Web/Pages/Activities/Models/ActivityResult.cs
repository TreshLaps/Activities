using Activities.Strava.Endpoints.Models;

namespace Activities.Web.Pages.Activities.Models
{
    public class ActivityResult
    {
        public DetailedActivity Activity { get; set; }
        public double AverageIntervalPace { get; set; }
    }
}