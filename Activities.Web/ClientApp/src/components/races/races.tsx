import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { NoWrapTd, Table, TableContainer } from '../../styles/styles';
import {
  getDateString, getKmString, getPaceString, getTimeString,
} from '../utils/Formatters';
import Loader, { LoadingStatus } from '../utils/Loader';

interface Activity {
  id: number;
  name: string;
  movingTime: number;
  startDate: string;
  distance: number;
  averageSpeed: number;
}

const RacesPage: React.FC = () => {
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.None);
  const [activities, setActivities] = useState<Activity[]>();

  useEffect(() => {
    if (activities != null) {
      return;
    }

    setLoadingStatus(LoadingStatus.Loading);

    fetch('/api/races/')
      .then((response) => response.json() as Promise<Activity[]>)
      .then((data) => {
        setActivities(data);
        setLoadingStatus(LoadingStatus.None);
      })
      .catch(() => {
        setActivities([]);
        setLoadingStatus(LoadingStatus.Error);
      });
  }, [activities]);

  return (
    <>
      <Loader status={loadingStatus} />
      {loadingStatus === LoadingStatus.None && activities && (
        <TableContainer>
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
              {activities?.map((activity) => (
                <tr key={activity.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>
                      <NavLink to={`activities/${activity.id}`}>{activity.name}</NavLink>
                    </div>
                  </td>
                  <NoWrapTd>{getKmString(activity.distance)}</NoWrapTd>
                  <NoWrapTd>{getPaceString(activity.averageSpeed)}</NoWrapTd>
                  <NoWrapTd>{getTimeString(activity.movingTime)}</NoWrapTd>
                  <NoWrapTd>{getDateString(activity.startDate)}</NoWrapTd>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};

export default RacesPage;
