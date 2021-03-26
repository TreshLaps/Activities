using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Activities.Core.Extensions;
using Activities.Strava.Endpoints;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;

namespace Activities.Web.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    public class MonthsController : ControllerBase
    {
        private readonly ActivitiesClient _activitiesClient;

        public MonthsController(ActivitiesClient activitiesClient)
        {
            _activitiesClient = activitiesClient;
        }

        [HttpGet]
        public async Task<dynamic> Get()
        {
            var accessToken = await HttpContext.GetTokenAsync("access_token");
            var athleteId = Convert.ToInt64(HttpContext.User.Claims.First(claim => claim.Type == ClaimTypes.NameIdentifier).Value);
            var activities = await _activitiesClient.GetActivities(accessToken, athleteId);

            return activities
                .GroupBy(activity => activity.StartDate.ToString("MMM yyyy"))
                .Select(
                    month => new
                    {
                        Month = month.Key,
                        Run = month.Where(activity => activity.Type == "Run").Sum(activity => activity.MovingTime).ToTimeString(),
                        NordicSki = month.Where(activity => activity.Type == "NordicSki").Sum(activity => activity.MovingTime).ToTimeString(),
                        Ride = month.Where(activity => activity.Type == "Ride").Sum(activity => activity.MovingTime).ToTimeString(),
                        VirtualRide = month.Where(activity => activity.Type == "VirtualRide").Sum(activity => activity.MovingTime).ToTimeString(),
                        Total = month.Sum(activity => activity.MovingTime).ToTimeString()
                    })
                .ToList();
        }
    }
}
