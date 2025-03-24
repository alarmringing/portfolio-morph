'use client'

import { useRef, useState } from 'react';
import { STRAPI_URL } from '@/strapi/strapi';
import styles from './ProjectPage.module.css';
import gridStyles from '../../components/IsotopeGrid.module.css';
import IsotopeGrid, { generateRandomLayout, determineExpandPosition } from '../../components/IsotopeGrid';
import { ProjectData } from '@/strapi/StrapiData';

interface ProjectMediaGridProps {
  project: ProjectData;
  media: any[];
}

export default function ProjectMediaGrid({ project, media }: ProjectMediaGridProps) {
  const mediaGridRef = useRef<HTMLDivElement>(null);
  const [expandedMediaId, setExpandedMediaId] = useState<number | null>(null);
  const [expandedMediaPosition, setExpandedMediaPosition] = useState<'left' | 'right' | 'center' | null>(null);

  // Handle media click to expand/collapse
  const handleMediaClick = (mediaId: number, element: HTMLElement) => {
    if (mediaGridRef.current) {
      const position = determineExpandPosition(element, mediaGridRef);
      setExpandedMediaPosition(position);
    }
    
    if (expandedMediaId === mediaId) {
      // If already expanded, collapse it
      setExpandedMediaId(null);
    } else {
      // Expand this item
      setExpandedMediaId(mediaId);
    }
  };

  // Function to render media in grid layout (images only)
  const renderMediaGridItem = (media: any, index: number) => {
    if (!media || !media.mime?.startsWith('image/')) return null;
    
    // Get random margins and padding for this media item
    const { marginBottom, paddingLeft } = generateRandomLayout(media.id);
    
    const isExpanded = expandedMediaId === media.id;
    
    return (
      <button 
        key={index}
        className={`
          ${gridStyles.featured}
          ${gridStyles.gridItem}
          ${isExpanded ? gridStyles.expanded : ''}
          ${isExpanded && expandedMediaPosition === 'right' ? gridStyles.expandedRight : ''}
        `}
        style={{ 
          marginBottom: `${marginBottom}rem`, 
          paddingLeft: `${paddingLeft}rem` 
        }}
        onClick={(e) => handleMediaClick(media.id, e.currentTarget)}
      >
        <div className={gridStyles.gridItemInnerContainer}>
          <div className={gridStyles.imageContainer}>
            <img
              src={`${STRAPI_URL}${media.url}`}
              alt={media.alternativeText || project.Title}
              loading="lazy"
            />
          </div>
          {media.caption && (
            <div className={gridStyles.textContainer}>
              <p>{media.caption}</p>
            </div>
          )}
        </div>
      </button>
    );
  };

  return (
    <div ref={mediaGridRef}>
      <IsotopeGrid 
        itemSelector={`.${gridStyles.gridItem}`}
        projects={[project]}
        filter={undefined}
      >
        {media.map((media, index) => renderMediaGridItem(media, index))}
      </IsotopeGrid>
    </div>
  );
} 