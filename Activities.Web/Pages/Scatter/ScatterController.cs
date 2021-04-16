using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Activities.Strava.Activities;
using Activities.Strava.Endpoints;
using Microsoft.AspNetCore.Mvc;

namespace Activities.Web.Pages.Scatter
{
    public class ScatterController : BaseActivitiesController
    {
        public ScatterController(ActivitiesClient activitiesClient) : base(activitiesClient)
        {
        }

        [HttpGet]
        public async Task<List<Item>> Get([FromQuery] FilterRequest filterRequest)
        {
            var activities = (await GetDetailedActivities(filterRequest));

            var result = new List<Item>();

            if (filterRequest.DataType == FilterDataType.Activity)
            {
                foreach (var activity in activities)
                {
                    result.Add(
                        new Item
                        {
                            Distance = activity.Distance,
                            ElapsedTime = activity.ElapsedTime,
                            MovingTime = activity.MovingTime,
                            Pace = activity.AverageSpeed,
                            AverageHeartrate = activity.AverageHeartrate,
                            MaxHeartrate = activity.MaxHeartrate
                        });
                }
            }
            else if (filterRequest.DataType == FilterDataType.Interval)
            {
                foreach (var activity in activities.Where(activity => activity.Laps != null))
                {
                    if (!activity.Laps.Any(lap => lap.IsInterval))
                    {
                        continue;
                    }

                    //result.Add(
                    //    new Item
                    //    {
                    //        Distance = activity.Laps.Where(lap => lap.IsInterval).Sum(lap => lap.Distance),
                    //        ElapsedTime = activity.Laps.Where(lap => lap.IsInterval).Sum(lap => lap.ElapsedTime),
                    //        MovingTime = activity.Laps.Where(lap => lap.IsInterval).Sum(lap => lap.MovingTime),
                    //        Pace = activity.Laps.Where(lap => lap.IsInterval).Average(lap => lap.AverageSpeed),
                    //        AverageHeartrate = activity.Laps.Where(lap => lap.IsInterval).Average(lap => lap.AverageHeartrate),
                    //        MaxHeartrate = activity.Laps.Where(lap => lap.IsInterval).Max(lap => lap.MaxHeartrate)
                    //    });
                    foreach (var lap in activity.Laps.Where(lap => lap.IsInterval))
                    {
                        result.Add(
                            new Item
                            {
                                Distance = lap.Distance,
                                ElapsedTime = lap.ElapsedTime,
                                MovingTime = lap.MovingTime,
                                Pace = lap.AverageSpeed,
                                AverageHeartrate = lap.AverageHeartrate,
                                MaxHeartrate = lap.MaxHeartrate
                            });
                    }
                }
            }

            return result;
        }
    }

    public class Item
    {
        public double Distance { get; init; }
        public double ElapsedTime { get; init; }
        public double MovingTime { get; init; }
        public double Pace { get; init; }
        public double AverageHeartrate { get; init; }
        public double MaxHeartrate { get; init; }
    }
}