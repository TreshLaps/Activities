import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { round } from './utils/Formatters';
import { UserContext, User } from './utils/UserContext';
import LandingPage from './landing/LandingPage';

const LayoutContainer = styled.div`
    margin: 0 auto;
    max-width: 1400px;
    padding-top: 20px;

    @media (max-width: 1440px) {
        padding: 20px 20px 0 20px;
    }

    @media (max-width: 768px) {
        padding: 10px 10px 0 10px;
    }
`;

const MenuWrapper = styled.div`
    background: #c90000;
    overflow: auto;
    white-space: nowrap;
`;

const MenuContainer = styled.div`
    margin: 0 auto;
    max-width: 1400px;
`;

const LinkContainer = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex: 1 1 auto;
    height: 64px;
    line-height: 64px;

    @media (max-width: 768px) {
        height: 50px;
        line-height: 50px;
    }

    li {
        a {
            transition: background-color 0.3s;
            font-size: inherit;
            color: #fff;
            display: block;
            padding: 0 20px;
            text-decoration: none;

            @media (max-width: 768px) {
                padding: 0 10px;
            }
        }
        a:hover,
        .navLink-active {
            background-color: rgba(0, 0, 0, 0.1);
        }
    }
`;

const CenterContainer = styled.div`
    height: 80vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const SyncPercentage = styled.span`
    font-weight: bold;
`;

const ProfileImage = styled.img`
    height: 48px;
    vertical-align: middle;
    border-radius: 99px;

    @media (max-width: 768px) {
        display: none;
    }
`;

const checkProgress = (
    setSyncProgress: (value: number) => void,
    setUser: (value: User | null | undefined) => void
) => {
    fetch('/api/Sync/')
        .then((response) => {
            if (response.status === 401) {
                setUser(null);
                return null;
            }

            return response.json() as Promise<{ progress: number }>;
        })
        .then((data) => {
            if (data) {
                setSyncProgress(data.progress);

                if (data.progress < 1) {
                    setTimeout(
                        () => checkProgress(setSyncProgress, setUser),
                        10000
                    );
                }
            }
        })
        .catch(() =>
            setTimeout(() => checkProgress(setSyncProgress, setUser), 10000)
        );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null | undefined>(undefined);
    const [syncProgress, setSyncProgress] = useState(0);

    useEffect(() => {
        if (user) {
            return;
        }

        fetch('/api/Authentication/user/')
            .then((response) => response.json() as Promise<User>)
            .then((data) => {
                setUser(data);
                checkProgress(setSyncProgress, setUser);
            })
            .catch(() => setUser(null));
    });

    return (
        <UserContext.Provider value={user}>
            <MenuWrapper>
                <MenuContainer style={{ display: 'flex' }}>
                    <LinkContainer>
                        <li>
                            <NavLink
                                exact
                                to="/"
                                activeClassName="navLink-active"
                            >
                                Home
                            </NavLink>
                        </li>
                        {user && (
                            <>
                                <li>
                                    <NavLink
                                        exact
                                        to="/activities"
                                        activeClassName="navLink-active"
                                    >
                                        Activities
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        exact
                                        to="/progress"
                                        activeClassName="navLink-active"
                                    >
                                        Progress
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        exact
                                        to="/intervals"
                                        activeClassName="navLink-active"
                                    >
                                        Intervals (Beta)
                                    </NavLink>
                                </li>
                                <li>
                                    <a
                                        href="https://wiki.skvidar.run/"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Wiki/FAQ
                                    </a>
                                </li>
                            </>
                        )}
                    </LinkContainer>
                    <LinkContainer style={{ flex: '0' }}>
                        {user && (
                            <>
                                <li>
                                    <ProfileImage
                                        src={user.profileImageUrl}
                                        alt={user.fullName}
                                    />
                                </li>
                                <li>
                                    <a href="signout">Sign out</a>
                                </li>
                            </>
                        )}
                        {!user && (
                            <li>
                                <a href="signin">Sign in</a>
                            </li>
                        )}
                    </LinkContainer>
                </MenuContainer>
            </MenuWrapper>
            {user ? (
                <LayoutContainer>
                    {user && syncProgress >= 1.0 && <div>{children}</div>}
                    {user && syncProgress < 1.0 && (
                        <CenterContainer>
                            <p>Loading your activities</p>
                            {syncProgress > 0.0 && (
                                <div>
                                    <SyncPercentage>
                                        {round(syncProgress * 100, 0)} %
                                    </SyncPercentage>
                                </div>
                            )}
                            {syncProgress === 0.0 && (
                                <div>
                                    Progress:{' '}
                                    <SyncPercentage>
                                        {round(syncProgress * 100, 0)} %
                                    </SyncPercentage>{' '}
                                    (Waiting for available slot)
                                </div>
                            )}
                        </CenterContainer>
                    )}
                </LayoutContainer>
            ) : (
                <LandingPage />
            )}
        </UserContext.Provider>
    );
};

export default Layout;
