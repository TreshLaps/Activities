import React, { useState, useEffect } from 'react';
import { NoWrapTd, Table, TableContainer } from '../../styles/styles';
import Loader from '../utils/Loader';

interface Activity {
    id: number;
    type: string;
    name: string;
    startDate: string;
    distance: number;
    averageSpeed: number;
};

const ActivitiesPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>();
    const [activities, setActivities] = useState<Activity[]>();

    useEffect(() => {
        if (activities != null || isLoading) {
            return;
        }

        setIsLoading(true);
        setMessage("Loading activities ...");

        fetch(`/api/activities/`)
            .then(response => response.json() as Promise<Activity[]>)
            .then(data => {
                setActivities(data);
                setIsLoading(false);
                setMessage(undefined);
            })
            .catch(error => {
                setActivities([])
                setIsLoading(false);
                setMessage("Failed to load activities.");
            });
    }, [activities, isLoading]);

    if (isLoading || activities == null) {
        return (<Loader message={message} />);
    }

    return (
        <TableContainer>
            <Table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Distance</th>
                        <th>Speed</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {activities?.map(activity => {
                        return (
                            <tr key={activity.id}>
                                <td><div style={{fontWeight: 500}}><a href={`https://www.strava.com/activities/${activity.id}`} target="_blank" rel="noopener noreferrer">{activity.name}</a></div></td>
                                <NoWrapTd>{activity.type}</NoWrapTd>
                                <NoWrapTd>{activity.distance}</NoWrapTd>
                                <NoWrapTd>{activity.averageSpeed}</NoWrapTd>
                                <NoWrapTd>{activity.startDate}</NoWrapTd>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        </TableContainer>
    );
}
    
export default ActivitiesPage;