import React, { useContext, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';

import Board from './Board';
import Dashboard from './Dashboard';
import { AppContext } from 'context/app/provider';

const RootPage = () => {
  const { fetchAppData } = useContext(AppContext);

  useEffect(() => {
    fetchAppData(`/assets/data.json`);
  }, [fetchAppData]);

  useEffect(() => {}, []);

  return (
    <React.Fragment>
      <Router>
        <Switch>
          <Redirect exact from={'/'} to={'/data/all'} />
          <Route exact path={'/data/:sid'} component={Board} />
          <Route exact path={'/dashboard'} component={Dashboard} />
          <Route component={NotFound} />
        </Switch>
      </Router>
    </React.Fragment>
  );
};

const NotFound = () => <div> 404 Not Found </div>;

export default RootPage;
