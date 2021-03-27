import React, { useState, useEffect } from 'react';
import { Table, Box } from '../../styles/styles';
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
    });

    if (isLoading || activities == null) {
        return (<Loader message={message} />);
    }

    return (
        <Box>
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
                                <td>{activity.name}</td>
                                <td>{activity.type}</td>
                                <td>{activity.distance}</td>
                                <td>{activity.averageSpeed}</td>
                                <td>{activity.startDate}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        </Box>        
    );
}
    
export default ActivitiesPage;