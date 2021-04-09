import React, { useState, useEffect } from 'react';
import '../../../node_modules/react-vis/dist/style.css';
import { TableContainer } from '../../styles/styles';
import Loader, { LoadingStatus } from '../utils/Loader';
import { Table, ValueTd } from '../utils/Table';
import ActivityFilter, { getUrlWithFilters, Filters } from '../utils/ActivityFilter';

const ProgressPage: React.FC = () => {
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.None);
  const [filters, setFilters] = useState<Filters>();
  const [progress, setProgress] = useState<any>();

  useEffect(() => {
    if (filters === undefined) {
      return;
    }

    setLoadingStatus(LoadingStatus.Loading);

    fetch(getUrlWithFilters('/api/progress/', filters))
      .then((response) => response.json() as Promise<any>)
      .then((data) => {
        setProgress(data);
        setLoadingStatus(LoadingStatus.None);
      })
      .catch((_) => {
        setProgress({});
        setLoadingStatus(LoadingStatus.Error);
      });
  }, [filters]);

  return (
    <div>
      <ActivityFilter onChange={setFilters} />
      <Loader status={loadingStatus} />
      {loadingStatus !== LoadingStatus.Loading && progress && (
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th colSpan={6} style={{ padding: '10px' }}>
                  &nbsp;
                </th>
                <th colSpan={5} style={{ padding: '10px', borderBottom: '2px dashed black', textAlign: 'center' }}>
                  Intervals
                </th>
              </tr>
              <tr>
                <th>&nbsp;</th>
                <th>Activities</th>
                <th>Distance</th>
                <th>Time</th>
                <th>Pace</th>
                <th>HR</th>
                <th>Distance</th>
                <th>Time</th>
                <th>Pace</th>
                <th>HR</th>
                <th>Lactate</th>
              </tr>
            </thead>
            <tbody>
              {progress.map((item: any) => (
                <tr key={item.name}>
                  <td>{item.name}</td>
                  <td>{item.activityCount}</td>
                  {ValueTd(item.distance)}
                  {ValueTd(item.elapsedTime)}
                  {ValueTd(item.pace)}
                  {ValueTd(item.heartrate)}
                  {ValueTd(item.intervalDistance)}
                  {ValueTd(item.intervalElapsedTime)}
                  {ValueTd(item.intervalPace)}
                  {ValueTd(item.intervalHeartrate)}
                  {ValueTd(item.lactate)}
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default ProgressPage;
