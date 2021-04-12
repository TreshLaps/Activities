using System.Collections.Generic;

namespace Activities.Web.Pages.Activities.Models
{
    public class ActivityGroup
    {
        public string Name { get; set; }
        public List<Activity> Items { get; set; }
    }
}