import { NavLink } from 'react-router-dom';
import styles from './ActivityTr.module.css';
import ValueTd from './ValueTd';
import { ItemValue, ResultItem } from '../models/ResultItem';
import { getActivityEmoji } from '../../styles/TypeEmoji';
import { getFeelingEmoji, getFeelingTitle } from './Formatters';

export interface Activity extends ResultItem {
    id: number;
    date: string;
    name: string;
    type: string;
    isBislettInterval?: boolean;
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

interface ActivityTrProps {
    activity: Activity;
    showLactate: boolean;
    showFeeling: boolean;
}

function ActivityTr({ activity, showLactate, showFeeling }: ActivityTrProps) {
    return (
        <tr
            key={activity.id}
            style={
                activity.isRace
                    ? {
                          background:
                              'linear-gradient(to right, #cfa652, #FCF6BA, #B38728)',
                      }
                    : undefined
            }
        >
            <td>
                <div>
                    <span
                        className={styles.typeEmoji}
                        title={
                            activity.isBislettInterval
                                ? 'Bislett'
                                : activity.type
                        }
                    >
                        {getActivityEmoji(
                            activity.type,
                            activity.isBislettInterval,
                        )}
                    </span>
                    <span className={styles.activityDate}>{activity.date}</span>
                </div>
            </td>
            <td
                style={{
                    textAlign: 'left',
                    width: '100%',
                    whiteSpace: 'pre-wrap',
                }}
            >
                <NavLink
                    className={styles.boldNavLink}
                    to={`/activities/${activity.id}`}
                >
                    {activity.name}
                </NavLink>
                <div className={styles.descriptionText}>
                    {activity.description}
                </div>
            </td>
            {activity.laps && <ValueTd item={activity.laps} title="Laps" />}
            <ValueTd item={activity.distance} title="Distance" />
            <ValueTd item={activity.elapsedTime} title="Time" />
            <ValueTd
                item={activity.pace}
                activityType={activity.type}
                title="Pace"
            />
            <ValueTd item={activity.heartrate} title="Heartrate" />
            {showLactate && <ValueTd item={activity.lactate} title="Lactate" />}
            {showFeeling && activity.feeling && (
                <td>
                    <div>
                        <span
                            className={styles.feelingEmoji}
                            title={getFeelingTitle(activity.feeling.value)}
                        >
                            {getFeelingEmoji(activity.feeling.value)}
                        </span>
                    </div>
                </td>
            )}
            {showFeeling && activity.feeling == null && (
                <td>
                    <div>&nbsp;</div>
                </td>
            )}
        </tr>
    );
}

export default ActivityTr;
