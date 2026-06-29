import styles from './ValueTh.module.css';
import { ItemValue, ItemValueType, ResultItem } from '../models/ResultItem';
import {
    AveragePace,
    getKmString,
    getPaceString,
    getTimeString,
    round,
} from './Formatters';

interface ValueThProps {
    items: ResultItem[];
    valueFunc: (item: ResultItem) => ItemValue;
    activityType?: string | undefined;
    title?: string | undefined;
}

function ValueTh({ items, valueFunc, activityType, title }: ValueThProps) {
    if (items == null || items.length === 0) {
        return <th className={styles.th}>&nbsp;</th>;
    }

    const values = items
        .filter((item) => valueFunc(item))
        .map((item) => valueFunc(item).value);

    if (values.length === 0) {
        return <th className={styles.th}>&nbsp;</th>;
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
            value = getPaceString(
                AveragePace(
                    items,
                    (item) => item.elapsedTime?.value,
                    (item) => item.pace?.value,
                ) || 0,
                activityType ?? '',
                true,
            );
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
        <th className={styles.th} title={title}>
            {value}
        </th>
    );
}

export default ValueTh;
