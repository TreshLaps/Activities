using Activities.Core.DataTables;

namespace Activities.Web.Pages.Activities.Models
{
    public class Activity
    {
        public long Id { get; set; }
        public string Type { get; set; }
        public string Date { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public ItemValue Distance { get; set; }
        public ItemValue ElapsedTime { get; set; }
        public ItemValue Pace { get; set; }
        public ItemValue Heartrate { get; set; }
        public ItemValue Lactate { get; set; }
        public ItemValue Feeling { get; set; }
    }
}