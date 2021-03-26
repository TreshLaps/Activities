import React, { useState, useEffect } from 'react';

interface Activity {
    name: string;
    interval_AverageSpeed: string;
    interval_AverageHeartrate: number;
    interval_Laps: string[];
};

const IntervalsPage: React.FC = () => {
    const [activities, setActivities] = useState<Activity[]>();
    const [message, setMessage] = useState<string>();

    useEffect(() => {
        if (activities != null) {
            return;
        }

        setMessage("Loading ...");
        fetch(`/api/ActivitiesIntervals/`)
            .then(response => response.json() as Promise<Activity[]>)
            .then(data => {
                setActivities(data);
                setMessage(undefined);
            })
            .catch(error => {
                setActivities([])
                setMessage("Failed to load activities.");
            });
    });

    return (
        <table cellSpacing="10">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Speed</th>
                    <th>BPM</th>
                    <th>Laps</th>
                </tr>
            </thead>
            <tbody>
                {message && <tr><td>{message}</td></tr>}
                {activities?.map(activity => {
                    return (
                        <tr>
                            <td style={{fontSize: "14px", maxWidth: "300px", whiteSpace: "pre-wrap"}}>{activity.name}</td>
                            <td>{activity.interval_AverageSpeed}</td>
                            <td>{activity.interval_AverageHeartrate}</td>
                            <td>
                                <ul>
                                    {activity.interval_Laps.map(lap => (<li>{lap}</li>))}
                                </ul>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}
    
export default IntervalsPage;