import * as React from 'react';
import { Route } from 'react-router';
import HomePage from './components/home/HomePage';
import ActivitiesPage from './components/activities/ActivitiesPage';
import Layout from './components/Layout';

export default () => (
    <Layout>
        <Route exact path="/" component={HomePage}/>
        <Route exact path="/activities" component={ActivitiesPage}/>
    </Layout>
);