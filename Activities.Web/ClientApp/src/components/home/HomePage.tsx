import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import pageStyles from './HomePage.module.css';
import styles from '../../styles/styles.module.css';
import Loader, { LoadingStatus } from '../utils/Loader';
import tableStyles from '../utils/Table.module.css';
import ValueTd from '../utils/ValueTd';
import ValueTh from '../utils/ValueTh';
import { getActivityEmoji } from '../../styles/TypeEmoji';
import ActivityTr, { Activity } from '../utils/ActivityTr';

const progressTable = (name: string, items: Activity[]) => (
    <table className={tableStyles.smallTable} key={name}>
        <thead>
            <tr>
                <th>{getActivityEmoji(name)}</th>
                <ValueTh
                    items={items}
                    valueFunc={(item) => item.activityCount}
                />
                <ValueTh items={items} valueFunc={(item) => item.distance} />
                <ValueTh items={items} valueFunc={(item) => item.elapsedTime} />
                <ValueTh items={items} valueFunc={(item) => item.pace} />
                <ValueTh items={items} valueFunc={(item) => item.heartrate} />
            </tr>
        </thead>
        <tbody>
            {items.map((item) => (
                <tr key={item.name}>
                    <td>{item.name}</td>
                    <td>{item.activityCount?.value}</td>
                    <ValueTd item={item.distance} />
                    <ValueTd item={item.elapsedTime} />
                    <ValueTd item={item.pace} />
                    <ValueTd item={item.heartrate} />
                </tr>
            ))}
        </tbody>
    </table>
);

interface ActivitySummary {
    name: string;
    summary: Activity[];
}

const ProgressSummary = () => {
    const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.Loading);
    const [progress, setProgress] = useState<ActivitySummary[]>();

    useEffect(() => {
        fetch('/api/progress/summary')
            .then((response) => response.json() as Promise<ActivitySummary[]>)
            .then((data) => {
                setProgress(data);
                setLoadingStatus(LoadingStatus.None);
            })
            .catch(() => {
                setProgress([]);
                setLoadingStatus(LoadingStatus.Error);
            });
    }, []);

    return (
        <>
            <Loader status={loadingStatus} />
            {loadingStatus === LoadingStatus.None && progress && (
                <>
                    <h2 className={styles.subHeader}>Progress overview</h2>
                    <div
                        className={styles.grid}
                        style={
                            { '--grid-num-columns': 3 } as React.CSSProperties
                        }
                    >
                        {progress.map((item) =>
                            progressTable(item.name, item.summary),
                        )}
                    </div>
                    <NavLink className={pageStyles.pageLink} to="/progress">
                        View all progress
                    </NavLink>
                </>
            )}
        </>
    );
};

const ActivitiesSummary = () => {
    const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.Loading);
    const [activities, setActivities] = useState<Activity[]>();

    useEffect(() => {
        fetch('/api/activities/summary')
            .then((response) => response.json() as Promise<Activity[]>)
            .then((data) => {
                setActivities(data);
                setLoadingStatus(LoadingStatus.None);
            })
            .catch(() => {
                setActivities([]);
                setLoadingStatus(LoadingStatus.Error);
            });
    }, []);

    const showLactate =
        (activities &&
            activities.filter((activity) => activity.lactate).length > 0) ===
        true;

    const showFeeling =
        (activities &&
            activities.filter((activity) => activity.feeling != null).length >
                0) === true;

    return (
        <>
            <Loader status={loadingStatus} />
            {loadingStatus === LoadingStatus.None && activities && (
                <>
                    <h2 className={styles.subHeader}>Latest activities</h2>
                    <div>
                        <div className={styles.tableContainer}>
                            <table
                                className={tableStyles.table}
                                style={{ marginBottom: '10px' }}
                            >
                                <thead>
                                    <tr>
                                        <th colSpan={2}>&nbsp;</th>
                                        <ValueTh
                                            items={activities}
                                            valueFunc={(item) => item.distance}
                                            title="Distance"
                                        />
                                        <ValueTh
                                            items={activities}
                                            valueFunc={(item) =>
                                                item.elapsedTime
                                            }
                                            title="Time"
                                        />
                                        <ValueTh
                                            items={activities}
                                            valueFunc={(item) => item.pace}
                                            title="Pace"
                                        />
                                        <ValueTh
                                            items={activities}
                                            valueFunc={(item) => item.heartrate}
                                            title="Heartrate"
                                        />
                                        {showLactate && (
                                            <ValueTh
                                                items={activities}
                                                valueFunc={(item) =>
                                                    item.lactate
                                                }
                                                title="Lactate"
                                            />
                                        )}
                                        {showFeeling && (
                                            <th title="Feeling">
                                                &nbsp;&nbsp;&nbsp;
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {activities.map((activity) => (
                                        <ActivityTr
                                            key={activity.id}
                                            activity={activity}
                                            showLactate={showLactate}
                                            showFeeling={showFeeling}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <NavLink className={pageStyles.pageLink} to="/activities">
                        View all activities
                    </NavLink>
                </>
            )}
        </>
    );
};

const HomePage = () => (
    <div style={{ paddingTop: '10px' }}>
        <ActivitiesSummary />
        <ProgressSummary />
    </div>
);

export default HomePage;
