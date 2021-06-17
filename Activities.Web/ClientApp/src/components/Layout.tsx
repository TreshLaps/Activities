import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { round } from './utils/Formatters';
import { UserContext, User } from './utils/UserContext';

const LayoutContainer = styled.div`
  margin: 0 auto;
  max-width: 1400px;

  @media (max-width: 1440px) {
    padding: 0 20px;
  }

  @media (max-width: 768px) {
    padding: 0 10px;
  }
`;

const MenuWrapper = styled.div`
  background: #c90000;
  margin-bottom: 20px;
  overflow: auto;
  white-space: nowrap;

  @media (max-width: 768px) {
    margin-bottom: 10px;
  }
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

const SignInButton = styled.a`
  text-decoration: none;
  border-radius: 3px;
  border: 0;
  padding: 15px 30px;
  background: #c90000;
  color: #fff;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    background: #1375b6;
  }
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

const checkProgress = (setSyncProgress: (value: number) => void, setUser: (value: User | null | undefined) => void) => {
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
          setTimeout(() => checkProgress(setSyncProgress, setUser), 10000);
        }
      }
    })
    .catch(() => setTimeout(() => checkProgress(setSyncProgress, setUser), 10000));
};

const Layout: React.FC<{ children: any }> = ({ children }) => {
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
              <NavLink exact to="/" activeClassName="navLink-active">
                Home
              </NavLink>
            </li>
            {user && (
              <>
                <li>
                  <NavLink exact to="/activities" activeClassName="navLink-active">
                    Activities
                  </NavLink>
                </li>
                <li>
                  <NavLink exact to="/progress" activeClassName="navLink-active">
                    Progress
                  </NavLink>
                </li>
                <li>
                  <NavLink exact to="/intervals" activeClassName="navLink-active">
                    Intervals (Beta)
                  </NavLink>
                </li>
              </>
            )}
          </LinkContainer>
          <LinkContainer style={{ flex: '0' }}>
            {user && (
              <>
                <li>
                  <ProfileImage src={user.profileImageUrl} alt={user.fullName} />
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
      <LayoutContainer>
        {user && syncProgress >= 1.0 && <div>{children}</div>}
        {user && syncProgress < 1.0 && (
        <CenterContainer>
          <p>Loading your activities</p>
          {syncProgress > 0.0
          && <div><SyncPercentage>{round(syncProgress * 100, 0)} %</SyncPercentage></div>}
          {syncProgress === 0.0
          && <div>Progress: <SyncPercentage>{round(syncProgress * 100, 0)} %</SyncPercentage> (Waiting for available slot)</div>}
        </CenterContainer>
        )}
        {user === null && (
        <CenterContainer>
          <p>Welcome. Sign in to proceed.</p>
          <SignInButton href="/signin">Sign in</SignInButton>
        </CenterContainer>
        )}
      </LayoutContainer>
    </UserContext.Provider>
  );
};

export default Layout;
