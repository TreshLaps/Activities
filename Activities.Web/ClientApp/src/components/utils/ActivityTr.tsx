import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import ValueTd from './ValueTd';
import { ItemValue, ResultItem } from '../models/ResultItem';

export interface Activity extends ResultItem {
  id: number;
  date: string;
  name: string;
  type: string;
  description: string;
  distance: ItemValue;
  elapsedTime: ItemValue;
  pace: ItemValue;
  heartrate: ItemValue;
  lactate: ItemValue;
}

const DescriptionText = styled.div`
    font-size: 9px;
    white-space: normal;
    line-height: 1.1;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const BoldNavLink = styled(NavLink)`
    font-weight: 500;
    text-decoration: none;
  `;

const TypeEmoji = styled.span`
    display: inline-block;
    font-size: 17px;
    width: 30px;
  
    @media (max-width: 768px) {
      font-size: 13px;
      width: 17px;
      position: absolute;
      left: 4px;
      top: calc(50% - 8px);
    }
`;

const ActivityDate = styled.span`  
  @media (max-width: 768px) {
    white-space: pre-line;
    margin-left: 15px;
    display: block;
    font-size: 9px;
    line-height: 1;
  }
`;

const getActivityEmoji = (type: string) => {
  switch (type) {
    case 'Run':
      return '🏃‍♂️';
    case 'Ride':
    case 'VirtualRide':
      return '🚴‍♂️';
    case 'NordicSki':
      return '⛷';
    default:
      return '';
  }
};

const ActivityTr: React.FC<{ activity: Activity, showLactate: boolean }> = (props) => {
  const { activity, showLactate } = props;

  return (
    <tr key={activity.id}>
      <td>
        <div>
          <TypeEmoji title={activity.type}>{getActivityEmoji(activity.type)}</TypeEmoji>
          <ActivityDate>{activity.date}</ActivityDate>
        </div>
      </td>
      <td style={{ textAlign: 'left', width: '100%', whiteSpace: 'pre-wrap' }}>
        <BoldNavLink to={`activities/${activity.id}`}>{activity.name}</BoldNavLink>
        <DescriptionText>{activity.description}</DescriptionText>
      </td>
      <ValueTd item={activity.distance} />
      <ValueTd item={activity.elapsedTime} />
      <ValueTd item={activity.pace} />
      <ValueTd item={activity.heartrate} />
      {showLactate && <ValueTd item={activity.lactate} />}
    </tr>
  );
};

export default ActivityTr;
