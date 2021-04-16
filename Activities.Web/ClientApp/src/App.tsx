import * as React from 'react';
import { Route } from 'react-router';
import HomePage from './components/home/HomePage';
import ActivitiesPage from './components/activities/ActivitiesPage';
import ActivitiesDetailsPage from './components/activityDetails/ActivityDetailsPage';
import IntervalsPage from './components/intervals/IntervalsPage';
import RacesPage from './components/races/races';
import Layout from './components/Layout';
import ProgressPage from './components/progress/ProgressPage';
import ScatterPage from './components/scatter/ScatterPage';

export default () => (
  <Layout>
    <Route exact path="/" component={HomePage} />
    <Route exact path="/activities" component={ActivitiesPage} />
    <Route exact path="/intervals" component={IntervalsPage} />
    <Route exact path="/progress" component={ProgressPage} />
    <Route exact path="/races" component={RacesPage} />
    <Route exact path="/scatter" component={ScatterPage} />
    <Route exact path="/activities/:id" component={ActivitiesDetailsPage} />
  </Layout>
);
