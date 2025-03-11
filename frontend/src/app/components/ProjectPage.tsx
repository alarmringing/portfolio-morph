'use client'

import { ProjectData } from '@/strapi/StrapiData';
import { STRAPI_URL } from '@/strapi/strapi';
import { renderNode } from '@/strapi/StrapiRenderNodes';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { fadeTransitionStyle, handlePageEnterTransition, handlePageExitTransition } from '../utils/transitions';

interface ProjectPageProps {
  project: ProjectData;
}

export default function ProjectPage({ project }: ProjectPageProps) {
  const router = useRouter();
  const [isEntering, setIsEntering] = useState(false);
  const imageUrl = project.Thumbnail ? 
    `${STRAPI_URL}${project.Thumbnail.url}` : null;

  useEffect(() => {
    handlePageEnterTransition(setIsEntering);
  }, []);

  const handleBack = () => {
      handlePageExitTransition(setIsEntering, () => {
      router.push('/#projects');
    });
  };

  return (
    <div className="min-h-screen w-full flex" style={fadeTransitionStyle(isEntering)}>
      <div className="bottom-8 left-8 fixed z-30">
        <button onClick={handleBack} className="">
          Back
        </button>
      </div>
      <div>
        <h1>{project.Title}</h1>
        {project.Type && (
          <p>{project.Type}</p>
        )}
      </div>

      <div>
        <div>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={project.Title}
            />
          ) : (
            <div>No Image Available</div>
          )}
        </div>

        <div>
          <h2>Description</h2>
          <div>
            {project.Description?.map((paragraph, index) => (
              <div key={index}>{renderNode(paragraph)}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
