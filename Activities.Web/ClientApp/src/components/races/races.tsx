import React, { useState, useEffect } from 'react';
import { Table } from '../../styles/styles';
import Loader from '../utils/Loader';

interface Activity {
    id: number;
    name: string;
    startDate: string;
    movingTime: string;
    distance: number;
    averageSpeed: number;
};

const RacesPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>();
    const [activities, setActivities] = useState<Activity[]>();

    useEffect(() => {
        if (activities != null || isLoading) {
            return;
        }

        setIsLoading(true);
        setMessage("Loading races ...");

        fetch(`/api/races/`)
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
        <Table>
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
                {activities?.map(activity => {
                        return (
                            <tr key={activity.id}>
                                <td><div style={{fontWeight: 500}}><a href={`https://www.strava.com/activities/${activity.id}`} target="_blank">{activity.name}</a></div></td>
                                <td>{activity.distance}</td>
                                <td>{activity.averageSpeed}</td>
                                <td>{activity.movingTime}</td>
                                <td>{activity.startDate}</td>
                            </tr>
                        );
                })}
            </tbody>
        </Table> 
    );
}
    
export default RacesPage;