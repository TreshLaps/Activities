import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { Grid, SubHeader, TableContainer } from '../../styles/styles';
import Loader, { LoadingStatus } from '../utils/Loader';
import { SmallTable, Table } from '../utils/Table';
import ValueTd from '../utils/ValueTd';
import ValueTh from '../utils/ValueTh';
import { getActivityEmoji } from '../../styles/TypeEmoji';
import ActivityTr from '../utils/ActivityTr';

// const NavButton = styled(NavLink)`
//   padding: 7px 12px;
//   background-color: #005dff;
//   margin-right: 10px;
//   text-decoration: none;
//   font-weight: 500;
//   cursor: pointer;
//   color: white;
//   display: inline-block;
// `;

const PageLink = styled(NavLink)`
  display: inline-block;
  margin-bottom: 20px;
`;

const progressTable = (name: string, items: any[]) => (
  <SmallTable key={name}>
    <thead>
      <tr>
        <th>{getActivityEmoji(name)}</th>
        <ValueTh items={items} valueFunc={(item) => item.activityCount} />
        <ValueTh items={items} valueFunc={(item) => item.distance} />
        <ValueTh items={items} valueFunc={(item) => item.elapsedTime} />
        <ValueTh items={items} valueFunc={(item) => item.pace} />
        <ValueTh items={items} valueFunc={(item) => item.heartrate} />
      </tr>
    </thead>
    <tbody>
      {items.map((item) => (
        <tr key={item.name}>
          <td>{item.name}</td>
          <td>{item.activityCount?.value}</td>
          <ValueTd item={item.distance} />
          <ValueTd item={item.elapsedTime} />
          <ValueTd item={item.pace} />
          <ValueTd item={item.heartrate} />
        </tr>
      ))}
    </tbody>
  </SmallTable>
);

const ProgressSummary: React.FC = () => {
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.None);
  const [progress, setProgress] = useState<any>();

  useEffect(() => {
    if (progress != null) {
      return;
    }

    setLoadingStatus(LoadingStatus.Loading);

    fetch('/api/progress/summary')
      .then((response) => response.json() as Promise<any>)
      .then((data) => {
        setProgress(data);
        setLoadingStatus(LoadingStatus.None);
      })
      .catch(() => {
        setProgress({});
        setLoadingStatus(LoadingStatus.Error);
      });
  }, [progress]);

  return (
    <>
      <Loader status={loadingStatus} />
      {loadingStatus === LoadingStatus.None && progress && (
      <>
        <SubHeader>Progress overview</SubHeader>
        <Grid columns={3}>{progress.map((item: any) => progressTable(item.name, item.summary))}</Grid>
        <PageLink to="/progress">View all progress</PageLink>
      </>
      )}
    </>
  );
};

const ActivitiesSummary: React.FC = () => {
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.None);
  const [activities, setActivities] = useState<any>();

  useEffect(() => {
    if (activities != null) {
      return;
    }

    setLoadingStatus(LoadingStatus.Loading);

    fetch('/api/activities/summary')
      .then((response) => response.json() as Promise<any>)
      .then((data) => {
        setActivities(data);
        setLoadingStatus(LoadingStatus.None);
      })
      .catch(() => {
        setActivities({});
        setLoadingStatus(LoadingStatus.Error);
      });
  }, [activities]);

  const showLactate = (activities
    && activities.filter((activity: any) => activity.lactate).length > 0) === true;

  return (
    <>
      <Loader status={loadingStatus} />
      {loadingStatus === LoadingStatus.None && activities && (
      <>
        <SubHeader>Latest activities</SubHeader>
        <div>
          <TableContainer>
            <Table style={{ marginBottom: '10px' }}>
              <thead>
                <tr>
                  <th colSpan={2}>&nbsp;</th>
                  <ValueTh items={activities} valueFunc={(item) => item.distance} title="Distance" />
                  <ValueTh items={activities} valueFunc={(item) => item.elapsedTime} title="Time" />
                  <ValueTh items={activities} valueFunc={(item) => item.pace} title="Pace" />
                  <ValueTh items={activities} valueFunc={(item) => item.heartrate} title="Heartrate" />
                  {showLactate && <ValueTh items={activities} valueFunc={(item) => item.lactate} title="Lactate" />}
                </tr>
              </thead>
              <tbody>
                {activities.map((activity: any) => (
                  <ActivityTr key={activity.id} activity={activity} showLactate={showLactate} />
                ))}
              </tbody>
            </Table>
          </TableContainer>
        </div>
        <PageLink to="/activities">View all activities</PageLink>
      </>
      )}
    </>
  );
};

const HomePage: React.FC = () => (
  <div style={{ paddingTop: '10px' }}>
    <ActivitiesSummary />
    <ProgressSummary />
  </div>
);

export default HomePage;
