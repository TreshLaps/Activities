import React, { useState, useEffect } from 'react';
import '../../../node_modules/react-vis/dist/style.css';
import { useParams } from 'react-router';
import { TableContainer } from '../../styles/styles';
import Loader, { LoadingStatus } from '../utils/Loader';
import { EmptyThead, Table } from '../utils/Table';
import ActivityTr, { Activity } from '../utils/ActivityTr';
import ValueTh from '../utils/ValueTh';

interface ActivityGroup {
  name: string;
  items: Activity[];
}

const SimiliarActivitiesPage: React.FC = () => {
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.None);
  const [activities, setActivities] = useState<ActivityGroup[]>();

  const { id } = useParams<{ id: string | undefined }>();

  useEffect(() => {
    if (activities !== undefined) {
      return;
    }

    setLoadingStatus(LoadingStatus.Loading);

    fetch(`/api/activities/${id}/similar`)
      .then((response) => {
        if (!response.ok) {
          throw new Error();
        }
        return response.json() as Promise<any>;
      })
      .then((data) => {
        setActivities(data.activities);
        setLoadingStatus(LoadingStatus.None);
      })
      .catch(() => {
        setActivities([]);
        setLoadingStatus(LoadingStatus.Error);
      });
  }, [activities]);

  const showLactate = (activities
    && activities.filter((group) => group.items?.filter((activity) => activity.lactate).length > 0 || false).length > 0) === true;

  const showFeeling = (activities
    && activities.filter((group) => group.items?.filter((activity) => activity.feeling != null)).length > 0) === true;

  return (
    <div>
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
                        <ValueTh items={group.items} valueFunc={(item) => item.laps} title="Laps" />
                        <ValueTh items={group.items} valueFunc={(item) => item.distance} title="Distance" />
                        <ValueTh items={group.items} valueFunc={(item) => item.elapsedTime} title="Time" />
                        <ValueTh items={group.items} valueFunc={(item) => item.pace} title="Pace" />
                        <ValueTh items={group.items} valueFunc={(item) => item.heartrate} title="Heartrate" />
                        {showLactate && <ValueTh items={group.items} valueFunc={(item) => item.lactate} title="Lactate" />}
                        {showFeeling && <th title="Feeling">Feeling</th>}
                      </tr>
                    </thead>
                  )}
                  {group.items.length === 0 && (
                    <EmptyThead>
                      <tr>
                        <th colSpan={(showLactate ? 8 : 7)} id={group.name}>{group.name}</th>
                      </tr>
                    </EmptyThead>
                  )}
                  <tbody>
                    {group.items.map((activity) => (
                      <ActivityTr key={activity.id} activity={activity} showLactate={showLactate} showFeeling={showFeeling} />
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

export default SimiliarActivitiesPage;
