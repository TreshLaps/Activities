import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Layout.module.css';
import { round } from './utils/Formatters';
import { UserContext, User } from './utils/UserContext';
import LandingPage from './landing/LandingPage';

const checkProgress = (
    setSyncProgress: (value: number) => void,
    setUser: (value: User | null | undefined) => void,
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
                        10000,
                    );
                }
            }
        })
        .catch(() =>
            setTimeout(() => checkProgress(setSyncProgress, setUser), 10000),
        );
};

interface LayoutProps {
    children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
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
            <div className={styles.menuWrapper}>
                <div
                    className={styles.menuContainer}
                    style={{ display: 'flex' }}
                >
                    <ul className={styles.linkContainer}>
                        <li>
                            <NavLink
                                to="/"
                                className={({ isActive }) =>
                                    isActive ? styles.navLinkActive : ''
                                }
                            >
                                Home
                            </NavLink>
                        </li>
                        {user && (
                            <>
                                <li>
                                    <NavLink
                                        end
                                        to="/activities"
                                        className={({ isActive }) =>
                                            isActive ? styles.navLinkActive : ''
                                        }
                                    >
                                        Activities
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        end
                                        to="/progress"
                                        className={({ isActive }) =>
                                            isActive
                                                ? styles.navLinkActive
                                                : undefined
                                        }
                                    >
                                        Progress
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        end
                                        to="/intervals"
                                        className={({ isActive }) =>
                                            isActive
                                                ? styles.navLinkActive
                                                : undefined
                                        }
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
                    </ul>
                    <ul className={styles.linkContainer} style={{ flex: '0' }}>
                        {user && (
                            <>
                                <li>
                                    <img
                                        className={styles.profileImage}
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
                    </ul>
                </div>
            </div>
            {user ? (
                <div className={styles.layoutContainer}>
                    {user && syncProgress >= 1.0 && <div>{children}</div>}
                    {user && syncProgress < 1.0 && (
                        <div className={styles.centerContainer}>
                            <p>Loading your activities</p>
                            {syncProgress > 0.0 && (
                                <div>
                                    <span className={styles.syncProgress}>
                                        {round(syncProgress * 100, 0)} %
                                    </span>
                                </div>
                            )}
                            {syncProgress === 0.0 && (
                                <div>
                                    Progress:{' '}
                                    <span className={styles.syncProgress}>
                                        {round(syncProgress * 100, 0)} %
                                    </span>{' '}
                                    (Waiting for available slot)
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <LandingPage />
            )}
        </UserContext.Provider>
    );
}

export default Layout;
