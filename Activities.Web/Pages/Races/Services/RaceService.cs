using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Activities.Strava.Endpoints;
using Activities.Web.Pages.Races.Models;

namespace Activities.Web.Pages.Races.Services
{
    public class RaceService
    {
        private readonly ActivitiesClient _activitiesClient;

        public RaceService(ActivitiesClient activitiesClient)
        {
            _activitiesClient = activitiesClient;
        }

        public async Task<List<RaceResult>> GetRaces(string accessToken, long athleteId)
        {
            var races = await _activitiesClient.GetActivities(accessToken, athleteId);

            return races
                .Where(x => x.WorkoutType == 1)
                .Select(
                    activity => new RaceResult
                    {
                        Id = activity.Id, 
                        Name = activity.Name, 
                        MovingTime = activity.MovingTime,
                        StartDate = activity.StartDate,
                        Distance = activity.Distance,
                        AverageSpeed = activity.AverageSpeed
                    })
                .ToList();
        }
    }
}
