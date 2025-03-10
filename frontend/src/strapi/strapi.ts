import axios from 'axios';

export const API_URL = 'http://localhost:1337/api';
export const STRAPI_URL = 'http://localhost:1337';

export const getAbout = async () => {
  const response = await axios.get(`${API_URL}/about`);
  return response.data;
};

export const getProjects = async () => {
  const response = await axios.get(`${API_URL}/projects`, {
    params: {
      sort: ['Title:asc'],
      populate: ['Thumbnail']
    }
  });
  console.log('Strapi response:', response.data);
  return response.data;
};

export default {
  getAbout,
  getProjects,
  API_URL,
  STRAPI_URL
};