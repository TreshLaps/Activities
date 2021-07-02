import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Container } from '../../styles/styles';
import Loader, { LoadingStatus } from '../utils/Loader';
import {
  getDateString, getFeelingTitle, getKmString, getPaceString, getTimeString,
} from '../utils/Formatters';
import LapsChart, { Lap } from './LapsChart';

const ActionButton = styled.a`
  padding: 10px;
  background-color: #005dff;
  margin-right: 10px;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  color: white;
`;

const ActionButtonNav = styled(Link)`
  padding: 10px;
  background-color: #005dff;
  margin-right: 10px;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  color: white;
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
  gear: { id: string; primary: boolean; name: string; resourceState: number; distance: number };
  gearId: string;
  hasHeartrate: boolean;
  id: number;
  lactate?: number;
  laps: Lap[];
  manual: boolean;
  map: { id: string; polyline: string; resourceState: number; summaryPolyline: string };
  maxHeartrate: number;
  maxSpeed: number;
  maxWatts: number;
  movingTime: number;
  name: string;
  perceivedExertion?: any;
  photoCount: number;
  photos: { primary: any; count: number };
  prCount: number;
  preferPerceivedExertion: boolean;
  private: boolean;
  resourceState: number;
  segmentEfforts: any[];
  similarActivities: any;
  splitsMetric: Split[];
  splitsStandard: Split[];
  startDate: string;
  startDateLocal: string;
  startLatlng: number[];
  sufferScore: number;
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

  const { id } = useParams<{ id: string | undefined }>();

  useEffect(() => {
    if (activity !== undefined) {
      return;
    }

    setLoadingStatus(LoadingStatus.Loading);

    fetch(`/api/activities/${id}`)
      .then((response) => response.json() as Promise<DetailedActivity>)
      .then((data) => {
        setActivity(data);
        setLoadingStatus(LoadingStatus.None);
      })
      .catch(() => {
        setActivity(undefined);
        setLoadingStatus(LoadingStatus.Error);
      });
  }, [activity]);

  const reimport = () => {
    fetch(`/api/activities/${id}/reimport`, { method: 'POST' })
      .then((response) => response.json() as Promise<DetailedActivity>)
      .then((data) => {
        setActivity(data);
        setLoadingStatus(LoadingStatus.None);
      })
      .catch(() => {
        setActivity(undefined);
        setLoadingStatus(LoadingStatus.Error);
      });
  };

  console.log(activity);

  return (
    <>
      <Loader status={loadingStatus} />
      {loadingStatus === LoadingStatus.None && activity && (
        <Container>
          <h2>{activity.name}</h2>
          <ul>
            <li>
              <strong>Type:</strong> {activity.type} {activity.workoutType && `(${WorkoutType[activity.workoutType]})`}
            </li>
            <li>
              <strong>Date:</strong> {getDateString(activity.startDate)}
            </li>
            {activity.distance > 0 && (
              <li>
                <strong>Distance:</strong> {getKmString(activity.distance)}
              </li>
            )}
            <li>
              <strong>Time:</strong> {getTimeString(activity.elapsedTime)} (elapsed),{' '}
              {getTimeString(activity.movingTime)} (moving)
            </li>
            {activity.averageSpeed > 0 && (
              <li>
                <strong>Pace:</strong> {getPaceString(activity.averageSpeed)} (avg), {getPaceString(activity.maxSpeed)}{' '}
                (max)
              </li>
            )}
            {activity.hasHeartrate && (
              <li>
                <strong>Heartrate:</strong> {activity.averageHeartrate} (avg), {activity.maxHeartrate} (max)
              </li>
            )}
            {activity.feeling && (
              <li>
                <strong>Feeling:</strong> {getFeelingTitle(activity.feeling)}
              </li>
            )}
          </ul>
          <p>{activity.description}</p>

          {activity.laps && (
            <>
              <h3>Laps</h3>
              <LapsChart laps={activity.laps} />
            </>
          )}

          <h3>Random info</h3>
          <ul>
            <li>
              <strong>Achievement count:</strong> {activity.achievementCount}
            </li>
            <li>
              <strong>Sweated with:</strong> {activity.athleteCount - 1} others
            </li>
            <li>
              <strong>Average cadence:</strong> {activity.averageCadence * 2}
            </li>
            <li>
              <strong>Calories:</strong> {activity.calories}
            </li>
            <li>
              <strong>Commute:</strong> {activity.commute.toString()}
            </li>
            <li>
              <strong>Elevation:</strong> {activity.elevLow} (low), {activity.elevHigh} (high),{' '}
              {activity.totalElevationGain} (gained)
            </li>
            {activity.gear && (
            <li>
              <strong>Gear:</strong> {activity.gear.name} ({getKmString(activity.gear.distance)})
            </li>
            )}
            <li>
              <strong>Manual activity:</strong> {activity.manual.toString()}
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
                <strong>Perceived exertion:</strong> {activity.perceivedExertion}
              </li>
            )}
            <li>
              <strong>Prs:</strong> {activity.prCount}
            </li>
            <li>
              <strong>Private:</strong> {activity.private.toString()}
            </li>
            <li>
              <strong>Suffer score:</strong> {activity.sufferScore}
            </li>
          </ul>

          <h3>Actions</h3>
          {activity.laps?.filter((lap) => lap.isInterval).length > 0
          && <ActionButtonNav to={`/activities/${activity.id}/similar`}>Similar intervals</ActionButtonNav>}
          <ActionButton onClick={reimport}>Reimport</ActionButton>
          <ActionButton
            href={`https://www.strava.com/activities/${activity.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Strava
          </ActionButton>
        </Container>
      )}
    </>
  );
};

export default ActivityDetailsPage;
