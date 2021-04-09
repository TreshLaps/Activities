import React from 'react';
import styled from 'styled-components';
import { getKmString, getPaceString, getTimeString, round } from '../utils/Formatters';

export const EmptyThead = styled.thead``;

export const Table = styled.table`
  width: 100%;
  border-spacing: 0;
  border-collapse: separate;
  border-radius: 3px;
  margin-bottom: 20px;
  background: #fff;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  @media (min-width: 1024px) {
    table-layout: fixed;
  }

  @media (max-width: 768px) {
    font-size: 11px;
    line-height: 1.3;
  }

  > thead > tr > th {
    text-align: right;
    padding: 15px;
    font-size: inherit;
    line-height: 1;
    background: #bdc9ce;

    &:first-child {
      text-align: left;
      padding-left: 20px;
    }

    &:last-child {
      padding-right: 20px;
    }

    @media (max-width: 768px) {
      padding: 5px;

      &:first-child {
        padding-left: 10px;
      }

      &:last-child {
        padding-right: 10px;
      }
    }
  }

  > ${EmptyThead} > tr > th {
    background: #ddd;
    padding-top: 10px;
    padding-bottom: 10px;
    font-weight: normal;

    @media (max-width: 768px) {
      padding-top: 5px;
      padding-bottom: 5px;
    }
  }

  > tbody > tr {
    > td {
      border-top: thin solid #efefef;
    }

    &:nth-child(odd) {
      background: #fafafa;
    }

    > td {
      max-width: 300px;
      text-align: right;
      vertical-align: text-top;
      padding: 5px 10px;
      white-space: nowrap;
      position: relative;

      &:first-child {
        text-align: left;
        padding-left: 20px;
      }

      &:last-child {
        padding-right: 20px;
      }

      @media (max-width: 768px) {
        padding: 5px;

        &:first-child {
          padding-left: 10px;
        }

        &:last-child {
          padding-right: 10px;
        }
      }
    }
  }
`;

export const SmallTable = styled(Table)`
  font-size: 11px;
  line-height: 1.3;
  table-layout: auto;

  > thead > tr > th {
    padding: 10px;
  }
`;

const ValueTdLabel = styled.span`
  z-index: 1;
  position: relative;
  display: block;
  padding-right: 3px;
`;

const ValueTdFactor = styled.div<{ color: string }>`
  position: absolute;
  right: 0;
  top: -4px;
  bottom: -4px;
  opacity: 0.3;
  background: ${(props) => props.color};
`;

const ValueContainer = styled.div`
  position: relative;
`;

export const ValueTd = (item: any) => {
  if (item == null) {
    return <td>-</td>;
  }

  let value = round(item.value, 1);
  let color = '#a0a20a';

  switch (item.type) {
    case 1:
      value = getKmString(item.value);
      color = '#005dff';
      break;
    case 2:
      value = getPaceString(item.value);
      color = '#00a000';
      break;
    case 3:
      value = getTimeString(item.value);
      color = '#005dff';
      break;
    case 4:
      value = parseInt(item.value, 10).toString();
      color = '#ff1700';
      break;
  }

  return (
    <td>
      <ValueContainer>
        <ValueTdLabel>{value}</ValueTdLabel>
        {item.factor > 0 && <ValueTdFactor style={{ width: `${item.factor * 100}%` }} color={color} />}
      </ValueContainer>
    </td>
  );
};
