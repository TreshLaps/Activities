import React, { useState, useEffect } from 'react';

interface Activity {
    id: number;
    type: string;
    name: string;
    startDate: string;
    distance: number;
    averageSpeed: number;
};

const ActivitiesPage: React.FC = () => {
    const [activities, setActivities] = useState<Activity[]>();

    useEffect(() => {
        if (activities != null) {
            return;
        }

        fetch(`/api/activities/`)
            .then(response => response.json() as Promise<Activity[]>)
            .then(data => {
                setActivities(data);
            })
            .catch(error => setActivities([]));
    });

    return (
        <table cellSpacing="10">
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
                        <tr>
                            <td>{activity.name}</td>
                            <td>{activity.type}</td>
                            <td>{activity.distance}</td>
                            <td>{activity.averageSpeed}</td>
                            <td>{activity.startDate}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}
    
export default ActivitiesPage;