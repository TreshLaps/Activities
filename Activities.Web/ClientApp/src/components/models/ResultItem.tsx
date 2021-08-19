export enum ItemValueType {
  Number = 0,
  DistanceInMeters = 1,
  MetersPerSecond = 2,
  TimeInSeconds = 3,
  Heartrate = 4,
  Lactate = 5,
  AverageNumber = 6,
  Feeling = 7,
}

export interface ItemValue {
  value: number;
  factor: number;
  type: ItemValueType
}

export interface ResultItem {
  activityCount: ItemValue;
  distance: ItemValue;
  elapsedTime: ItemValue;
  pace: ItemValue;
  heartrate: ItemValue;
  lactate: ItemValue;
  laps: ItemValue;
  feeling: ItemValue;
}
