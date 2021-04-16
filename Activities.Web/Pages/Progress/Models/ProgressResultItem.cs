using Activities.Core.DataTables;

namespace Activities.Web.Pages.Progress.Models
{
    public class ProgressResultItem
    {
        public string Name { get; set; }
        public ItemValue ActivityCount { get; set; }
        public ItemValue Distance { get; set; }
        public ItemValue Pace { get; set; }
        public ItemValue ElapsedTime { get; set; }
        public ItemValue Heartrate { get; set; }
        public ItemValue Lactate { get; set; }
    }
}