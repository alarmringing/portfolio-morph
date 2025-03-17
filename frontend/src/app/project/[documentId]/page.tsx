import { getProjectsGrid, getProjectsPage } from '@/strapi/strapi'
import { ProjectData } from '@/strapi/StrapiData'
import ProjectClientPage from './ProjectClientPage'


// This generates all project pages at build time
export async function generateStaticParams() {
  const projects = await getProjectsGrid();
  
  return projects.projects.map((project: { documentId : string }) => ({
    documentId : project.documentId,
  }));
}

// Server component that fetches data
export default async function ProjectPage({ params }: { params: { documentId : string } }) {
  const { documentId  } = await params;
  const project = await getProjectsPage(documentId) as ProjectData;


  if (!project) {
    return <div>Project not found</div>;
  }

  console.log(project);

  return <ProjectClientPage project={project} />;
} 