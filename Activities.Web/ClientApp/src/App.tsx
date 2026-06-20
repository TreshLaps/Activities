import { Route, Routes } from 'react-router-dom';
import HomePage from './components/home/HomePage';
import ActivitiesPage from './components/activities/ActivitiesPage';
import SimiliarActivitiesPage from './components/activities/SimilarActivitiesPage';
import ActivitiesDetailsPage from './components/activityDetails/ActivityDetailsPage';
import IntervalsPage from './components/intervals/IntervalsPage';
import RacesPage from './components/races/races';
import Layout from './components/Layout';
import ProgressPage from './components/progress/ProgressPage';
import ScatterPage from './components/scatter/ScatterPage';

const App = () => (
    <Layout>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/intervals" element={<IntervalsPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/races" element={<RacesPage />} />
            <Route path="/scatter" element={<ScatterPage />} />
            <Route path="/activities/:id" element={<ActivitiesDetailsPage />} />
            <Route
                path="/activities/:id/similar"
                element={<SimiliarActivitiesPage />}
            />
        </Routes>
    </Layout>
);

export default App;
