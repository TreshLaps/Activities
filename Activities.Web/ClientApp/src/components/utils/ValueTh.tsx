import React from 'react';
import styled from 'styled-components';
import { ItemValue, ItemValueType, ResultItem } from '../models/ResultItem';
import {
  AveragePace,
  getKmString, getPaceString, getTimeString, round,
} from './Formatters';

const Th = styled.th`
  white-space: nowrap;
`;

const ValueTh: React.FC<{
  items: ResultItem[],
  valueFunc: (item:ResultItem) => ItemValue,
  activityType?: string | undefined,
  title?: string | undefined }> = (props) => {
  const {
    items,
    valueFunc,
    activityType,
    title,
  } = props;

  if (items == null || items.length === 0) {
    return <Th>&nbsp;</Th>;
  }

  const values = items.filter((item) => valueFunc(item)).map((item) => valueFunc(item).value);

  if (values.length === 0) {
    return <Th>&nbsp;</Th>;
  }

  const { type } = valueFunc(items.filter((item) => valueFunc(item))[0]);
  const summedValue = values.reduce((sum, value) => sum + value);
  const averageValue = summedValue / values.length;
  let value = round(summedValue, 0);

  switch (type) {
    case ItemValueType.DistanceInMeters:
      value = getKmString(summedValue);
      break;
    case ItemValueType.MetersPerSecond:
      value = getPaceString(AveragePace(items, (item) => item.elapsedTime?.value, (item) => item.pace?.value) || 0,
        activityType ?? '', true);
      break;
    case ItemValueType.TimeInSeconds:
      value = getTimeString(summedValue);
      break;
    case ItemValueType.Heartrate:
      value = Math.round(averageValue).toString();
      break;
    case ItemValueType.Lactate:
    case ItemValueType.AverageNumber:
      value = round(averageValue, 1);
      break;
    default:
  }

  return (
    <Th title={title}>{value}</Th>
  );
};

export default ValueTh;
