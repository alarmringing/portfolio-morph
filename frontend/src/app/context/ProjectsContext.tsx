'use client'

import { createContext, useContext, useEffect, useState } from 'react';
import { ProjectData, ProjectResponse } from '@/strapi/StrapiData';
import { getProjects } from '@/strapi/strapi';
import { FilterType } from '../components/ProjectGrid';

interface ProjectsContextType {
  projects: ProjectData[];
  isLoading: boolean;
  activeFilter: FilterType;
  setActiveFilter: (filter: FilterType) => void;
}

const ProjectsContext = createContext<ProjectsContextType>({
  projects: [],
  isLoading: true,
  activeFilter: FilterType.All,
  setActiveFilter: () => {}
});

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>(FilterType.All);


  useEffect(() => {
    const loadProjects = async () => {
      try {
        console.log('Loading projects...');
        const response: ProjectResponse = await getProjects();
        setProjects(response.data);
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

  return (
    <ProjectsContext.Provider value={{ projects, isLoading, activeFilter, setActiveFilter }}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
} 