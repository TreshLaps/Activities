import React, { useState, useEffect } from 'react';
import '../../../node_modules/react-vis/dist/style.css';
import { TableContainer } from '../../styles/styles';
import Loader, { LoadingStatus } from '../utils/Loader';
import ActivityFilter, {
    getUrlWithFilters,
    Filters,
} from '../utils/ActivityFilter';
import { EmptyThead, Table } from '../utils/Table';
import ActivityTr, { Activity } from '../utils/ActivityTr';
import ValueTh from '../utils/ValueTh';

interface ActivityResponse {
    activities: ActivityGroup[];
}

interface ActivityGroup {
    name: string;
    items: Activity[];
}

const ActivitiesPage: React.FC = () => {
    const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.None);
    const [filters, setFilters] = useState<Filters>();
    const [activities, setActivities] = useState<ActivityGroup[]>();

    useEffect(() => {
        if (filters === undefined) {
            return;
        }

        setLoadingStatus(LoadingStatus.Loading);

        fetch(getUrlWithFilters('/api/activities/', filters))
            .then((response) => {
                if (!response.ok) {
                    throw new Error();
                }
                return response.json() as Promise<ActivityResponse>;
            })
            .then((data) => {
                setActivities(data.activities);
                setLoadingStatus(LoadingStatus.None);
            })
            .catch(() => {
                setActivities([]);
                setLoadingStatus(LoadingStatus.Error);
            });
    }, [filters]);

    // Average pace will show min/500m if showing only rowing activities, and min/km
    // otherwise (including if filter is set to “all”, no matter what kinds of
    // activities are actually visible).
    const activityType =
        filters === undefined ? '' : ((filters.get('type') ?? 'All') as string);

    const showLactate =
        (activities &&
            activities.filter(
                (group) =>
                    group.items?.filter((activity) => activity.lactate).length >
                        0 || false
            ).length > 0) === true;

    const showFeeling =
        (activities &&
            activities.filter(
                (group) =>
                    group.items?.filter((activity) => activity.feeling).length >
                        0 || false
            ).length > 0) === true;

    const numberOfColumns = 6 + (showFeeling ? 1 : 0) + (showLactate ? 1 : 0);

    return (
        <div>
            <ActivityFilter onChange={setFilters} />
            <Loader status={loadingStatus} />
            {loadingStatus === LoadingStatus.None && activities && (
                <div>
                    <TableContainer>
                        <Table>
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
                                                    activityType={activityType}
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
                                        <EmptyThead>
                                            <tr>
                                                <th
                                                    colSpan={numberOfColumns}
                                                    id={group.name}
                                                >
                                                    {group.name}
                                                </th>
                                            </tr>
                                        </EmptyThead>
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
                        </Table>
                    </TableContainer>
                </div>
            )}
        </div>
    );
};

export default ActivitiesPage;
