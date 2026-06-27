import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import styles from '../../styles/styles.module.css';
import {
    getDateString,
    getKmString,
    getPaceString,
    getTimeString,
} from '../utils/Formatters';
import Loader, { LoadingStatus } from '../utils/Loader';

interface Activity {
    id: number;
    name: string;
    type: string;
    movingTime: number;
    startDate: string;
    distance: number;
    averageSpeed: number;
}

const RacesPage = () => {
    const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.Loading);
    const [activities, setActivities] = useState<Activity[]>();

    useEffect(() => {
        fetch('/api/races/')
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

    return (
        <>
            <Loader status={loadingStatus} />
            {loadingStatus === LoadingStatus.None && activities && (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Distance</th>
                                <th>Speed</th>
                                <th>Time</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activities?.map((activity) => (
                                <tr key={activity.id}>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>
                                            <NavLink
                                                to={`/activities/${activity.id}`}
                                            >
                                                {activity.name}
                                            </NavLink>
                                        </div>
                                    </td>
                                    <td className={styles.noWrapTd}>
                                        {getKmString(activity.distance)}
                                    </td>
                                    <td className={styles.noWrapTd}>
                                        {getPaceString(
                                            activity.averageSpeed,
                                            activity.type,
                                        )}
                                    </td>
                                    <td className={styles.noWrapTd}>
                                        {getTimeString(activity.movingTime)}
                                    </td>
                                    <td className={styles.noWrapTd}>
                                        {getDateString(activity.startDate)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
};

export default RacesPage;
