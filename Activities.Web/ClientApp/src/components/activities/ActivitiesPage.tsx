import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { TableContainer } from '../../styles/styles';
import { Table, ValueTd } from '../utils/Table';
import Loader, { LoadingStatus } from '../utils/Loader';

interface Activity {
  id: number;
  type: string;
  name: string;
  startDate: string;
  distance: number;
  averageSpeed: number;
}

const ActivitiesPage: React.FC = () => {
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.None);
  const [activities, setActivities] = useState<Activity[]>();

  useEffect(() => {
    if (activities != null) {
      return;
    }

    setLoadingStatus(LoadingStatus.Loading);

    fetch('/api/activities/')
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
                <th>Type</th>
                <th>Distance</th>
                <th>Speed</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {activities?.map((activity) => (
                <tr key={activity.id}>
                  <td>
                    <div style={{ fontWeight: 500, whiteSpace: 'pre-wrap' }}>
                      <NavLink to={`activities/${activity.id}`}>{activity.name}</NavLink>
                    </div>
                  </td>
                  <td>{activity.type}</td>
                  {ValueTd(activity.distance)}
                  {ValueTd(activity.averageSpeed)}
                  <td>{activity.startDate}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};

export default ActivitiesPage;
