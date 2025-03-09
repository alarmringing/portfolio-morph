import axios from 'axios';

const API_URL = 'http://localhost:1337/api';

export const getAbout = async () => {
  const response = await axios.get(`${API_URL}/about`);
  return response.data;
};

export const getProjects = async () => {
  const response = await axios.get(`${API_URL}/projects`, {
    params: {
      sort: 'title',
    }
  });
  return response.data;
};

export default {
  getAbout,
  getProjects
};