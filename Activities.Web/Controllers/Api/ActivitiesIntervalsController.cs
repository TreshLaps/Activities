using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
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
    public class ActivitiesIntervalsController : ControllerBase
    {
        private readonly ActivitiesClient _activitiesClient;

        public ActivitiesIntervalsController(ActivitiesClient activitiesClient)
        {
            _activitiesClient = activitiesClient;
        }

        [HttpGet]
        public async Task<dynamic> Get()
        {
            var accessToken = await HttpContext.GetTokenAsync("access_token");
            var athleteId = Convert.ToInt64(HttpContext.User.Claims.First(claim => claim.Type == ClaimTypes.NameIdentifier).Value);
            var detailedActivities = new List<DetailedActivity>();
            
            var activities = await _activitiesClient.GetActivities(accessToken, athleteId);
            
            foreach (var activity in activities.Where(activity => activity.Type == "Run" && activity.StartDate > DateTime.Today.AddMonths(-6)))
            {
                var activityDetails = await _activitiesClient.GetActivity(accessToken, activity.Id);
                detailedActivities.Add(activityDetails);
            }

            return detailedActivities
                .Where(activity => activity.Laps != null)
                .Where(activity => activity.Laps.Count(lap => lap.Distance > 200 && lap.ElapsedTime > 60) > 5)
                .Select(activity =>
                {
                    var laps = activity.Laps
                        .Where(lap => lap.Distance > 200 && lap.ElapsedTime > 60)
                        .ToList();
                    
                    var medianSpeed = laps
                        .OrderBy(lap => lap.AverageSpeed)
                        .Skip(laps.Count / 2)
                        .First()
                        .AverageSpeed;

                    var speedDifference = 0.5;

                    var runningLaps = laps
                        .Where(lap => lap.AverageSpeed >= medianSpeed - speedDifference)
                        .ToList();
                    
                    var medianDistance = runningLaps
                        .OrderBy(lap => lap.Distance)
                        .Skip(runningLaps.Count / 2)
                        .First()
                        .Distance;
                    
                    runningLaps = runningLaps
                        .Where(lap => lap.Distance >= medianDistance / 3 && lap.Distance <= medianDistance * 3)
                        .ToList();

                    return new
                    {
                        Name = $"{activity.StartDate:dd.MM.yyyy}: {activity.Name} - {activity.Description}",
                        Interval_AverageSpeed = runningLaps.Average(lap => lap.AverageSpeed).ToMinPerKmString(),
                        Interval_AverageHeartrate = (int)runningLaps.Average(lap => lap.AverageHeartrate),
                        Interval_Laps = runningLaps
                            .Select(lap => $"{lap.Name}: {lap.Distance.ToKmString()}, {lap.AverageSpeed.ToMinPerKmString()}, {(int)lap.AverageHeartrate} bpm")
                            .ToList(),
                        Debug = new
                        {
                            MedianSpeed = $"{medianSpeed.ToMinPerKmString()} (max: {(medianSpeed - speedDifference).ToMinPerKmString()})",
                            MedianDistance = $"{medianDistance.ToKmString()} (min: {(medianDistance / 3).ToKmString()}, max: {(medianDistance * 3).ToKmString()})",
                            TotalLaps = activity.Laps.Count
                        }
                    };
                })
                .ToList();
        }
    }
}
