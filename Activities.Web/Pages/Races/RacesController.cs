using System.Collections.Generic;
using System.Threading.Tasks;
using Activities.Strava.Authentication;
using Activities.Web.Pages.Races.Models;
using Activities.Web.Pages.Races.Services;
using Microsoft.AspNetCore.Mvc;

namespace Activities.Web.Pages.Races
{
    [ApiController]
    [Route("api/[controller]")]
    [StravaAuthenticationFilter]
    public class RacesController : ControllerBase
    {
        private readonly RaceService _raceService;

        public RacesController(RaceService raceService)
        {
            _raceService = raceService;
        }

        [HttpGet]
        public async Task<List<RaceResult>> Get()
        {
            var stravaAthlete = await HttpContext.TryGetStravaAthlete();
            return await _raceService.GetRaces(stravaAthlete.AccessToken, stravaAthlete.AthleteId);
        }
    }
}
