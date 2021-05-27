import React, { useEffect, useState } from 'react';
import { Grid, SubHeader } from '../../styles/styles';
import Loader, { LoadingStatus } from '../utils/Loader';
import { SmallTable } from '../utils/Table';
import ValueTd from '../utils/ValueTd';
import ValueTh from '../utils/ValueTh';

const progressTable = (name: string, items: any[]) => (
  <SmallTable key={name}>
    <thead>
      <tr>
        <th>{name}</th>
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

const TopActivities: React.FC = () => {
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
        <SubHeader>Weekly summary</SubHeader>
        <Grid columns={3}>{progress.map((item: any) => progressTable(item.name, item.summary))}</Grid>
      </>
      )}
    </>
  );
};

const HomePage: React.FC = () => (
  <>
    <TopActivities />
    <SubHeader>Latest activities</SubHeader>
    <p>...</p>
  </>
);

export default HomePage;
