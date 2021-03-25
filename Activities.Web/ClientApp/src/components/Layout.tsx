import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

const Layout: React.FC<{ children: any }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        if (isAuthenticated == true) {
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
        <div>
            <ul>
                <li><Link to="/">Home</Link></li>
                {isAuthenticated &&
                    <React.Fragment>
                        <li><Link to="/activities">Activities</Link></li>
                    </React.Fragment>
                }
                <li><a href={isAuthenticated ? '/signout' : '/signin'}>{isAuthenticated ? 'Sign out' : 'Sign in'}</a></li>
            </ul>
            <div>
                {children}
            </div>
        </div>
    );
}
    
export default Layout;