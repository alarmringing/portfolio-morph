'use client'

import { useEffect, useRef, useState, useMemo } from 'react';
import styles from './IsotopeGrid.module.css';
import { useProjects, FilterType } from '../context/ProjectsContext';
import { ProjectData } from '@/strapi/StrapiData';
import { ProjectGridItem } from './ProjectGridItem';
import IsotopeGrid, { determineExpandPosition, generateRandomLayout } from './IsotopeGrid';

interface ProjectGridProps {
    onGridClick: (documentId: string) => void;
}

export default function ProjectGrid({ onGridClick }: ProjectGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const { projects, activeFilter } = useProjects();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [expandedItemPosition, setExpandedItemPosition] = useState<'left' | 'right' | 'center' | null>(null);

  // Generate random margin and padding values for each project based on its ID
  const projectStyles = useMemo(() => {
    const styles: Record<string, { marginBottom: number, paddingRight: number }> = {};
    
    projects.forEach(project => {
      // Get random layout values using our utility function
      const { marginBottom, paddingRight } = generateRandomLayout(project.documentId, 
        // Apply custom factor based on project type
        project.Type === FilterType.Static ? 1 : 1.5
      );
      
      styles[project.documentId] = {
        marginBottom,
        paddingRight
      };
    });
    
    return styles;
  }, [projects]);

  // Handle project click based on available content
  const handleProjectClick = (project: ProjectData, element: HTMLElement) => {
    // Case 1: If there is a description, navigate to project page
    if (project.Description) {
      onGridClick(project.documentId);
      return;
    }
    
    // Case 2: If there are external links, open the first available one
    if (project.Youtube) {
      window.open(project.Youtube, '_blank');
      return;
    }
    
    if (project.Vimeo) {
      window.open(project.Vimeo, '_blank');
      return;
    }
    
    if (project.Github) {
      window.open(project.Github, '_blank');
      return;
    }
    
    // Case 3: If there is neither description nor URLs, expand the item
    if (element) {
      const position = determineExpandPosition(element, gridRef);
      setExpandedItemPosition(position);
    }
    if (expandedItemId === project.documentId) {
      // If already expanded, collapse it
      setExpandedItemId(null);
    } else {
      // Expand this item
      setExpandedItemId(project.documentId);
    }
  };

   // Observe the last grid item
   useEffect(() => {
    const observer = observerRef.current;
    if (!observer || projects.length === 0) return;

    const lastGridItem = gridRef.current?.lastElementChild as HTMLElement;
    if (lastGridItem) {
      observer.observe(lastGridItem);
    }

    return () => {
      if (lastGridItem && observer) {
        observer.unobserve(lastGridItem);
      }
    };
  }, [projects]);

  // Calculate filter value
  const filterValue = useMemo(() => {    
    const sanitizeSelector = (selector: string): string => {
      // Replace problematic characters with escaped versions
      return selector.toLowerCase()
        .replace(/&/g, 'and')        // Replace & with 'and'
        .replace(/[^a-z0-9-_]/g, '') // Remove any other special characters
        .trim();
    };
    const filterValue = activeFilter === FilterType.All ? '*' : `.${sanitizeSelector(activeFilter)}`;
    return filterValue;
  }, [activeFilter]);

  // Handle expanding items - reset any expanded items when filter changes
  useEffect(() => {
    setExpandedItemId(null);
  }, [activeFilter]);
  
  return (
    <div>
      <div ref={gridRef}>
        <IsotopeGrid 
          projects={projects}
          itemSelector={`.${styles.gridItem}`}
          filter={filterValue}
        >          
          {projects.map((project) => (
            <ProjectGridItem
              key={project.documentId}
              project={project}
              marginBottom={projectStyles[project.documentId].marginBottom}
              paddingRight={projectStyles[project.documentId].paddingRight}
              showType={Boolean(project.Type && activeFilter === FilterType.All && project.Type !== FilterType.None)}
              isExpanded={expandedItemId === project.documentId}
              expandedPosition={expandedItemId === project.documentId ? expandedItemPosition : null}
              onClick={(element) => handleProjectClick(project, element)}
            />
          ))}
        </IsotopeGrid>
      </div>
    </div>
  );
}
