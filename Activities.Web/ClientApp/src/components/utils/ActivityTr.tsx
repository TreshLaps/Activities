import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import ValueTd from './ValueTd';
import { ItemValue, ResultItem } from '../models/ResultItem';
import { getActivityEmoji, getActivityTitle } from '../../styles/TypeEmoji';
import { getFeelingEmoji, getFeelingTitle } from './Formatters';

export interface Activity extends ResultItem {
  id: number;
  date: string;
  name: string;
  type: string;
  isBislettInterval?: boolean;
  isTreadmillInterval?: boolean;
  isRace?: boolean;
  description: string;
  distance: ItemValue;
  elapsedTime: ItemValue;
  pace: ItemValue;
  heartrate: ItemValue;
  lactate: ItemValue;
  laps: ItemValue;
  feeling: ItemValue;
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

const ActivityDate = styled.span`  
  @media (max-width: 768px) {
    white-space: pre-line;
    margin-left: 15px;
    display: block;
    font-size: 9px;
    line-height: 1;
  }
`;

export const TypeEmoji = styled.span`
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

export const FeelingEmoji = styled.span`
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

const ActivityTr: React.FC<{ activity: Activity, showLactate: boolean, showFeeling: boolean }> = (props) => {
  const { activity, showLactate, showFeeling } = props;

  return (
    <tr key={activity.id} style={activity.isRace ? { background: 'linear-gradient(to right, #cfa652, #FCF6BA, #B38728)' } : undefined}>
      <td>
        <div>
          <TypeEmoji title={getActivityTitle(activity.type, activity.isBislettInterval, activity.isTreadmillInterval)}>
            {getActivityEmoji(activity.type, activity.isBislettInterval, activity.isTreadmillInterval)}
          </TypeEmoji>
          <ActivityDate>{activity.date}</ActivityDate>
        </div>
      </td>
      <td style={{ textAlign: 'left', width: '100%', whiteSpace: 'pre-wrap' }}>
        <BoldNavLink to={`/activities/${activity.id}`}>{activity.name}</BoldNavLink>
        <DescriptionText>{activity.description}</DescriptionText>
      </td>
      {activity.laps && <ValueTd item={activity.laps} title="Laps" />}
      <ValueTd item={activity.distance} title="Distance" />
      <ValueTd item={activity.elapsedTime} title="Time" />
      <ValueTd item={activity.pace} title="Pace" />
      <ValueTd item={activity.heartrate} title="Heartrate" />
      {showLactate && <ValueTd item={activity.lactate} title="Lactate" />}
      {(showFeeling && activity.feeling)
      && (
        <td>
          <div>
            <FeelingEmoji title={getFeelingTitle(activity.feeling.value)}>
              {getFeelingEmoji(activity.feeling.value)}
            </FeelingEmoji>
          </div>
        </td>
      )}
      {(showFeeling && activity.feeling == null)
      && (
        <td>
          <div>&nbsp;</div>
        </td>
      )}
    </tr>
  );
};

export default ActivityTr;
