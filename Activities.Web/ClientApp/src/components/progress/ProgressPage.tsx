import React, { useState, useEffect } from 'react';
import '../../../node_modules/react-vis/dist/style.css';
import { TableContainer } from '../../styles/styles';
import Loader, { LoadingStatus } from '../utils/Loader';
import { FixedWidthTable } from '../utils/Table';
import ActivityFilter, { getUrlWithFilters, Filters } from '../utils/ActivityFilter';
import ValueTd, { ItemValue } from '../utils/ValueTd';

interface ProgressResultItem {
  name: string;
  activityCount: ItemValue;
  distance: ItemValue;
  elapsedTime: ItemValue;
  pace: ItemValue;
  heartrate: ItemValue;
  lactate: ItemValue;
}

const ProgressPage: React.FC = () => {
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.None);
  const [filters, setFilters] = useState<Filters>();
  const [progress, setProgress] = useState<ProgressResultItem[]>();

  useEffect(() => {
    if (filters === undefined) {
      return;
    }

    setLoadingStatus(LoadingStatus.Loading);

    fetch(getUrlWithFilters('/api/progress/', filters))
      .then((response) => {
        if (!response.ok) {
          throw new Error();
        }
        return response.json() as Promise<ProgressResultItem[]>;
      })
      .then((data) => {
        setProgress(data);
        setLoadingStatus(LoadingStatus.None);
      })
      .catch(() => {
        setProgress([]);
        setLoadingStatus(LoadingStatus.Error);
      });
  }, [filters]);

  const showLactate = progress
    && (progress.filter((item) => item.lactate).length > 0 || false) === true;

  return (
    <div>
      <ActivityFilter onChange={setFilters} />
      <Loader status={loadingStatus} />
      {loadingStatus === LoadingStatus.None && progress && (
        <TableContainer>
          <FixedWidthTable>
            <thead>
              <tr>
                <th>&nbsp;</th>
                <th>Activities</th>
                <th>Distance</th>
                <th>Time</th>
                <th>Pace</th>
                <th>HR</th>
                {showLactate && <th>Lactate</th>}
              </tr>
            </thead>
            <tbody>
              {progress.map((item) => (
                <tr key={item.name}>
                  <td>{item.name}</td>
                  <td>{item.activityCount}</td>
                  <ValueTd item={item.distance} />
                  <ValueTd item={item.elapsedTime} />
                  <ValueTd item={item.pace} />
                  <ValueTd item={item.heartrate} />
                  {showLactate && <ValueTd item={item.lactate} />}
                </tr>
              ))}
            </tbody>
          </FixedWidthTable>
        </TableContainer>
      )}
    </div>
  );
};

export default ProgressPage;
