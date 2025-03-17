'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ProjectData } from '@/strapi/StrapiData';
import { getProjectsGrid } from '@/strapi/strapi';
import { FilterType } from '../components/ProjectGrid';

interface ProjectsContextType {
  projects: ProjectData[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  error: string | null;
  activeFilter: FilterType;
  setActiveFilter: (filter: FilterType) => void;
}

const ProjectsContext = createContext<ProjectsContextType>({
  projects: [],
  isLoading: true,
  hasMore: true,
  loadMore: async () => {},
  error: null,
  activeFilter: FilterType.All,
  setActiveFilter: () => {}
});

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>(FilterType.All);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    try {
      setIsLoading(true);
      const { projects: newProjects, pagination } = await getProjectsGrid(page);

      setProjects(prev => [...prev, ...newProjects]);
      setHasMore(pagination.pageCount > page);
      setPage(prev => prev + 1);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore]);

  // Load initial data
  useEffect(() => {
    loadMore();
  }, []);

  return (
    <ProjectsContext.Provider value={{ projects, isLoading, hasMore, loadMore, error, activeFilter, setActiveFilter }}>
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