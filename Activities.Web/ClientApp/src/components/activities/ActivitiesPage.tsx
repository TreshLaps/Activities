import React, { useState, useEffect } from 'react';
import '../../../node_modules/react-vis/dist/style.css';
import { TableContainer } from '../../styles/styles';
import Loader, { LoadingStatus } from '../utils/Loader';
import ActivityFilter, { getUrlWithFilters, Filters } from '../utils/ActivityFilter';
import { EmptyThead, Table } from '../utils/Table';
import ActivityTr, { Activity } from '../utils/ActivityTr';

interface ActivityGroup {
  name: string;
  items: Activity[];
}

const ActivitiesPage: React.FC = () => {
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.None);
  const [filters, setFilters] = useState<Filters>();
  const [activities, setActivities] = useState<ActivityGroup[]>();

  useEffect(() => {
    if (filters === undefined) {
      return;
    }

    setLoadingStatus(LoadingStatus.Loading);

    fetch(getUrlWithFilters('/api/activities/', filters))
      .then((response) => response.json() as Promise<any>)
      .then((data) => {
        setActivities(data.activities);
        setLoadingStatus(LoadingStatus.None);
      })
      .catch(() => {
        setActivities([]);
        setLoadingStatus(LoadingStatus.Error);
      });
  }, [filters]);

  const showLactate = (activities
    && activities.filter((group) => group.items?.filter((activity) => activity.lactate).length > 0 || false).length > 0) === true;

  return (
    <div>
      <ActivityFilter onChange={setFilters} />
      <Loader status={loadingStatus} />
      {loadingStatus === LoadingStatus.None && activities && (
        <div>
          <TableContainer>
            <Table>
              {activities?.map((group) => (
                <React.Fragment key={group.name}>
                  {group.items.length > 0 && (
                    <thead>
                      <tr>
                        <th colSpan={2} id={group.name}>{group.name}</th>
                        <th>Distance</th>
                        <th>Time</th>
                        <th>Pace</th>
                        <th>HR</th>
                        {showLactate && <th>Lactate</th>}
                      </tr>
                    </thead>
                  )}
                  {group.items.length === 0 && (
                    <EmptyThead>
                      <tr>
                        <th colSpan={(showLactate ? 7 : 6)} id={group.name}>{group.name}</th>
                      </tr>
                    </EmptyThead>
                  )}
                  <tbody>
                    {group.items.map((activity) => (
                      <ActivityTr key={activity.id} activity={activity} showLactate={showLactate} />
                    ))}
                  </tbody>
                </React.Fragment>
              ))}
            </Table>
          </TableContainer>
        </div>
      )}
    </div>
  );
};

export default ActivitiesPage;
