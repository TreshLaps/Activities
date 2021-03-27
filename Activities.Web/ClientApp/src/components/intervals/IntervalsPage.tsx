import React, { useState, useEffect } from 'react';
import {MarkSeries, HexbinSeries, LineSeries, Hint, VerticalBarSeries} from 'react-vis';
import '../../../node_modules/react-vis/dist/style.css';
import Chart, { axisTypes, getChartData } from '../charts/Chart';
import { Box, SubHeader, Table, Wrapper } from '../../styles/styles';
import Loader from '../utils/Loader';

interface Activity {
    id: number;
    name: string;
    interval_AverageSpeed: string;
    interval_AverageHeartrate: number;
    interval_Laps: string[];
};

interface Laktat {
    x: number;
    y: number;
    yVariance: number;
}

const IntervalsPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>();
    const [activities, setActivities] = useState<Activity[]>();
    const [laktat, setLaktat] = useState<any[]>();
    const [laktatAll, setLaktatAll] = useState<any[]>();
    const [hint, setHint] = useState<any | null>();
    const [totalDistances, setTotalDistances] = useState<any[]>();
    const [intervalDistances, setIntervalDistances] = useState<any[]>();

    useEffect(() => {
        if (activities != null || isLoading) {
            return;
        }

        setIsLoading(true);
        setMessage("Loading activities ...");
        fetch(`/api/ActivitiesIntervals/`)
            .then(response => response.json() as Promise<any>)
            .then(data => {
                setActivities(data.intervals);
                setLaktat(getChartData<any>(data.measurements, 
                    (item) => new Date(item.date).getTime(), 
                    (item) => item.laktat,
                    (item) => `${(new Date(item.date)).toUTCString().substr(8,8)}: ${item.laktat}`
                ));
                setLaktatAll(getChartData<any>(data.allMeasurements, 
                    (item) => new Date(item.date).getTime(), 
                    (item) => item.laktat
                ));
                setTotalDistances(getChartData<any>(data.distances, 
                    (item) => new Date(item.date).toUTCString().substr(8,8), 
                    (item) => item.totalDistance - item.intervalDistance,
                    (item) => `${(new Date(item.date)).toUTCString().substr(8,8)} - Total: ${item.totalDistance} km`
                ).reverse());
                setIntervalDistances(getChartData<any>(data.distances, 
                    (item) => new Date(item.date).toUTCString().substr(8,8), 
                    (item) => item.intervalDistance,
                    (item) => `${(new Date(item.date)).toUTCString().substr(8,8)} - Intervals: ${item.intervalDistance} km (${Math.round(100 / item.totalDistance * item.intervalDistance)} %)`
                ).reverse());
                setIsLoading(false);
                setMessage(undefined);
            })
            .catch(error => {
                setActivities([])
                setIsLoading(false);
                setMessage("Failed to load activities.");
            });
    });

    if (isLoading || activities == null) {
        return (<Loader message={message} />);
    }

    return (
        <div>
            <Wrapper columns={2}>
                <Box>
                    <SubHeader>Laktat</SubHeader>
                    {laktat && laktat.length > 0 && 
                        <Chart xAxisType={axisTypes.Date} yDomain={[0,5]}>                        
                            <HexbinSeries 
                                sizeHexagonsWithCount
                                data={laktatAll}
                                style={{opacity: 0.5, fill: '#ccc'}}
                                stroke="gray"
                            />
                            <LineSeries 
                                data={laktat}
                                stroke="#2d76d8"
                            />
                            <MarkSeries 
                                data={laktat}
                                fill="#2d76d8"
                                stroke="#2d76d8"
                                onValueMouseOver={(value) => setHint(value)}
                                onValueMouseOut={() => setHint(null)}
                            />
                            {hint?.label != null && 
                                <Hint value={hint}>
                                    <div style={{background: 'black', padding: "3px 5px", color: "white", borderRadius: "5px", fontSize: "12px"}}>{hint.label}</div>
                                </Hint>
                            }
                        </Chart>              
                    }
                </Box>
                <Box>
                    <SubHeader>Distance</SubHeader>
                    {totalDistances && totalDistances.length > 0 && 
                        <Chart xAxisType={axisTypes.Date} stack={true} xType="ordinal">       
                            <VerticalBarSeries 
                                barWidth={0.5}
                                data={intervalDistances}
                                fill="#2d76d8"
                                stroke="#2d76d8"
                                onValueMouseOver={(value) => setHint(value)}
                                onValueMouseOut={() => setHint(null)}
                            />                 
                            <VerticalBarSeries
                                barWidth={0.5}
                                data={totalDistances}
                                fill="#bdc9ce"
                                stroke="#bdc9ce"
                                onValueMouseOver={(value) => setHint(value)}
                                onValueMouseOut={() => setHint(null)}
                            />
                            {hint?.label != null && 
                                <Hint value={hint}>
                                    <div style={{background: 'black', padding: "3px 5px", color: "white", borderRadius: "5px", fontSize: "12px"}}>{hint.label}</div>
                                </Hint>
                            }
                        </Chart>              
                    }
                </Box>                
            </Wrapper>
            <Box>
                <Table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Speed</th>
                            <th>BPM</th>
                            <th>Laps</th>
                        </tr>
                    </thead>
                    <tbody>
                        {message && <tr><td>{message}</td></tr>}
                        {activities?.map(activity => {
                            return (
                                <tr key={activity.id}>
                                    <td>{activity.name}</td>
                                    <td>{activity.interval_AverageSpeed}</td>
                                    <td>{activity.interval_AverageHeartrate}</td>
                                    <td>
                                        <div style={{fontSize: "13px"}}>
                                            {activity.interval_Laps.map(lap => (<div key={lap}>{lap}</div>))}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </Box>
        </div>        
    );
}
    
export default IntervalsPage;