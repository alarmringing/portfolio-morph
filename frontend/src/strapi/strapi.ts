import axios from 'axios';
import { ProjectsResponse, ProjectResponse } from './StrapiData';

export const API_URL = process.env.NEXT_PUBLIC_STRAPI_URL + "/api";
export const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;
const PAGE_SIZE = 10;

export const getAbout = async () => {
  const response = await axios.get(`${API_URL}/about`);
  return response.data;
};

export const getProjectsGrid = async (page: number = 1) => {
  const response = await axios.get<ProjectsResponse>(`${API_URL}/projects`, {
    params: {
      sort: ['Year:desc'],
      populate: 'Thumbnail',
      'pagination[page]': page,
      'pagination[pageSize]': PAGE_SIZE
    }
  });

  const { data, meta } = response.data;

  return {
    projects: data,
    pagination: meta.pagination
  };
};

export const getProjectsPage = async (documentId : string) => {
  const response = await axios.get<ProjectResponse>(`${API_URL}/projects/${documentId}`, {
    params: {
      populate: ['Thumbnail','Media', 'HeroMedia']
    }
  });
  console.log(response.data);

  return response.data.data;
};

const strapiApi = {
  getAbout,
  getProjectsGrid,
  getProjectsPage,
  API_URL,
  STRAPI_URL
};

export default strapiApi;