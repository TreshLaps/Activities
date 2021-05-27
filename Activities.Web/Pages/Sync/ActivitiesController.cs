using System.Threading.Tasks;
using Activities.Strava.Authentication;
using Activities.Strava.Endpoints;
using Activities.Strava.Syncing;
using Microsoft.AspNetCore.Mvc;

namespace Activities.Web.Pages.Activities
{
    public class SyncController : BaseActivitiesController
    {
        private readonly ActivitiesSyncService _activitiesSyncService;

        public SyncController(ActivitiesClient activitiesClient, ActivitiesSyncService activitiesSyncService) : base(activitiesClient)
        {
            _activitiesSyncService = activitiesSyncService;
        }

        [HttpGet("")]
        public async Task<dynamic> GetSyncProgress()
        {
            var stravaAthlete = await HttpContext.TryGetStravaAthlete();
            var progress = await _activitiesSyncService.GetProgress(stravaAthlete.AccessToken, stravaAthlete.AthleteId);

            return new
            {
                Progress = progress
            };
        }
    }
}