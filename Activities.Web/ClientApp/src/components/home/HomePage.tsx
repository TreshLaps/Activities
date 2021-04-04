import React, { useEffect, useState } from 'react';
import ProgressPage from '../progress/ProgressPage';

const HomePage: React.FC = () => {    
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        if (isAuthenticated === true) {
            return;
        }

        fetch(`/api/Authentication/IsAuthenticated/`)
            .then(response => response.json() as Promise<boolean>)
            .then(data => {
                setIsAuthenticated(data);
            })
            .catch(error => setIsAuthenticated(false));
    });

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div>
            <ProgressPage/>
        </div>
    );
}
    
export default HomePage;