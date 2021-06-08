namespace Activities.Core.DataTables
{
    public class ItemValue
    {
        public double Value { get; }
        public ItemValueType Type { get; }
        public double Factor { get; set; }

        public ItemValue(double value, ItemValueType type)
        {
            Value = value;
            Type = type;
        }

        public static ItemValue TryCreate(double? value, ItemValueType type)
        {
            return value.HasValue ? new ItemValue(value.Value, type) : null;
        }
    }

    public enum ItemValueType
    {
        Number = 0,
        DistanceInMeters = 1,
        MetersPerSecond = 2,
        TimeInSeconds = 3,
        Heartrate = 4,
        Lactate = 5,
        AverageNumber = 6
    }
}