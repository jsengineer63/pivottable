const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_STATE_VARIABLE':
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};
export default reducer;
