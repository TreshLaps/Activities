import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import ProgressPage from '../progress/ProgressPage';
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

const HomePage: React.FC = () => (
    <UserContext.Consumer>
        {(user) => (
            <>
                {user === null && 
                    <CenterContainer>
                        <p>Welcome. Sign in to proceed.</p>
                        <SignInButton href="/signin">Sign in</SignInButton>
                    </CenterContainer>
                }
                {user && <ProgressPage/>}
            </>
        )}
    </UserContext.Consumer>
);
    
export default HomePage;