import React, { useState, useEffect } from 'react';
import { Container } from '../../styles/styles';
import Loader, { LoadingStatus } from '../utils/Loader';
import { useParams } from 'react-router';
import { getPaceString, getTimeString } from '../utils/Formatters';
import LapsChart, { Lap } from './LapsChart';

interface DetailedActivity {
    id: number;
    description: string;
    type: string;
    name: string;
    startDate: string;
    distance: number;
    averageSpeed: number;
    laps: Lap[];
};

const ActivityDetailsPage: React.FC = () => {
    const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.None);
    const [activity, setActivity] = useState<DetailedActivity>();

    const {id} = useParams();

    useEffect(() => {
        if (activity !== undefined) {
            return;
        }

        setLoadingStatus(LoadingStatus.Loading);

        fetch(`/api/activities/${id}`)
            .then(response => response.json() as Promise<DetailedActivity>)
            .then(data => {
                setActivity(data);
                setLoadingStatus(LoadingStatus.None);
            })
            .catch(error => {
                setActivity(undefined)
                setLoadingStatus(LoadingStatus.Error);
            });

    }, [activity]);

    return (
        <>
            <Loader status={loadingStatus} />
            {loadingStatus === LoadingStatus.None && activity && <Container>
                <h3>{activity.name}</h3>
                <p>{activity.description}</p>

                <LapsChart laps={activity.laps} />
            </Container>}
        </>
    );
}
    
export default ActivityDetailsPage;