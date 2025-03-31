'use client'

import { useRef, useState } from 'react';
import Image from 'next/image';
import { STRAPI_URL } from '@/strapi/strapi';
import gridStyles from '../../components/IsotopeGrid.module.css';
import IsotopeGrid, { generateRandomLayout, determineExpandPosition } from '../../components/IsotopeGrid';
import { ProjectData, MediaData } from '@/strapi/StrapiData';

interface ProjectMediaGridProps {
  project: ProjectData;
  media: MediaData[];
}

interface MediaGridItemProps {
  media: MediaData;
  projectTitle: string;
  isExpanded: boolean;
  expandedPosition: 'left' | 'right' | 'center' | null;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

// MediaGridItem component for displaying media items in the grid
const MediaGridItem = ({ media, projectTitle, isExpanded, expandedPosition, onClick }: MediaGridItemProps) => {
  if (!media || !media.mime?.startsWith('image/')) return null;
  
  // Get random margins and padding for this media item
  const { marginBottom, paddingRight } = generateRandomLayout(media.id);
      
  return (
    <button 
      className={`
        ${gridStyles.featured}
        ${gridStyles.gridItem}
        ${isExpanded ? gridStyles.expanded : ''}
        ${isExpanded && expandedPosition === 'left' ? gridStyles.expandedLeft : ''}
      `}
      style={{ 
        marginBottom: `${marginBottom}rem`, 
        paddingRight: `${paddingRight}rem` 
      }}
      onClick={onClick}
    >
      <div className={gridStyles.gridItemInnerContainer}>
        <div className={gridStyles.imageContainer}>
          <Image
            src={`${STRAPI_URL}${media.url}`}
            alt={media.alternativeText || projectTitle || 'Project media'}
            width={media.width}
            height={media.height}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
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

  return (
    <div ref={mediaGridRef}>
      <IsotopeGrid 
        itemSelector={`.${gridStyles.gridItem}`}
        projects={media}
        filter={'*'}
      >
        {media.map((mediaItem, index) => (
          <MediaGridItem
            key={index}
            media={mediaItem}
            projectTitle={project.Title}
            isExpanded={expandedMediaId === mediaItem.id}
            expandedPosition={expandedMediaPosition}
            onClick={(e) => handleMediaClick(mediaItem.id, e.currentTarget)}
          />
        ))}
      </IsotopeGrid>
    </div>
  );
} 