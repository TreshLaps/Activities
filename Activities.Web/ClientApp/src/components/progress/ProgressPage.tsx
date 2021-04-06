import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import '../../../node_modules/react-vis/dist/style.css';
import { StackContainer, Dropdown, TableContainer } from '../../styles/styles';
import Loader from '../utils/Loader';
import { Table, ValueTd } from '../utils/Table';
import { addOrUpdateQueryString, removeQueryString } from '../utils/Urls';

const ProgressPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>();
    const [progress, setProgress] = useState<any>();
    const showLoader = isLoading || progress == null;
    const { type } = queryString.parse(window.location.search);
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
            .catch(_ => {
                setProgress({})
                setIsLoading(false);
                setMessage("Failed to load activities.");
            });
    }, [progress, isLoading]);

    const progressTable = (name: string, items: any[]) => (
        <Table>
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
            {!showLoader && progress && progress.week && 
                <TableContainer>
                    {progressTable('Week', progress.week)}
                    {progressTable('Month', progress.month)}
                </TableContainer>
            }            
        </div>        
    );
}
    
export default ProgressPage;