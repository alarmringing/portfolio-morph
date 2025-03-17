'use client'

import { ProjectData } from '@/strapi/StrapiData'
import ProjectPage from './ProjectPage'

export default function ProjectClientPage({ project }: { project: ProjectData }) {
  return (
      <ProjectPage project={project} />
  )
} 