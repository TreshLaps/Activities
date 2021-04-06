import React, { useState, useEffect } from 'react';
import { TableContainer } from '../../styles/styles';
import { Table, ValueTd } from '../utils/Table';
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
                                <td><div style={{fontWeight: 500, whiteSpace: "pre-wrap"}}><a href={`https://www.strava.com/activities/${activity.id}`} target="_blank" rel="noopener noreferrer">{activity.name}</a></div></td>
                                <td>{activity.type}</td>
                                {ValueTd(activity.distance)}
                                {ValueTd(activity.averageSpeed)}
                                <td>{activity.startDate}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        </TableContainer>
    );
}
    
export default ActivitiesPage;