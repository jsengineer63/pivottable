import axios from 'axios';
export const Api = {
  get: (url, data = {}) => {
    const options = {
      headers: { 'Content-Type': 'application/json' },
    };

    return axios.get(url, data, options);
  },
};
