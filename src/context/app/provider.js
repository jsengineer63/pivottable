import React, { createContext, useCallback, useReducer } from 'react';
import { Api } from 'service/fetchApi';

import reducer from './reducer';
import { useUpdateState } from './actions';

const AppContext = createContext(null);
const initValue = {
  data: null,
  chosedSection: '',
};

const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initValue);

  const updateAppState = useUpdateState(dispatch);
  const fetchAppData = useCallback(
    async (url) => {
      const data = await Api.get(url).then((res) => res.data);
      updateAppState({ data });
    },
    [updateAppState]
  );
  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        updateAppState,
        fetchAppData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };
