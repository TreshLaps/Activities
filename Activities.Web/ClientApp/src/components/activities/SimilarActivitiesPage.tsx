import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from '../../styles/styles.module.css';
import Loader, { LoadingStatus } from '../utils/Loader';
import tableStyles from '../utils/Table.module.css';
import ActivityTr, { Activity } from '../utils/ActivityTr';
import ValueTh from '../utils/ValueTh';

interface SimilarResponse {
    activities: ActivityGroup[];
}

interface ActivityGroup {
    name: string;
    items: Activity[];
}

const SimiliarActivitiesPage = () => {
    const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.None);
    const [activities, setActivities] = useState<ActivityGroup[]>();

    const { id } = useParams<{ id: string | undefined }>();

    const [prevId, setPrevId] = useState(id);
    if (id !== prevId) {
        setPrevId(id);
        setLoadingStatus(LoadingStatus.Loading); // The load will happen in useEffect() below.
    }

    useEffect(() => {
        fetch(`/api/activities/${id}/similar`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error();
                }
                return response.json() as Promise<SimilarResponse>;
            })
            .then((data) => {
                setActivities(data.activities);
                setLoadingStatus(LoadingStatus.None);
            })
            .catch(() => {
                setActivities([]);
                setLoadingStatus(LoadingStatus.Error);
            });
    }, [id]);

    const showLactate =
        (activities &&
            activities.filter(
                (group) =>
                    group.items?.filter((activity) => activity.lactate).length >
                        0 || false,
            ).length > 0) === true;

    const showFeeling =
        (activities &&
            activities.filter((group) =>
                group.items?.filter((activity) => activity.feeling != null),
            ).length > 0) === true;

    const numberOfColumns = 7 + (showFeeling ? 1 : 0) + (showLactate ? 1 : 0);

    return (
        <div>
            <Loader status={loadingStatus} />
            {loadingStatus === LoadingStatus.None && activities && (
                <div>
                    <div className={styles.tableContainer}>
                        <table className={tableStyles.table}>
                            {activities?.map((group) => (
                                <React.Fragment key={group.name}>
                                    {group.items.length > 0 && (
                                        <thead>
                                            <tr>
                                                <th colSpan={2} id={group.name}>
                                                    {group.name}
                                                </th>
                                                <ValueTh
                                                    items={group.items}
                                                    valueFunc={(item) =>
                                                        item.laps
                                                    }
                                                    title="Laps"
                                                />
                                                <ValueTh
                                                    items={group.items}
                                                    valueFunc={(item) =>
                                                        item.distance
                                                    }
                                                    title="Distance"
                                                />
                                                <ValueTh
                                                    items={group.items}
                                                    valueFunc={(item) =>
                                                        item.elapsedTime
                                                    }
                                                    title="Time"
                                                />
                                                <ValueTh
                                                    items={group.items}
                                                    valueFunc={(item) =>
                                                        item.pace
                                                    }
                                                    title="Pace"
                                                />
                                                <ValueTh
                                                    items={group.items}
                                                    valueFunc={(item) =>
                                                        item.heartrate
                                                    }
                                                    title="Heartrate"
                                                />
                                                {showLactate && (
                                                    <ValueTh
                                                        items={group.items}
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
                                    )}
                                    {group.items.length === 0 && (
                                        <thead
                                            className={tableStyles.emptyThead}
                                        >
                                            <tr>
                                                <th
                                                    colSpan={numberOfColumns}
                                                    id={group.name}
                                                >
                                                    {group.name}
                                                </th>
                                            </tr>
                                        </thead>
                                    )}
                                    <tbody>
                                        {group.items.map((activity) => (
                                            <ActivityTr
                                                key={activity.id}
                                                activity={activity}
                                                showLactate={showLactate}
                                                showFeeling={showFeeling}
                                            />
                                        ))}
                                    </tbody>
                                </React.Fragment>
                            ))}
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SimiliarActivitiesPage;
