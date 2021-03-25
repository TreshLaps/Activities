using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Activities.Core.Extensions;
using Activities.Strava.Endpoints;
using Activities.Strava.Endpoints.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;

namespace Activities.Web.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    public class ActivitiesPaceController : ControllerBase
    {
        private readonly ActivitiesClient _activitiesClient;

        public ActivitiesPaceController(ActivitiesClient activitiesClient)
        {
            _activitiesClient = activitiesClient;
        }

        [HttpGet]
        public async Task<dynamic> Get(double minSpeed, double maxSpeed)
        {
            var accessToken = await HttpContext.GetTokenAsync("access_token");
            minSpeed = minSpeed.ToMetersPerSecond();
            maxSpeed = maxSpeed.ToMetersPerSecond();
            var laps = new List<Lap>();
            
            var activities = await _activitiesClient.GetActivities(accessToken, DateTime.Today.AddYears(-1), DateTime.Today.AddDays(1));
            
            foreach (var activity in activities.Where(activity => activity.Type == "Run"))
            {
                var activityDetails = await _activitiesClient.GetActivity(accessToken, activity.Id);
                laps.AddRange(activityDetails.Laps?.Where(lap => lap.AverageSpeed >= minSpeed && lap.AverageSpeed <= maxSpeed) ?? Enumerable.Empty<Lap>());
            }

            return laps
                .GroupBy(lap => lap.StartDate.ToString("yyyy-MM"))
                .Select(lapGroup => new
                {
                    Month = lapGroup.Key,
                    Distance = lapGroup.Sum(lap => lap.Distance).ToKmString(),
                    AverageSpeed = lapGroup.Average(lap => lap.AverageSpeed).ToMinPerKmString(),
                    AverageHeartrate = (int)lapGroup.Average(lap => lap.AverageHeartrate),
                    MovingTime = lapGroup.Sum(lap => lap.MovingTime),
                    Laps = lapGroup
                        .Select(lap => new
                        {
                            lap.Id,
                            MovingTime = lap.MovingTime.ToTimeString(),
                            AverageSpeed = lap.AverageSpeed.ToMinPerKmString(),
                            Distance = lap.Distance.ToKmString()
                        })
                        .ToList()
                })
                .ToList();
        }
    }
}
