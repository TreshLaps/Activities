import React, { useState, useEffect, useRef } from 'react';
import queryString from 'query-string';
import {MarkSeries, HexbinSeries, LineSeries, Hint, VerticalBarSeries} from 'react-vis';
import '../../../node_modules/react-vis/dist/style.css';
import Chart, { axisTypes, getChartData } from '../charts/Chart';
import { StackContainer, Box, SubHeader, Table, LapsTable, Grid, Dropdown, DropdownLabel, Input, LapFactor, LapLabel, Container, WarningLabel } from '../../styles/styles';
import Loader from '../utils/Loader';

interface ActivityMonth {
    date: string;
    activities: Activity[];
};

interface Activity {
    id: number;
    date: string;
    name: string;
    description: string;
    interval_AverageSpeed: string;
    interval_AverageHeartrate: number;
    interval_Laps: any[];
};

const getMinPerKmString = (metersPerSecond: number) => {
    const averageSpeed = 1000 / metersPerSecond / 60;
    const averageSpeedMin = Math.floor(averageSpeed);
    const averageSpeedSeconds = Math.round((averageSpeed - averageSpeedMin) * 60);
    return `${averageSpeedMin}:${(averageSpeedSeconds < 10 ? "0" : "")}${averageSpeedSeconds}`;
} 

const addOrUpdateQueryString = (url: string, name: string, value: string) => {
    var separator = url.indexOf("?") === -1 ? "?" : "&";
    var parameter = name + "=" + value;

    if (url.indexOf(name + "=") === -1) {
        var hashMatchPattern = /^(.+?)#(.+?)$/i;
        var hashMatch = url.match(hashMatchPattern);

        if (hashMatch != null) {
            // url contains a hash like: /url/to/content#some-hash
            return hashMatch[1] + separator + parameter + "#" + hashMatch[2];
        }
        else {
            return url + separator + parameter;
        }
    }
    else {
        url = url.replace(new RegExp(name + '=[\\d,]+'), parameter);
    }

    return url;
};
  
const removeQueryString = (url: string, name: string) => url.replace(new RegExp('[\\?|\\&]+' + name + '=[\\w\\d,]+'), '');

let timeoutKey : NodeJS.Timeout | null = null;

const IntervalsPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>();
    const [activities, setActivities] = useState<ActivityMonth[]>();
    const [lactate, setLactate] = useState<any[]>();
    const [lactateMin, setLactateMin] = useState<any[]>();
    const [lactateMax, setLactateMax] = useState<any[]>();
    const [lactateAll, setLactateAll] = useState<any[]>();
    const [hint, setHint] = useState<{value: any, owner: string} | null>();
    const [totalDistances, setTotalDistances] = useState<any[]>();
    const [intervalDistances, setIntervalDistances] = useState<any[]>();
    const [intervalPaces, setIntervalPaces] = useState<any[]>();
    const showLoader = isLoading || activities == null;

    // Filters    
    const { type, duration, year, minPace, maxPace } = queryString.parse(window.location.search);
    const [typeFilter, setTypeFilter] = useState(typeof type === 'string' ? type : 'Run');
    const [durationFilter, setDurationFilter] = useState(typeof duration === 'string' ? duration : 'LastMonths');
    const [yearFilter, setYearFilter] = useState(typeof year === 'string' ? parseInt(year, 10) : new Date().getFullYear());
    const [minPaceFilter, setMinPaceFilter] = useState<number | undefined>(typeof minPace === 'string' ? parseFloat(minPace) : undefined);
    const [maxPaceFilter, setMaxPaceFilter] = useState<number | undefined>(typeof maxPace === 'string' ? parseFloat(maxPace) : undefined);

    const appendUrlArguments = function(url: string) {
        if (typeFilter !== 'Run') {
            url = addOrUpdateQueryString(url, 'type', typeFilter);
        } else {
            url = removeQueryString(url, 'type');
        }

        if (durationFilter !== 'LastMonths') {
            url = addOrUpdateQueryString(url, 'duration', durationFilter);
        } else {
            url = removeQueryString(url, 'duration');
        }

        if (durationFilter === 'Year') {
            url = addOrUpdateQueryString(url, 'year', yearFilter.toString());
        } else {
            url = removeQueryString(url, 'year');
        }

        if (minPaceFilter != null && minPaceFilter > 0) {
            url = addOrUpdateQueryString(url, 'minPace', minPaceFilter.toString());
        } else {
            url = removeQueryString(url, 'minPace');
        }

        if (maxPaceFilter != null && maxPaceFilter > 0) {
            url = addOrUpdateQueryString(url, 'maxPace', maxPaceFilter.toString());
        } else {
            url = removeQueryString(url, 'maxPace');
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

        const url = appendUrlArguments(window.location.href);
        window.history.replaceState({}, '', url);

        fetch(appendUrlArguments('/api/ActivitiesIntervals/'))
            .then(response => response.json() as Promise<any>)
            .then(data => {
                setActivities(data.intervals);

                setLactate(getChartData<any>(data.measurements, 
                    (item) => new Date(item.date).getTime(), 
                    (item) => item.lactate,
                    (item) => `${(new Date(item.date)).toUTCString().substr(8,8)}: ${item.lactate}`
                ));

                setLactateMin(getChartData<any>(data.measurements, 
                    (item) => new Date(item.date).getTime(), 
                    (item) => item.lactateMin,
                    (item) => `${(new Date(item.date)).toUTCString().substr(8,8)}: ${item.lactateMin}`
                ));

                setLactateMax(getChartData<any>(data.measurements, 
                    (item) => new Date(item.date).getTime(), 
                    (item) => item.lactateMax,
                    (item) => `${(new Date(item.date)).toUTCString().substr(8,8)}: ${item.lactateMax}`
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
                    <option value="LastMonths">Last 20 weeks</option>
                    <option value="LastYear">Last 12 months</option>
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
                <Input type='number' style={{width: "80px"}} step='0.1' placeholder='4.30' defaultValue={minPaceFilter} onChange={(v) => { setMinPaceFilter(v.currentTarget.value.length > 0 ? parseFloat(v.currentTarget.value.replace(',', '.').replace(':', '.')) : undefined); refetchAsync(); }} />
                <Input type='number' style={{width: "80px"}} step='0.1' placeholder='3.30' defaultValue={maxPaceFilter} onChange={(v) => { setMaxPaceFilter(v.currentTarget.value.length > 0 ? parseFloat(v.currentTarget.value.replace(',', '.').replace(':', '.')) : undefined); refetchAsync(); }} />
                {minPaceFilter && maxPaceFilter && minPaceFilter <= maxPaceFilter && <WarningLabel>Min/max pace is in wrong order.</WarningLabel>}
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
                                        fill="#4c8eff"
                                        stroke="#4c8eff"
                                        onValueMouseOver={(value) => setHint({value, owner: 'distance'})}
                                        onValueMouseOut={() => setHint(null)}
                                        onValueClick={(value) => { window.location.hash = value.x.toString(); }}
                                    />                 
                                    <VerticalBarSeries
                                        barWidth={0.5}
                                        data={totalDistances}
                                        fill="#bdc9ce"
                                        stroke="#bdc9ce"
                                        onValueMouseOver={(value) => setHint({value, owner: 'distance'})}
                                        onValueMouseOut={() => setHint(null)}
                                        onValueClick={(value) => { window.location.hash = value.x.toString(); }}
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
                                            fill="#50a150"
                                            stroke="#50a150"
                                            onValueMouseOver={(value) => setHint({value, owner: 'pace'})}
                                            onValueMouseOut={() => setHint(null)}
                                            onValueClick={(value) => { window.location.hash = value.x.toString(); }}
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
                                        stroke="transparent"
                                        sizeBaseValue={50}
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
                        <Table>
                            {activities?.map(month => (
                            <>
                                <thead>
                                    <tr>
                                        <th id={month.date}>{month.date}</th>
                                        <th>Date</th>
                                        <th>Pace</th>
                                        <th>HR</th>
                                        <th>Laps</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {message && <tr><td>{message}</td></tr>}
                                    {month.activities.map(activity => (
                                        <tr key={activity.id}>
                                            <td><div style={{fontWeight: 500}}><a href={`https://www.strava.com/activities/${activity.id}`} target="_blank">{activity.name}</a></div><div style={{fontSize: "13px"}}>{activity.description}</div></td>
                                            <td style={{whiteSpace: "nowrap"}}>{activity.date}</td>
                                            <td style={{whiteSpace: "nowrap"}}>{activity.interval_AverageSpeed}</td>
                                            <td style={{whiteSpace: "nowrap"}}>{activity.interval_AverageHeartrate}</td>
                                            <td style={{minWidth: "300px"}}>
                                                <LapsTable>
                                                    {activity.interval_Laps.map(lap => (
                                                        <tr key={lap.id}>
                                                            <td title="Distance">
                                                                <LapLabel>{lap.distance}</LapLabel>
                                                                <LapFactor style={{width: `${lap.distanceFactor * 100}%`}} color="#005dff" />
                                                            </td>
                                                            <td title="Pace">
                                                                <LapLabel>{lap.averageSpeed}</LapLabel>
                                                                <LapFactor style={{width: `${lap.averageSpeedFactor * 100}%`}} color="#00a000" />
                                                            </td>
                                                            <td title="HR">
                                                                <LapLabel>{lap.heartrate}</LapLabel>
                                                                <LapFactor style={{width: `${lap.heartrateFactor * 100}%`}} color="#ff1700" />
                                                            </td>
                                                            <td title="Time" style={{width: "60px"}}>
                                                                <LapLabel>{lap.lactate && `(${lap.lactate})`} {lap.duration}</LapLabel>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </LapsTable>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </>
                        ))}
                    </Table>
                </div>
            }            
        </div>        
    );
}
    
export default IntervalsPage;