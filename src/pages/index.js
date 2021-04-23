import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Board from './Board';
import Category from './Category';
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
          <Route component={NotFound} />
        </Switch>
      </Router>
    </React.Fragment>
  );
};

const NotFound = () => <div> 404 Not Found </div>;

export default RootPage;
