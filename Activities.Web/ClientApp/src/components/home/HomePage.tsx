import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Grid, SubHeader } from '../../styles/styles';
import { getKmString, getPaceString, getTimeString } from '../utils/Formatters';
import Loader from '../utils/Loader';
import { SmallTable, ValueTd } from '../utils/Table';
import { UserContext } from '../utils/UserContext';

const CenterContainer = styled.div`
    height: 80vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const SignInButton = styled.a`
    text-decoration: none;
    border-radius: 3px;
    border: 0;
    padding: 15px 30px;
    background: #209cee;
    color: #fff;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);

    &:hover {        
        background: #1375b6;
    }
`;

const sumValues = (items: any[]) => {
    if (items.length === 0) {
        return 0.0;
    }

    return items.reduce((sum, value) => sum + value);
}

const progressTable = (name: string, items: any[]) => (
    <SmallTable>
        <thead>
            <tr>
                <th>{name}</th>
                <th>&nbsp;</th>
                <th title="Distance">{getKmString(sumValues(items.filter(item => item.distance).map(item => item.distance.value)))}</th>
                <th title="Time">{getTimeString(sumValues(items.filter(item => item.elapsedTime).map(item => item.elapsedTime.value)))}</th>
                <th title="Pace">{getPaceString(sumValues(items.filter(item => item.pace).map(item => item.pace.value)) / items.length, true)}</th>
                <th title="Average heartrate">{Math.round(sumValues(items.filter(item => item.heartrate).map(item => item.heartrate.value)) / items.length)} bpm</th>
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
                </tr>
            ))}
        </tbody>
    </SmallTable>
);

const TopActivities: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>();
    const [progress, setProgress] = useState<any>();
    const showLoader = isLoading || progress == null;

    useEffect(() => {
        if (progress != null || isLoading) {
            return;
        }

        setIsLoading(true);
        setMessage("Loading progress ...");

        fetch('/api/progress/summary')
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

    return (
        <UserContext.Consumer>
            {(user) => (
                <>
                    {user === null && 
                        <CenterContainer>
                            <p>Welcome. Sign in to proceed.</p>
                            <SignInButton href="/signin">Sign in</SignInButton>
                        </CenterContainer>
                    }
                    {user && 
                        <>
                            {showLoader && <Loader message={message} />}
                            {!showLoader && progress && 
                                <>
                                    <SubHeader>Weekly summary</SubHeader>
                                    <Grid columns={3}>
                                        {progress.map((item: any) => progressTable(item.name, item.summary))}
                                    </Grid>
                                </>
                            }
                        </>
                    }
                </>
            )}
        </UserContext.Consumer>
    );
};

const HomePage: React.FC = () => {
    return (
        <UserContext.Consumer>
            {(user) => (
                <>
                    {user === null && 
                        <CenterContainer>
                            <p>Welcome! Sign in to proceed.</p>
                            <SignInButton href="/signin">Sign in</SignInButton>
                        </CenterContainer>
                    }
                    {user && 
                        <>
                            <TopActivities />
                            <SubHeader>Latest activities</SubHeader>
                            <p>...</p>
                        </>
                    }
                </>
            )}
        </UserContext.Consumer>
    );
};
    
export default HomePage;