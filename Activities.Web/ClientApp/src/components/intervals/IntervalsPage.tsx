import React, { useState, useEffect } from 'react';
import {MarkSeries, HexbinSeries, LineSeries, Hint, VerticalBarSeries} from 'react-vis';
import '../../../node_modules/react-vis/dist/style.css';
import Chart, { axisTypes, getChartData } from '../charts/Chart';
import { StackContainer, Box, SubHeader, Table, Grid, Dropdown, DropdownLabel, Input } from '../../styles/styles';
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

const getMinPerKmString = (metersPerSecond: number) => {
    const averageSpeed = 1000 / metersPerSecond / 60;
    const averageSpeedMin = Math.floor(averageSpeed);
    const averageSpeedSeconds = Math.round((averageSpeed - averageSpeedMin) * 60);
    return `${averageSpeedMin}:${(averageSpeedSeconds < 10 ? "0" : "")}${averageSpeedSeconds}`;
}

let timeoutKey : NodeJS.Timeout | null = null;

const IntervalsPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>();
    const [activities, setActivities] = useState<Activity[]>();
    const [lactate, setLactate] = useState<any[]>();
    const [lactateAll, setLactateAll] = useState<any[]>();
    const [hint, setHint] = useState<{value: any, owner: string} | null>();
    const [totalDistances, setTotalDistances] = useState<any[]>();
    const [intervalDistances, setIntervalDistances] = useState<any[]>();
    const [intervalPaces, setIntervalPaces] = useState<any[]>();
    const showLoader = isLoading || activities == null;

    // Filters
    const [typeFilter, setTypeFilter] = useState('Run');
    const [durationFilter, setDurationFilter] = useState('Last12Months');
    const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
    const [minPace, setMinPace] = useState<number | undefined>();
    const [maxPace, setMaxPace] = useState<number | undefined>();

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

        if (minPace != null && minPace > 0) {
            url = appendArgument(url, 'minPace', minPace);
        }

        if (maxPace != null && maxPace > 0) {
            url = appendArgument(url, 'maxPace', maxPace);
        }

        return url;
    };

    const refetchAsync = function() {
        if (timeoutKey != null) {
            clearTimeout(timeoutKey)
        }

        timeoutKey = setTimeout(() => {
            setActivities(undefined);
        }, 500);        
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
                    (item) => item.lactate,
                    (item) => `${(new Date(item.date)).toUTCString().substr(8,8)}: ${item.lactate}`
                ));

                setLactateAll(getChartData<any>(data.allMeasurements, 
                    (item) => new Date(item.date).getTime(), 
                    (item) => item.lactate
                ));

                setTotalDistances(getChartData<any>(data.distances, 
                    (item) => item.date,
                    (item) => item.nonIntervalDistance,
                    (item) => `${item.date} - Total: ${Math.round(item.nonIntervalDistance + item.intervalDistance)} km`
                ).reverse());

                setIntervalDistances(getChartData<any>(data.distances, 
                    (item) => item.date, 
                    (item) => item.intervalDistance,
                    (item) => `${item.date} - Intervals: ${item.intervalDistance} km (${Math.round(100 / (item.nonIntervalDistance + item.intervalDistance) * item.intervalDistance)} %)`
                ).reverse());

                setIntervalPaces(getChartData<any>(data.paces, 
                    (item) => item.date, 
                    (item) => item.intervalPace,
                    (item) => item.label
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
                <Dropdown disabled={isLoading} defaultValue={typeFilter} onChange={(v) => { setTypeFilter(v.currentTarget.value); setActivities(undefined); }}>
                    <option value="All">All activities</option>
                    <option value="Run">Run</option>
                    <option value="Ride">Ride</option>
                    <option value="NordicSki">NordicSki</option>
                </Dropdown>
                <Dropdown disabled={isLoading} defaultValue={durationFilter} onChange={(v) => { setDurationFilter(v.currentTarget.value); setActivities(undefined); }}>
                    <option value="Last12Months">Last 12 months</option>
                    <option value="Last24Months">Last 24 months</option>
                    <option value="Year">Year report</option>
                </Dropdown>
                {durationFilter === 'Year' && 
                    <Dropdown disabled={isLoading} defaultValue={yearFilter} onChange={(v) => { setYearFilter(parseInt(v.currentTarget.value, 10)); setActivities(undefined); }}>
                        {new Array(10).fill(0).map((item, index) => {
                            const year = new Date().getFullYear() - index;
                            return (<option key={year} value={year}>{year}</option>);
                        })}
                    </Dropdown>
                }
                <DropdownLabel>Pace (slowest/fastest)</DropdownLabel>
                <Input type='number' style={{width: "80px"}} step='0.1' placeholder='4.30' defaultValue={minPace} onChange={(v) => { setMinPace(v.currentTarget.value.length > 0 ? parseFloat(v.currentTarget.value.replace(',', '.').replace(':', '.')) : undefined); refetchAsync(); }} />
                <Input type='number' style={{width: "80px"}} step='0.1' placeholder='3.30' defaultValue={maxPace} onChange={(v) => { setMaxPace(v.currentTarget.value.length > 0 ? parseFloat(v.currentTarget.value.replace(',', '.').replace(':', '.')) : undefined); refetchAsync(); }} />
            </StackContainer>
            {showLoader && <Loader message={message} />}
            {!showLoader && 
                <div>
                    <Grid columns={Math.ceil(((lactate && lactate.length > 0) ? 3 : 2) / (durationFilter == 'Last24Months' ? 2 : 1))}>
                        <Box>
                            <SubHeader>Distance</SubHeader>
                            {totalDistances && totalDistances.length > 0 && 
                                <Chart stack={true} xType="ordinal">       
                                    <VerticalBarSeries 
                                        barWidth={0.5}
                                        data={intervalDistances}
                                        fill="#2d76d8"
                                        stroke="#2d76d8"
                                        onValueMouseOver={(value) => setHint({value, owner: 'distance'})}
                                        onValueMouseOut={() => setHint(null)}
                                    />                 
                                    <VerticalBarSeries
                                        barWidth={0.5}
                                        data={totalDistances}
                                        fill="#bdc9ce"
                                        stroke="#bdc9ce"
                                        onValueMouseOver={(value) => setHint({value, owner: 'distance'})}
                                        onValueMouseOut={() => setHint(null)}
                                    />
                                    {hint?.value.label != null && hint?.owner === 'distance' && 
                                        <Hint value={hint.value}>
                                            <div style={{background: 'black', padding: "3px 5px", color: "white", borderRadius: "5px", fontSize: "12px"}}>{hint.value.label}</div>
                                        </Hint>
                                    }
                                </Chart>              
                            }
                        </Box>
                            <Box>
                                <SubHeader>Average interval pace</SubHeader>
                                {intervalPaces && intervalPaces.length > 0 && 
                                    <Chart xType="ordinal" yDomain={[3,6]} yTickFormat={distancePerSecond => getMinPerKmString(distancePerSecond)}>       
                                        <VerticalBarSeries
                                            getY={d => { return d.y < 3 ? 3 : d.y; }}
                                            barWidth={0.5}
                                            data={intervalPaces}
                                            fill="#2d76d8"
                                            stroke="#2d76d8"
                                            onValueMouseOver={(value) => setHint({value, owner: 'pace'})}
                                            onValueMouseOut={() => setHint(null)}
                                        />
                                        {hint?.value.label != null && hint?.owner === 'pace' && 
                                            <Hint value={hint.value}>
                                                <div style={{background: 'black', padding: "3px 5px", color: "white", borderRadius: "5px", fontSize: "12px"}}>{hint.value.label}</div>
                                            </Hint>
                                        }
                                    </Chart>          
                                }
                        </Box>    
                        {lactate && lactate.length > 0 && 
                            <Box>
                                <SubHeader>Lactate</SubHeader>
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
                                        onValueMouseOver={(value) => setHint({value, owner: 'lactate'})}
                                        onValueMouseOut={() => setHint(null)}
                                    />
                                    {hint?.value.label != null && hint?.owner === 'lactate' && 
                                        <Hint value={hint.value}>
                                            <div style={{background: 'black', padding: "3px 5px", color: "white", borderRadius: "5px", fontSize: "12px"}}>{hint.value.label}</div>
                                        </Hint>
                                    }
                                </Chart>      
                            </Box>           
                        }          
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