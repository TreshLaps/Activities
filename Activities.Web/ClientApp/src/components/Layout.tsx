import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import styled from 'styled-components';

const LayoutContainer = styled.div`
    margin: 0 auto;
    max-width: 1400px;

    @media(max-width: 1440px) {
        padding: 0 20px;
    }

    @media(max-width: 768px) {
        padding: 0 10px;
    }
`;

const MenuWrapper = styled.div`
    background: #209cee;
    margin-bottom: 20px;
`;

const MenuContainer = styled.div`
    margin: 0 auto;
    max-width: 1400px;
`;

const LinkContainer = styled.ul`
    list-style: none;
    margin: 0;
    padding: 20px;
    display: flex;
    flex: 1 1 auto;

    li {
        padding: 0;
        padding-right: 20px;
        color: #fff;
    }
`;

const Layout: React.FC<{ children: any }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        if (isAuthenticated === true) {
            return;
        }

        fetch(`/api/IsAuthenticated/`)
            .then(response => response.json() as Promise<boolean>)
            .then(data => {
                setIsAuthenticated(data);
            })
            .catch(error => setIsAuthenticated(false));
    });

    return (
        <>
            <MenuWrapper>
                <MenuContainer>
                    <LinkContainer>
                        <li><Link to="/">Home</Link></li>
                        {isAuthenticated &&
                            <React.Fragment>
                                <li><Link to="/activities">Activities</Link></li>
                                <li><Link to="/intervals">Intervals</Link></li>
                            </React.Fragment>
                        }
                        <li><a href={isAuthenticated ? '/signout' : '/signin'}>{isAuthenticated ? 'Sign out' : 'Sign in'}</a></li>
                    </LinkContainer>
                </MenuContainer>   
            </MenuWrapper>
            <LayoutContainer>
                <div>
                    {children}
                </div>
            </LayoutContainer>
        </>
    );
}
    
export default Layout;