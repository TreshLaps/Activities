import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import styled from "styled-components";
import {MarkSeries, HexbinSeries, LineSeries, Hint, VerticalBarSeries} from 'react-vis';
import '../../../node_modules/react-vis/dist/style.css';
import Chart, { axisTypes, getChartData } from '../charts/Chart';
import { StackContainer, Box, SubHeader, Table, LapsTable, Grid, Dropdown, DropdownLabel, Input, LapFactor, LapLabel, WarningLabel } from '../../styles/styles';
import Loader from '../utils/Loader';
import { getKmString, getMinPerKmString, getTimeString, round } from '../utils/Formatters';

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
        url = url.replace(new RegExp(name + '=[^&]+'), parameter);
    }

    return url;
};
  
const removeQueryString = (url: string, name: string) => url.replace(new RegExp('[\\?|\\&]+' + name + '=[^&]+'), '');

const ProgressTable = styled(Table)`
    > tbody > tr {
        > td {
            padding: 5px 10px;
        }
    }
`;

const ProgressPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>();
    const [progress, setProgress] = useState<any>();
    const showLoader = isLoading || progress == null;

    // Filters    
    const { type, duration } = queryString.parse(window.location.search);
    const [typeFilter, setTypeFilter] = useState(typeof type === 'string' ? type : 'Run');

    const appendUrlArguments = function(url: string) {
        if (typeFilter !== 'Run') {
            url = addOrUpdateQueryString(url, 'type', typeFilter);
        } else {
            url = removeQueryString(url, 'type');
        }

        return url;
    };

    useEffect(() => {
        if (progress != null || isLoading) {
            return;
        }

        setIsLoading(true);
        setMessage("Loading progress ...");

        const url = appendUrlArguments(window.location.href);
        window.history.replaceState({}, '', url);

        fetch(appendUrlArguments('/api/ProgressTest/'))
            .then(response => response.json() as Promise<any>)
            .then(data => {
                setProgress(data);
                setIsLoading(false);
                setMessage(undefined);
            })
            .catch(error => {
                setProgress({})
                setIsLoading(false);
                setMessage("Failed to load activities.");
            });
    }, [progress, isLoading]);

    const progressTable = (name: string, items: any[]) => (
        <ProgressTable style={{tableLayout: "fixed"}}>
            <thead>
                <tr>
                    <th colSpan={6} style={{padding: "10px"}}>&nbsp;</th>
                    <th colSpan={5} style={{padding: "10px", borderBottom: "2px dashed black", textAlign: "center"}}>Intervals</th>
                </tr>
                <tr>
                    <th>{name}</th>
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
                {items.map(item => (
                    <tr key={item.name}>
                        <td style={{whiteSpace: "nowrap"}}>{item.name}</td>
                        <td>{item.activityCount}</td>
                        {item.distance && <td>
                            <div style={{position: "relative"}}>
                                <LapLabel>{getKmString(item.distance.value)}</LapLabel>
                                <LapFactor style={{width: `${item.distance.factor * 100}%`}} color="#005dff" />
                            </div>
                        </td>}
                        {!item.distance && <td>-</td>}
                        {item.elapsedTime && <td>
                            <div style={{position: "relative"}}>
                                <LapLabel>{getTimeString(item.elapsedTime.value)}</LapLabel>
                                <LapFactor style={{width: `${item.elapsedTime.factor * 100}%`}} color="#005dff" />
                            </div>
                        </td>}
                        {!item.elapsedTime && <td>-</td>}
                        {item.pace && <td>
                            <div style={{position: "relative"}}>
                                <LapLabel>{getMinPerKmString(item.pace.value)}</LapLabel>
                                <LapFactor style={{width: `${item.pace.factor * 100}%`}} color="#00a000" />
                            </div>
                        </td>}
                        {!item.pace && <td>-</td>}
                        {item.heartrate && <td>
                            <div style={{position: "relative"}}>
                                <LapLabel>{parseInt(item.heartrate.value, 10)} bpm</LapLabel>
                                <LapFactor style={{width: `${item.heartrate.factor * 100}%`}} color="#ff1700" />
                            </div>
                        </td>}
                        {!item.heartrate && <td>-</td>}

                        {item.intervalDistance && <td>
                            <div style={{position: "relative"}}>
                                <LapLabel>{getKmString(item.intervalDistance.value)}</LapLabel>
                                <LapFactor style={{width: `${item.intervalDistance.factor * 100}%`}} color="#005dff" />
                            </div>
                        </td>}
                        {!item.intervalDistance && <td>-</td>}
                        {item.intervalElapsedTime && <td>
                            <div style={{position: "relative"}}>
                                <LapLabel>{getTimeString(item.intervalElapsedTime.value)}</LapLabel>
                                <LapFactor style={{width: `${item.intervalElapsedTime.factor * 100}%`}} color="#005dff" />
                            </div>
                        </td>}
                        {!item.intervalElapsedTime && <td>-</td>}
                        {item.intervalPace && <td>
                            <div style={{position: "relative"}}>
                                <LapLabel>{getMinPerKmString(item.intervalPace.value)}</LapLabel>
                                <LapFactor style={{width: `${item.intervalPace.factor * 100}%`}} color="#00a000" />
                            </div>
                        </td>}
                        {!item.intervalPace && <td>-</td>}
                        {item.intervalHeartrate && <td>
                            <div style={{position: "relative"}}>
                                <LapLabel>{parseInt(item.intervalHeartrate.value, 10)} bpm</LapLabel>
                                <LapFactor style={{width: `${item.intervalHeartrate.factor * 100}%`}} color="#ff1700" />
                            </div>
                        </td>}
                        {!item.intervalHeartrate && <td>-</td>}
                        {item.lactate && <td>
                            <div style={{position: "relative"}}>
                                <LapLabel>{round(item.lactate.value, 1)}</LapLabel>
                                <LapFactor style={{width: `${item.lactate.factor * 100}%`}} color="#a0a20a" />
                            </div>
                        </td>}
                        {!item.lactate && <td>-</td>}
                    </tr>
                ))}
            </tbody>
        </ProgressTable>
    );

    return (
        <div>
            <StackContainer>
                <Dropdown disabled={isLoading} defaultValue={typeFilter} onChange={(v) => { setTypeFilter(v.currentTarget.value); setProgress(undefined); }}>
                    <option value="All">All activities</option>
                    <option value="Run">Run</option>
                    <option value="Ride">Ride</option>
                    <option value="VirtualRide">VirtualRide</option>
                    <option value="NordicSki">NordicSki</option>
                </Dropdown>         
            </StackContainer>
            {showLoader && <Loader message={message} />}
            {!showLoader && progress && 
                <div>
                    {progressTable('Week', progress.week)}
                    {progressTable('Month', progress.month)}
                </div>
            }            
        </div>        
    );
}
    
export default ProgressPage;