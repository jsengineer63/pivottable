import _ from 'lodash';

export const getNameByUnique = (array, name) => {
  return _.uniq(array.map((c) => c[name])).map((v) => ({
    id: v,
    name: '' + v,
  }));
};

export const getNameByIdFromNames = (names, id) => {
  const res = _.find(names, { id });
  return res ? res.name : null;
};
