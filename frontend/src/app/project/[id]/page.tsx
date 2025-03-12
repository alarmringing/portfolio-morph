import { getProjects } from '@/strapi/strapi'
import { ProjectData } from '@/strapi/StrapiData'
import ProjectClientPage from './ProjectClientPage'

// This generates all project pages at build time
export async function generateStaticParams() {
  const projects = await getProjects();
  
  return projects.data.map((project: { id: number }) => ({
    id: project.id.toString(),
  }));
}

// Server component that fetches data
export default async function ProjectPage({ params }: { params: { id: string } }) {
  const projects = await getProjects();
  const { id } = await params;
  const project = projects.data.find((p: ProjectData) => p.id.toString() === id);

  if (!project) {
    return <div>Project not found</div>;
  }

  return <ProjectClientPage project={project} />;
} 