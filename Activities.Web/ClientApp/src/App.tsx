import * as React from 'react';
import { Route } from 'react-router';
import HomePage from './components/home/HomePage';
import ActivitiesPage from './components/activities/ActivitiesPage';
import IntervalsPage from './components/intervals/IntervalsPage';
import ProgressPage from './components/progress/ProgressPage';
import RacesPage from './components/races/races';
import Layout from './components/Layout';

export default () => (
    <Layout>
        <Route exact path="/" component={HomePage}/>
        <Route exact path="/activities" component={ActivitiesPage}/>
        <Route exact path="/intervals" component={IntervalsPage}/>
        <Route exact path="/races" component={RacesPage}/>
        <Route exact path="/progress" component={ProgressPage}/>
    </Layout>
);