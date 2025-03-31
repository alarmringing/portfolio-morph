// Remove 'use client' if it exists - Layout should be a Server Component for data fetching

import { ProjectsProvider } from './context/ProjectsContext'
import SharedLayout from './components/SharedLayout'
import { getProjectsGrid } from '@/strapi/strapi' // <-- Import fetching function
import { ProjectData } from '@/strapi/StrapiData' // <-- Import data type

// Helper function to fetch all projects (similar to loadAllProjects)
async function fetchAllProjects(): Promise<ProjectData[]> {
  let currentPage = 1;
  let keepFetching = true;
  const accumulatedProjects: ProjectData[] = [];

  console.log("Fetching projects server-side...");
  while (keepFetching) {
    try {
      // console.log(`Fetching page ${currentPage}...`); // Optional: Keep server log
      const { projects: newProjects, pagination } = await getProjectsGrid(currentPage);
      if (newProjects && newProjects.length > 0) {
        accumulatedProjects.push(...newProjects);
      }
      
      if (pagination && pagination.pageCount > currentPage) {
        currentPage++;
      } else {
        keepFetching = false;
      }
    } catch (err) {
      console.error("Error fetching projects server-side:", err); 
      keepFetching = false; 
    }
  }
  console.log(`Finished fetching projects server-side. Total: ${accumulatedProjects.length}`);
  return accumulatedProjects;
}

export default async function RootLayout({ // <-- Make the function async
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch projects on the server
  const allProjects = await fetchAllProjects();

  return (
    <html lang="en">
      <body>
        {/* Pass fetched projects as a prop */}
        <ProjectsProvider initialProjects={allProjects}>
          <SharedLayout>
            {children}
          </SharedLayout>
        </ProjectsProvider>
      </body>
    </html>
  )
}
