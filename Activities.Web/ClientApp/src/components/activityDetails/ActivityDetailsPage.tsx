import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import pageStyles from './ActivityDetailsPage.module.css';
import { Link } from 'react-router-dom';
import styles from '../../styles/styles.module.css';
import Loader, { LoadingStatus } from '../utils/Loader';
import {
    getDateString,
    getFeelingTitle,
    getKmString,
    getPaceString,
    getTimeString,
} from '../utils/Formatters';
import LapsChart, { Lap } from './LapsChart';

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
    perceivedExertion?: number;
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

const ActivityDetailsPage = () => {
    const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.None);
    const [activity, setActivity] = useState<DetailedActivity>();
    const [averageIntervalPace, setAverageIntervalPace] = useState<number>();
    const [last60DaysIntervalPace, setLast60DaysIntervalPace] =
        useState<number>();
    const [generation, setGeneration] = useState<number>(0);
    const { id } = useParams<{ id: string | undefined }>();
    const [prevId, setPrevId] = useState(id);
    const hasIntervals =
        activity?.laps != null &&
        activity.laps.filter((lap) => lap.isInterval).length > 0;
    const bislettIntervals =
        activity?.laps === null || !activity?.isBislettInterval
            ? []
            : activity.laps
                  .filter((lap) => lap.isInterval)
                  .map((lap) => lap.originalDistance ?? lap.distance);

    if (id !== prevId) {
        setPrevId(id);
        setLoadingStatus(LoadingStatus.Loading); // The load will happen in useEffect() below.
    }

    useEffect(() => {
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
    }, [id, generation]);

    const reimport = () => {
        fetch(`/api/activities/${id}/reimport`, { method: 'POST' })
            .then(() => {
                setLoadingStatus(LoadingStatus.Loading);
                setActivity(undefined);
                setGeneration(generation + 1);
            })
            .catch(() => {
                setLoadingStatus(LoadingStatus.Error);
                setActivity(undefined);
            });
    };

    const toggleIgnoreIntervals = () => {
        fetch(`/api/activities/${id}/toggleIgnoreIntervals`, { method: 'POST' })
            .then(() => {
                setLoadingStatus(LoadingStatus.Loading);
                setActivity(undefined);
                setGeneration(generation + 1);
            })
            .catch(() => {
                setLoadingStatus(LoadingStatus.Error);
                setActivity(undefined);
            });
    };

    return (
        <>
            <Loader status={loadingStatus} />
            {loadingStatus === LoadingStatus.None && activity && (
                <div className={styles.container}>
                    <h2 className={pageStyles.heading}>{activity.name}</h2>
                    <p className={pageStyles.description}>
                        {activity.description}
                    </p>
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
                                    activity.type,
                                )}{' '}
                                (avg),
                                {getPaceString(
                                    activity.maxSpeed,
                                    activity.type,
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
                        <div
                            className={
                                styles.box + ' ' + pageStyles.scrollableBox
                            }
                        >
                            <LapsChart
                                laps={activity.laps}
                                activityType={activity.type}
                                averageIntervalPace={averageIntervalPace}
                                last60DaysIntervalPace={last60DaysIntervalPace}
                            />
                        </div>
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
                            <Link
                                className={pageStyles.actionButtonNav}
                                to={`/activities/${activity.id}/similar`}
                            >
                                View similar intervals
                            </Link>
                            <a
                                className={pageStyles.actionButton}
                                onClick={toggleIgnoreIntervals}
                            >
                                Ignore in interval summaries:{' '}
                                {activity.ignoreIntervals
                                    .toString()
                                    .toUpperCase()}
                            </a>
                        </>
                    )}
                    {bislettIntervals.length > 0 && (
                        <a
                            className={pageStyles.actionButton}
                            href={
                                `https://info.skvidar.run/intro/kalibrer-footpod#` +
                                bislettIntervals.join(',')
                            }
                            rel="noopener noreferrer"
                        >
                            Calibrate footpod
                        </a>
                    )}
                    <a
                        className={pageStyles.actionButton}
                        href={`https://www.strava.com/activities/${activity.id}`}
                        rel="noopener noreferrer"
                    >
                        View on Strava
                    </a>
                    <a className={pageStyles.actionButton} onClick={reimport}>
                        Reimport
                    </a>
                </div>
            )}
        </>
    );
};

export default ActivityDetailsPage;
