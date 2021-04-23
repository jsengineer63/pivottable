import _ from 'lodash';

export const getNameByUnique = (array, name) => {
  return _.uniq(array.map((c) => c[name])).map((v) => ({
    id: v,
    name: '' + v,
  }));
};
