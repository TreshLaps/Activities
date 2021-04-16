import React from 'react';
import styled from 'styled-components';
import { ItemValue, ItemValueType } from '../models/ResultItem';
import {
  getKmString, getPaceString, getTimeString, round,
} from './Formatters';

const ValueTdLabel = styled.span`
  z-index: 1;
  position: relative;
  display: block;
  min-width: 60px;
  padding: 2px 0;
  padding-right: 3px;

  @media (max-width: 768px) {
    min-width: 40px;
  }
`;

const ValueTdFactor = styled.div<{ color: string }>`
  position: absolute;
  right: 0;
  top: -4px;
  bottom: -4px;
  opacity: 0.3;
  max-width: 100%;
  background: ${(props) => props.color};
  border-radius: 3px;
`;

const ValueTdFactorBackground = styled(ValueTdFactor)`
  opacity: 1;
  width: 100%;
`;

const ValueContainer = styled.div`
  position: relative;
`;

const ValueTd: React.FC<{ item: ItemValue }> = (props) => {
  const { item } = props;

  if (item == null) {
    return <td><ValueTdLabel>-</ValueTdLabel></td>;
  }

  let value = round(item.value, 0);
  let color = '#aaa';

  switch (item.type) {
    case ItemValueType.DistanceInMeters:
      value = getKmString(item.value);
      color = '#005dff';
      break;
    case ItemValueType.MetersPerSecond:
      value = getPaceString(item.value);
      color = '#00a000';
      break;
    case ItemValueType.TimeInSeconds:
      value = getTimeString(item.value);
      color = '#005dff';
      break;
    case ItemValueType.Heartrate:
      value = Math.round(item.value).toString();
      color = '#ff1700';
      break;
    case ItemValueType.Lactate:
      value = round(item.value, 1);
      color = '#a0a20a';
      break;
    default:
  }

  return (
    <td>
      <ValueContainer>
        <ValueTdLabel>{value}</ValueTdLabel>
        {item.factor > 0
    && (
    <>
      <ValueTdFactorBackground color="#f5f5f5" />
      <ValueTdFactor style={{ width: `${item.factor * 100}%` }} color={color} />
    </>
    )}
      </ValueContainer>
    </td>
  );
};

export default ValueTd;
