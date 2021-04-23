import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Board from './Board';
import Category from './Category';
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
          <Route exact path={'/'} component={Category} />
          <Route exact path={'/data/:sid'} component={Board} />
          <Route exact path={'/dashboard'} component={Dashboard} />
        </Switch>
      </Router>
    </React.Fragment>
  );
};

export default RootPage;
