import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Box, Container } from '../../styles/styles';
import Loader, { LoadingStatus } from '../utils/Loader';
import {
    getDateString,
    getFeelingTitle,
    getKmString,
    getPaceString,
    getTimeString,
} from '../utils/Formatters';
import LapsChart, { Lap } from './LapsChart';

const ActionButton = styled.a`
    padding: 13px 15px;
    background-color: #005dff;
    margin-right: 10px;
    text-decoration: none;
    font-weight: 500;
    cursor: pointer;
    color: white;
    display: inline-block;
    margin-bottom: 10px;
    line-height: 1;
`;

const ScrollableBox = styled(Box)`
    @media (max-width: 768px) {
        overflow-x: auto;
        padding: 0;

        > * {
            min-width: 700px;
            padding: 20px;
        }
    }
`;

const ActionButtonNav = styled(Link)`
    padding: 13px 15px;
    background-color: #005dff;
    margin-right: 10px;
    text-decoration: none;
    font-weight: 500;
    cursor: pointer;
    color: white;
    display: inline-block;
    margin-bottom: 10px;
    line-height: 1;
`;

const Heading = styled.h2`
    font-size: 40px;
    font-weight: normal;
    line-height: 1.2;
    margin: 0;
    margin-top: 40px;

    @media (max-width: 768px) {
        margin-top: 20px;
        font-size: 30px;
    }
`;

const Description = styled.p`
    white-space: pre-line;
`;

interface Split {
    averageGradeAdjustedSpeed: number;
    averageHeartrate: number;
    averageSpeed: number;
    distance: number;
    elapsedTime: number;
    elevationDifference: number;
    movingTime: number;
    paceZone: number;
    split: number;
}

enum WorkoutType {
    Default = 0,
    Race = 1,
    Long = 2,
    Workout = 3,
    BikeRace = 11,
}

interface ActivityResponse {
    activity: DetailedActivity;
    averageIntervalPace: number;
    last60DaysIntervalPace: number;
}

interface DetailedActivity {
    achievementCount: number;
    athleteCount: number;
    averageCadence: number;
    averageHeartrate: number;
    averageSpeed: number;
    calories: number;
    commentCount: number;
    commute: boolean;
    description: string;
    deviceName: string;
    distance: number;
    elapsedTime: number;
    elevHigh: number;
    elevLow: number;
    endLatlng: number[];
    feeling?: number;
    flagged: boolean;
    gear: {
        id: string;
        primary: boolean;
        name: string;
        resourceState: number;
        distance: number;
    };
    gearId: string;
    hasHeartrate: boolean;
    id: number;
    isBislettInterval: boolean;
    lactate?: number;
    laps: Lap[];
    manual: boolean;
    map: {
        id: string;
        polyline: string;
        resourceState: number;
        summaryPolyline: string;
    };
    maxHeartrate: number;
    maxSpeed: number;
    maxWatts: number;
    movingTime: number;
    name: string;
    perceivedExertion?: unknown;
    photoCount: number;
    photos: { primary: unknown; count: number };
    prCount: number;
    preferPerceivedExertion: boolean;
    private: boolean;
    resourceState: number;
    segmentEfforts: unknown[];
    similarActivities: unknown;
    splitsMetric: Split[];
    splitsStandard: Split[];
    startDate: string;
    startDateLocal: string;
    startLatlng: number[];
    sufferScore: number;
    ignoreIntervals: boolean;
    timezone: string;
    totalElevationGain: number;
    totalPhotoCount: number;
    trainer: boolean;
    type: string; // eg Run
    uploadId: number;
    uploadIdStr: string;
    utcOffset: number;
    visibility: string;
    workoutType?: WorkoutType;
}

