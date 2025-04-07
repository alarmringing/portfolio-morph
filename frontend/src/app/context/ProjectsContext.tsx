'use client'

import { createContext, useContext, useState } from 'react';
import { ProjectData } from '@/strapi/StrapiData';
// import { getProjectsGrid } from '@/strapi/strapi'; // <-- No longer needed here

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
  // isLoading: boolean; // <-- Remove isLoading
  // error: string | null; // <-- Remove error
  activeFilter: FilterType;
  setActiveFilter: (filter: FilterType) => void;
}

const ProjectsContext = createContext<ProjectsContextType>({
  projects: [],
  activeFilter: FilterType.All,
  setActiveFilter: () => {}
});

// Define props for the provider, including initialProjects
interface ProjectsProviderProps {
  children: React.ReactNode;
  initialProjects: ProjectData[];
}

// export function ProjectsProvider({ children }: { children: React.ReactNode }) { // <-- Modify signature
export function ProjectsProvider({ children, initialProjects }: ProjectsProviderProps) { // <-- Use new props type
  // Sort initial projects: Filter by Show, then put Hero projects first
  const [projects] = useState<ProjectData[]>(() =>
    initialProjects
      .filter(project => project.Show)
      .sort((a, b) => {
        // If b is featured and a is not, b comes first
        if (b.IsFeatured && !a.IsFeatured) return 1;
        // If a is featured and b is not, a comes first
        if (a.IsFeatured && !b.IsFeatured) return -1;
        // Otherwise, maintain relative order
        return 0;
      })
  );
  const [activeFilter, setActiveFilter] = useState<FilterType>(FilterType.All);

  // Provide the projects state initialized from the prop
  return (
    <ProjectsContext.Provider value={{ projects, activeFilter, setActiveFilter }}>
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