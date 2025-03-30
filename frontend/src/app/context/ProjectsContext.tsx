'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ProjectData } from '@/strapi/StrapiData';
import { getProjectsGrid } from '@/strapi/strapi';

export enum FilterType {
  All = 'All',
  Interactive = 'Interactive',
  Static = 'Static',
  Rnd = 'Rnd',
  Music = 'Music',
  None = 'None'
}


interface ProjectsContextType {
  projects: ProjectData[];
  isLoading: boolean;
  error: string | null;
  activeFilter: FilterType;
  setActiveFilter: (filter: FilterType) => void;
}

const ProjectsContext = createContext<ProjectsContextType>({
  projects: [],
  isLoading: true,
  error: null,
  activeFilter: FilterType.All,
  setActiveFilter: () => {}
});

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>(FilterType.All);
  const [error, setError] = useState<string | null>(null);

  const loadAllProjects = useCallback(async () => {
    setIsLoading(true);
    setProjects([]);
    setError(null);
    let currentPage = 1;
    let keepFetching = true;
    const accumulatedProjects: ProjectData[] = [];

    while (keepFetching) {
      try {
        console.log(`Fetching page ${currentPage}...`);
        const { projects: newProjects, pagination } = await getProjectsGrid(currentPage);
        accumulatedProjects.push(...newProjects);
        
        if (pagination.pageCount > currentPage) {
          currentPage++;
        } else {
          keepFetching = false;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching projects');
        keepFetching = false;
        setIsLoading(false);
        return;
      }
    }
    
    setProjects(accumulatedProjects);
    setIsLoading(false);
    console.log(`Finished fetching all projects. Total: ${accumulatedProjects.length}`);

  }, []);

  useEffect(() => {
    loadAllProjects();
  }, [loadAllProjects]);

  return (
    <ProjectsContext.Provider value={{ projects, isLoading, error, activeFilter, setActiveFilter }}>
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