import _ from 'lodash';
import { useCallback } from 'react';

export const useUpdateState = (dispatch) =>
  useCallback(
    (arg1, arg2) => {
      if (_.isObject(arg1)) {
        dispatch({
          type: 'UPDATE_STATE_VARIABLE',
          payload: arg1,
        });
        if (_.isFunction(arg2)) {
          arg2();
        }
        return;
      } else if (_.isString(arg1)) {
        dispatch({
          type: 'UPDATE_STATE_VARIABLE',
          payload: { [arg1]: arg2 },
        });
        return;
      }

      throw new Error('arguments is invalid');
    },
    [dispatch]
  );
