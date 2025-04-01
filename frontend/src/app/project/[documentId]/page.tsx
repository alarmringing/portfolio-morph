import { getProjectsGrid, getProjectsPage } from '@/strapi/strapi'
import { ProjectData } from '@/strapi/StrapiData'
import ProjectClientPage from './ProjectClientPage'

type Params = Promise<{ documentId: string }>

// This generates all project pages at build time
export async function generateStaticParams() {
  const projects = await getProjectsGrid();
  
  return projects.projects.map((project: { documentId : string }) => ({
    documentId : project.documentId,
  }));
}

// Server component that fetches data
export default async function ProjectPage(props: { params: Params }) {
  const params = await props.params;
  const { documentId } = params;
  const project = await getProjectsPage(documentId) as ProjectData;

  if (!project) {
    return <div>Project not found</div>;
  }

  console.log(project);

  return <ProjectClientPage project={project} />;
} 