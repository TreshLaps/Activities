import styles from './ValueTd.module.css';
import { ItemValue, ItemValueType } from '../models/ResultItem';
import {
    getFeelingEmoji,
    getKmString,
    getPaceString,
    getTimeString,
    round,
} from './Formatters';

interface ValueTdProps {
    item: ItemValue;
    activityType?: string | undefined;
    title?: string | undefined;
}

function ValueTd({ item, activityType, title }: ValueTdProps) {
    if (item == null) {
        return (
            <td>
                <span className={styles.valueTdLabel}>-</span>
            </td>
        );
    }

    let value = round(item.value, 0);
    let color = '#aaa';

    switch (item.type) {
        case ItemValueType.DistanceInMeters:
            value = getKmString(item.value);
            color = '#005dff';
            break;
        case ItemValueType.MetersPerSecond:
            value = getPaceString(item.value, activityType ?? '');
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
        case ItemValueType.Feeling:
            value = getFeelingEmoji(item.value);
            break;
        default:
    }

    return (
        <td title={title}>
            <div className={styles.valueContainer}>
                <span className={styles.valueTdLabel}>{value}</span>
                {item.factor > 0 && (
                    <>
                        <div
                            className={styles.valueTdFactorBackground}
                            style={{
                                backgroundColor: 'rgba(240, 240, 240, 0.7)',
                            }}
                        />
                        <div
                            className={styles.valueTdFactor}
                            style={{
                                width: `${item.factor * 100}%`,
                                backgroundColor: color,
                            }}
                        />
                    </>
                )}
            </div>
        </td>
    );
}

export default ValueTd;
