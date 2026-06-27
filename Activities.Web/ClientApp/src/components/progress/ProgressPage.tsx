import { useState, useEffect } from 'react';
import styles from '../../styles/styles.module.css';
import Loader, { LoadingStatus } from '../utils/Loader';
import tableStyles from '../utils/Table.module.css';
import ActivityFilter, {
    filtersChanged,
    getUrlWithFilters,
    Filters,
} from '../utils/ActivityFilter';
import ValueTd from '../utils/ValueTd';
import ValueTh from '../utils/ValueTh';
import { ItemValue, ResultItem } from '../models/ResultItem';

export interface ProgressResultItem extends ResultItem {
    name: string;
    activityCount: ItemValue;
    distance: ItemValue;
    elapsedTime: ItemValue;
    pace: ItemValue;
    heartrate: ItemValue;
    lactate: ItemValue;
}

const ProgressPage = () => {
    const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.None);
    const [filters, setFilters] = useState<Filters>();
    const [progress, setProgress] = useState<ProgressResultItem[]>();

    const onFilterChange = (newFilters: Filters) => {
        if (filtersChanged(filters, newFilters)) {
            setLoadingStatus(LoadingStatus.Loading);
            setFilters(newFilters);
        }
    };

    useEffect(() => {
        if (filters === undefined) {
            return;
        }

        fetch(getUrlWithFilters('/api/progress/', filters))
            .then((response) => {
                if (!response.ok) {
                    throw new Error();
                }
                return response.json() as Promise<ProgressResultItem[]>;
            })
            .then((data) => {
                setProgress(data);
                setLoadingStatus(LoadingStatus.None);
            })
            .catch(() => {
                setProgress([]);
                setLoadingStatus(LoadingStatus.Error);
            });
    }, [filters]);

    const showLactate =
        progress &&
        (progress.filter((item) => item.lactate).length > 0 || false) === true;

    return (
        <div>
            <ActivityFilter onChange={onFilterChange} />
            <Loader status={loadingStatus} />
            {loadingStatus === LoadingStatus.None &&
                progress &&
                progress.length > 0 && (
                    <div className={styles.tableContainer}>
                        <table className={tableStyles.fixedWidthTable}>
                            <thead>
                                <tr>
                                    <th>&nbsp;</th>
                                    <ValueTh
                                        items={progress}
                                        valueFunc={(item) => item.activityCount}
                                    />
                                    <ValueTh
                                        items={progress}
                                        valueFunc={(item) => item.distance}
                                    />
                                    <ValueTh
                                        items={progress}
                                        valueFunc={(item) => item.elapsedTime}
                                    />
                                    <ValueTh
                                        items={progress}
                                        valueFunc={(item) => item.pace}
                                    />
                                    <ValueTh
                                        items={progress}
                                        valueFunc={(item) => item.heartrate}
                                    />
                                    {showLactate && (
                                        <ValueTh
                                            items={progress}
                                            valueFunc={(item) => item.lactate}
                                        />
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {progress.map((item) => (
                                    <tr key={item.name}>
                                        <td>{item.name}</td>
                                        <ValueTd item={item.activityCount} />
                                        <ValueTd item={item.distance} />
                                        <ValueTd item={item.elapsedTime} />
                                        <ValueTd item={item.pace} />
                                        <ValueTd item={item.heartrate} />
                                        {showLactate && (
                                            <ValueTd item={item.lactate} />
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
        </div>
    );
};

export default ProgressPage;
