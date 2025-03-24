'use client'

import { useState } from 'react';
import { STRAPI_URL } from '@/strapi/strapi';
import styles from './IsotopeGrid.module.css';
import { FilterType } from '../context/ProjectsContext';

interface ProjectGridItemProps {
  project: any;
  marginBottom: number;
  paddingRight: number;
  showType: boolean;
  isExpanded: boolean;
  expandedPosition: 'left' | 'right' | 'center' | null;
  onClick: (element: HTMLButtonElement) => void;
}

export function ProjectGridItem({
  project,
  marginBottom,
  paddingRight,
  showType,
  isExpanded,
  expandedPosition,
  onClick
}: ProjectGridItemProps) {
  const [isImageWide, setIsImageWide] = useState<boolean>(false);

  const onLoadImage = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    const aspectRatio = img.width / img.height;
    setIsImageWide(aspectRatio > 1.0 && project.Type != FilterType.None);
  }
  
  const imageUrl = project.Thumbnail 
    ? `${STRAPI_URL}${project.Thumbnail.url}` 
    : null;

  return (
    <button 
      style={{ marginBottom: `${marginBottom}rem`, paddingRight: `${paddingRight}rem` }}
      className={`
        ${styles.gridItem} 
        ${project.Type?.toLowerCase()} 
        ${isImageWide ? styles.landscape : styles.portrait}
        ${project.IsFeatured ? styles.featured : ''}
        ${isExpanded ? styles.expanded : ''} 
        ${isExpanded && expandedPosition === 'left' ? styles.expandedLeft : ''}
        ${isExpanded && expandedPosition === 'right' ? styles.expandedRight : ''}
        ${isExpanded && expandedPosition === 'center' ? styles.expandedCenter : ''}
      `}
      onClick={(e) => onClick(e.currentTarget)}
    >
      <div className={styles.gridItemInnerContainer}>
        <div className={styles.imageContainer}>
          {project.Thumbnail ? (
            <img
              src={imageUrl!}
              alt={project.Title}
              loading="lazy"
              onLoad={onLoadImage}
            />
          ) : (
            <div>No Image</div>
          )}
        </div>
        <div className={styles.textContainer}>
          <h3>{project.Title}</h3>
          {showType && (
            <p>{project.Type === FilterType.Rnd ? 'R&D' : project.Type}</p>
          )} 
        </div>
      </div>
    </button>
  );
} 