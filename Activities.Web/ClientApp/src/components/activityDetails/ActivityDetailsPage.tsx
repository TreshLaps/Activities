import React, { useState, useEffect } from 'react';
import { Container } from '../../styles/styles';
import Loader, { LoadingStatus } from '../utils/Loader';
import { useParams } from 'react-router';
import { getPaceString, getTimeString } from '../utils/Formatters';
import Chart, { getChartData, axisTypes } from '../charts/Chart';
import { Hint, LabelSeries, VerticalBarSeries } from 'react-vis';

interface DetailedActivity {
    id: number;
    description: string;
    type: string;
    name: string;
    startDate: string;
    distance: number;
    averageSpeed: number;
    laps: Lap[];
};

interface Lap {
    averageCadence: number;
    averageHeartrate: number;
    averageSpeed: number;
    distance: number;
    elapsedTime: number;
    endIndex: number;
    id: number;
    isInterval: boolean;
    lactate: number;
    lapIndex: number;
    maxHeartrate: number;
    maxSpeed: number;
    movingTime: number;
    name: string;
    paceZone: number;
    resourceState: number;
    split: number;
    startDate: Date;
    startDateLocal: Date;
    startIndex: number;
    totalElevationGain: number;
}

const ActivityDetailsPage: React.FC = () => {
    const padding = 0.5;
    const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.None);
    const [activity, setActivity] = useState<DetailedActivity>();
    const [intervalLaps, setIntervalLaps] = useState<any[]>();
    const [breakLaps, setBreakLaps] = useState<any[]>();
    const [labels, setLabels] = useState<any[]>();
    const [hint, setHint] = useState<{value: any, owner: string} | null>();
    const [slowSpeed, setSlowSpeed] = useState(0.5);
    const [fastSpeed, setFastSpeed] = useState(5);
    const hasIntervalLaps = intervalLaps && intervalLaps.length > 0;

    const {id} = useParams();

    useEffect(() => {
        if (activity !== undefined) {
            return;
        }

        setLoadingStatus(LoadingStatus.Loading);

        fetch(`/api/activities/${id}`)
            .then(response => response.json() as Promise<DetailedActivity>)
            .then(data => {
                setActivity(data);
                setLoadingStatus(LoadingStatus.None);

                setIntervalLaps(getChartData<Lap>(data.laps.filter(l => l.isInterval), 
                    (item) => item.lapIndex, 
                    (item) => item.averageSpeed,
                    (item) => `${item.name}\n${getPaceString(item.averageSpeed, true)}\n${item.lapIndex}`
                ));

                setBreakLaps(getChartData<Lap>(data.laps.filter(l => !l.isInterval), 
                    (item) => item.lapIndex, 
                    (item) => item.averageSpeed,
                    (item) => `${item.name}\n${getPaceString(item.averageSpeed, true)}\n${item.lapIndex}`
                ));

                setLabels(getChartData<Lap>(data.laps,
                    (item) => item.lapIndex, 
                    (item) => item.averageSpeed,
                    (item) => item.isInterval ? `${getPaceString(item.averageSpeed, true)}` : getTimeString(item.elapsedTime)
                ));

                var sortedBySpeed = data.laps.sort((l1, l2) => l1.averageSpeed - l2.averageSpeed);
                setSlowSpeed(sortedBySpeed[0].averageSpeed - padding);
                setFastSpeed(sortedBySpeed[sortedBySpeed.length - 1].averageSpeed + padding);

            })
            .catch(error => {
                setActivity(undefined)
                setLoadingStatus(LoadingStatus.Error);
            });

    }, [activity]);

    return (
        <>
            <Loader status={loadingStatus} />
            {loadingStatus === LoadingStatus.None && activity && <Container>
                <h3>{activity.name}</h3>
                <p>{activity.description}</p>

                {activity.laps && activity.laps.length > 1 && <Chart stack={true} height={400} xDomain={hasIntervalLaps ? [1.5, activity.laps.length - 0.5] : [1, activity.laps.length]} xAxisType={axisTypes.Integer} yDomain={[slowSpeed, fastSpeed]} yTickFormat={distancePerSecond => getPaceString(distancePerSecond)}>
                    <VerticalBarSeries
                        barWidth={hasIntervalLaps ? 0.5 : 1}                                            
                        data={breakLaps}
                        color="#bdc9ce"
                        stroke={0}
                        onValueMouseOver={(value) => setHint({value, owner: 'pace'})}
                        onValueMouseOut={() => setHint(null)}
                        onValueClick={(value) => { window.location.hash = value.x.toString(); }}
                    />
                    <VerticalBarSeries
                        barWidth={0.5}                                            
                        data={intervalLaps}
                        color="#4c8eff"
                        stroke={0}
                        onValueMouseOver={(value) => setHint({value, owner: 'pace'})}
                        onValueMouseOut={() => setHint(null)}
                        onValueClick={(value) => { window.location.hash = value.x.toString(); }}
                    />
                    <LabelSeries 
                        animation
                        data={labels}
                        labelAnchorX={'middle'}
                        labelAnchorY='top'
                        style={{fontSize: 15}}
                    />
                    {hint?.value.label != null && hint?.owner === 'pace' && 
                        <Hint value={hint.value}>
                            <div style={{background: 'black', padding: "3px 5px", color: "white", borderRadius: "5px", fontSize: "12px", whiteSpace: "pre-line"}}>{hint.value.label}</div>
                        </Hint>
                    }
                </Chart>}
            </Container>}
        </>
    );
}
    
export default ActivityDetailsPage;