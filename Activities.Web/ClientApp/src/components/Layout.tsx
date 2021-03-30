import React, { useState, useEffect } from 'react';
import { NavLink } from "react-router-dom";
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
    padding: 0px 10px;
    display: flex;
    flex: 1 1 auto;
    height: 64px;
    line-height: 64px;
    
    li {
        a {
            transition: background-color .3s;
            font-size: 1rem;
            color: #fff;
            display: block;
            padding: 0 16px;
            text-decoration: none;
        }   
        a:hover, .navLink-active {
            background-color: rgba(0,0,0,0.1);
        }
       
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
                        <li><NavLink exact to="/" activeClassName="navLink-active">Home</NavLink></li>
                        {isAuthenticated &&
                            <React.Fragment>
                                <li><NavLink exact to="/activities" activeClassName="navLink-active">Activities</NavLink></li>
                                <li><NavLink exact to="/intervals" activeClassName="navLink-active">Intervals</NavLink></li>
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