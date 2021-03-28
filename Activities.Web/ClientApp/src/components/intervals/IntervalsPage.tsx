import React, { useState, useEffect } from 'react';
import {MarkSeries, HexbinSeries, LineSeries, Hint, VerticalBarSeries} from 'react-vis';
import '../../../node_modules/react-vis/dist/style.css';
import Chart, { axisTypes, getChartData } from '../charts/Chart';
import { StackContainer, Box, SubHeader, Table, Grid, Dropdown } from '../../styles/styles';
import Loader from '../utils/Loader';

interface Activity {
    id: number;
    date: string;
    name: string;
    description: string;
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
    const [lactate, setLactate] = useState<any[]>();
    const [lactateAll, setLactateAll] = useState<any[]>();
    const [hint, setHint] = useState<any | null>();
    const [totalDistances, setTotalDistances] = useState<any[]>();
    const [intervalDistances, setIntervalDistances] = useState<any[]>();
    const showLoader = isLoading || activities == null;

    // Filters
    const [typeFilter, setTypeFilter] = useState('Run');
    const [durationFilter, setDurationFilter] = useState('Last12Months');
    const [yearFilter, setYearFilter] = useState(new Date().getFullYear());

    const appendArgument = function(url: string, key: string, value: any) {

        return `${url}${url.indexOf('?') !== -1 ? '&' : '?'}${key}=${value}`;
    };

    const appendUrlArguments = function(url: string) {
        if (typeFilter !== 'All') {
            url = appendArgument(url, 'type', typeFilter);
        }

        url = appendArgument(url, 'duration', durationFilter);

        if (durationFilter === 'Year') {
            url = appendArgument(url, 'year', yearFilter);
        }

        return url;
    };

    useEffect(() => {
        if (activities != null || isLoading) {
            return;
        }

        setIsLoading(true);
        setMessage("Loading activities ...");
        fetch(appendUrlArguments('/api/ActivitiesIntervals/'))
            .then(response => response.json() as Promise<any>)
            .then(data => {
                setActivities(data.intervals);
                setLactate(getChartData<any>(data.measurements, 
                    (item) => new Date(item.date).getTime(), 
                    (item) => item.laktat,
                    (item) => `${(new Date(item.date)).toUTCString().substr(8,8)}: ${item.laktat}`
                ));
                setLactateAll(getChartData<any>(data.allMeasurements, 
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

    return (
        <div>
            <StackContainer>
                <Dropdown disabled={isLoading} value={typeFilter} onChange={(v) => { setTypeFilter(v.currentTarget.value); setActivities(undefined); }}>
                    <option value="All">All activities</option>
                    <option value="Run">Run</option>
                    <option value="Ride">Ride</option>
                    <option value="NordicSki">NordicSki</option>
                </Dropdown>
                <Dropdown disabled={isLoading} value={durationFilter} onChange={(v) => { setDurationFilter(v.currentTarget.value); setActivities(undefined); }}>
                    <option value="Last12Months">Last 12 months</option>
                    <option value="Year">Year report</option>
                    <option value="Custom">Custom report</option>
                </Dropdown>
                {durationFilter === 'Year' && 
                    <Dropdown disabled={isLoading} value={yearFilter} onChange={(v) => { setYearFilter(parseInt(v.currentTarget.value, 10)); setActivities(undefined); }}>
                        {new Array(10).fill(0).map((item, index) => {
                            const year = new Date().getFullYear() - index;
                            return (<option key={year} value={year}>{year}</option>);
                        })}
                    </Dropdown>
                }
            </StackContainer>
            {showLoader && <Loader message={message} />}
            {!showLoader && 
                <div>
                    <Grid columns={2}>
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
                        <Box>
                            <SubHeader>Lactate</SubHeader>
                            {lactate && lactate.length > 0 && 
                                <Chart xAxisType={axisTypes.Date} yDomain={[0,5]}>                        
                                    <HexbinSeries 
                                        sizeHexagonsWithCount
                                        data={lactateAll}
                                        style={{opacity: 0.5, fill: '#ccc'}}
                                        stroke="gray"
                                    />
                                    <LineSeries 
                                        data={lactate}
                                        stroke="#2d76d8"
                                    />
                                    <MarkSeries 
                                        data={lactate}
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
                    </Grid>
                    <Box>
                        <Table>
                            <thead>
                                <tr>
                                    <th>&nbsp;</th>
                                    <th>Date</th>
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
                                            <td><div style={{fontWeight: 500}}><a href={`https://www.strava.com/activities/${activity.id}`} target="_blank">{activity.name}</a></div><div style={{fontSize: "13px"}}>{activity.description}</div></td>
                                            <td>{activity.date}</td>
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
            }            
        </div>        
    );
}
    
export default IntervalsPage;