const ActivityDetailsPage: React.FC = () => {
    const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.None);
    const [activity, setActivity] = useState<DetailedActivity>();
    const [averageIntervalPace, setAverageIntervalPace] = useState<number>();
    const [
        last60DaysIntervalPace,
        setLast60DaysIntervalPace,
    ] = useState<number>();
    const { id } = useParams<{ id: string | undefined }>();
    const hasIntervals =
        activity?.laps != null &&
        activity.laps.filter((lap) => lap.isInterval).length > 0;
    const bislettIntervals =
        (activity?.laps === null || !activity?.isBislettInterval) ?
           [] : activity.laps.filter((lap) => lap.isInterval).map((lap) => (lap.originalDistance ?? lap.distance));

    useEffect(() => {
        if (activity !== undefined) {
            return;
        }

        setLoadingStatus(LoadingStatus.Loading);

        fetch(`/api/activities/${id}`)
            .then((response) => response.json() as Promise<ActivityResponse>)
            .then((data) => {
                setActivity(data.activity);
                setAverageIntervalPace(data.averageIntervalPace);
                setLast60DaysIntervalPace(data.last60DaysIntervalPace);
                setLoadingStatus(LoadingStatus.None);
            })
            .catch(() => {
                setActivity(undefined);
                setLoadingStatus(LoadingStatus.Error);
            });
    }, [activity, id]);

    const reimport = () => {
        fetch(`/api/activities/${id}/reimport`, { method: 'POST' })
            .then(() => {
                setActivity(undefined);
                setLoadingStatus(LoadingStatus.None);
            })
            .catch(() => {
                setActivity(undefined);
                setLoadingStatus(LoadingStatus.Error);
            });
    };

    const toggleIgnoreIntervals = () => {
        fetch(`/api/activities/${id}/toggleIgnoreIntervals`, { method: 'POST' })
            .then(() => {
                setActivity(undefined);
                setLoadingStatus(LoadingStatus.None);
            })
            .catch(() => {
                setActivity(undefined);
                setLoadingStatus(LoadingStatus.Error);
            });
    };

    return (
        <>
            <Loader status={loadingStatus} />
            {loadingStatus === LoadingStatus.None && activity && (
                <Container>
                    <Heading>{activity.name}</Heading>
                    <Description>{activity.description}</Description>
                    <ul>
                        <li>
                            <strong>Type:</strong> {activity.type}{' '}
                            {activity.workoutType &&
                                `(${WorkoutType[activity.workoutType]})`}
                        </li>
                        <li>
                            <strong>Date:</strong>{' '}
                            {getDateString(activity.startDate)}
                        </li>
                        {activity.distance > 0 && (
                            <li>
                                <strong>Distance:</strong>{' '}
                                {getKmString(activity.distance)}
                            </li>
                        )}
                        <li>
                            <strong>Time:</strong>{' '}
                            {getTimeString(activity.elapsedTime)} (elapsed),{' '}
                            {getTimeString(activity.movingTime)} (moving)
                        </li>
                        {activity.averageSpeed > 0 && (
                            <li>
                                <strong>Pace:</strong>{' '}
                                {getPaceString(
                                    activity.averageSpeed,
                                    activity.type
                                )}{' '}
                                (avg),
                                {getPaceString(
                                    activity.maxSpeed,
                                    activity.type
                                )}{' '}
                                (max)
                            </li>
                        )}
                        {activity.hasHeartrate && (
                            <li>
                                <strong>Heartrate:</strong>{' '}
                                {activity.averageHeartrate} (avg),{' '}
                                {activity.maxHeartrate} (max)
                            </li>
                        )}
                        {activity.feeling && (
                            <li>
                                <strong>Feeling:</strong>{' '}
                                {getFeelingTitle(activity.feeling)}
                            </li>
                        )}
                    </ul>

                    {activity.laps && activity.laps.length > 1 && (
                        <ScrollableBox>
                            <LapsChart
                                laps={activity.laps}
                                activityType={activity.type}
                                averageIntervalPace={averageIntervalPace}
                                last60DaysIntervalPace={last60DaysIntervalPace}
                            />
                        </ScrollableBox>
                    )}

                    <h3>Random info</h3>
                    <ul>
                        <li>
                            <strong>Achievement count:</strong>{' '}
                            {activity.achievementCount}
                        </li>
                        <li>
                            <strong>Sweated with:</strong>{' '}
                            {activity.athleteCount - 1} others
                        </li>
                        <li>
                            <strong>Average cadence:</strong>{' '}
                            {activity.averageCadence * 2}
                        </li>
                        <li>
                            <strong>Calories:</strong> {activity.calories}
                        </li>
                        <li>
                            <strong>Commute:</strong>{' '}
                            {activity.commute.toString()}
                        </li>
                        <li>
                            <strong>Elevation:</strong> {activity.elevLow}{' '}
                            (low), {activity.elevHigh} (high),{' '}
                            {activity.totalElevationGain} (gained)
                        </li>
                        {activity.gear && (
                            <li>
                                <strong>Gear:</strong> {activity.gear.name} (
                                {getKmString(activity.gear.distance)})
                            </li>
                        )}
                        <li>
                            <strong>Manual activity:</strong>{' '}
                            {activity.manual.toString()}
                        </li>
                        <li>
                            <strong>Device:</strong> {activity.deviceName}
                        </li>
                        {activity.maxWatts > 0 && (
                            <li>
                                <strong>Max watts:</strong> {activity.maxWatts}
                            </li>
                        )}
                        {activity.perceivedExertion && (
                            <li>
                                <strong>Perceived exertion:</strong>{' '}
                                {activity.perceivedExertion}
                            </li>
                        )}
                        <li>
                            <strong>Prs:</strong> {activity.prCount}
                        </li>
                        <li>
                            <strong>Private:</strong>{' '}
                            {activity.private.toString()}
                        </li>
                        <li>
                            <strong>Suffer score:</strong>{' '}
                            {activity.sufferScore}
                        </li>
                    </ul>

                    <h3>Actions</h3>
                    {hasIntervals && (
                        <>
                            <ActionButtonNav
                                to={`/activities/${activity.id}/similar`}
                            >
                                View similar intervals
                            </ActionButtonNav>
                            <ActionButton onClick={toggleIgnoreIntervals}>
                                Ignore in interval summaries:{' '}
                                {activity.ignoreIntervals
                                    .toString()
                                    .toUpperCase()}
                            </ActionButton>
                        </>
                    )}
                    {bislettIntervals.length > 0 && (
                         <ActionButton
                             href={`https://info.skvidar.run/intro/kalibrer-footpod#` + bislettIntervals.join(',')}
                             rel="noopener noreferrer"
                         >
                             Calibrate footpod
                         </ActionButton>
                    )}
                    <ActionButton
                        href={`https://www.strava.com/activities/${activity.id}`}
                        rel="noopener noreferrer"
                    >
                        View on Strava
                    </ActionButton>
                    <ActionButton onClick={reimport}>Reimport</ActionButton>
                </Container>
            )}
        </>
    );
};

export default ActivityDetailsPage;
