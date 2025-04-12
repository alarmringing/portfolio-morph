// Remove 'use client' if it exists - Layout should be a Server Component for data fetching
import type { Metadata } from 'next'
import { ProjectsProvider } from './context/ProjectsContext'
import SharedLayout from './components/SharedLayout'
import { Analytics } from '@vercel/analytics/next';
import { getProjectsGrid } from '@/strapi/strapi' // <-- Import fetching function
import { ProjectData } from '@/strapi/StrapiData' // <-- Import data type

const productionUrl = 'https://jiheehwang.com';

export const metadata: Metadata = {
  // This sets the <title> tag
  title: 'Jihee.지희.ジヒ.智熙',

  // This sets the <meta name="description"> tag (important for SEO)
  description: 'Jihee\'s morphy loopy squishy home sweet home of projects AKA portfolio.',

  // Crucial for making sure image paths work correctly in production
  metadataBase: new URL(productionUrl),

  // --- Open Graph Metadata (Facebook, LinkedIn, etc.) ---
  openGraph: {
    title: 'Jihee.지희.ジヒ.智熙', 
    description: 'Jihee\'s morphy loopy squishy home sweet home of projects AKA portfolio.',
    url: productionUrl,
    siteName: 'Your Site Name', 
    images: [
      {
        url: '/thumbnail.jpg',
        width: 1200,        
        height: 630,       
        alt: 'Screenshot of page', 
      },
    ],
    locale: 'en_US', 
    type: 'website',
  },
}

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
      <head>
        {/* Preload critical fonts */}
        <link 
          rel="preload" 
          href="/fonts/PottaOne-subset.ttf" 
          as="font" 
          type="font/truetype" 
          crossOrigin="anonymous" 
        />
        <link 
          rel="preload" 
          href="/fonts/BagelFatOne-subset.ttf" 
          as="font" 
          type="font/truetype" 
          crossOrigin="anonymous" 
        />
        <link 
          rel="preload" 
          href="/fonts/SyneMono-Regular.ttf" 
          as="font" 
          type="font/truetype" 
          crossOrigin="anonymous" 
        />
        {/* Add other head elements here if needed */}
      </head>
      <body>
        {/* Pass fetched projects as a prop */}
        <ProjectsProvider initialProjects={allProjects}>
          <SharedLayout>
            {children}
          </SharedLayout>
        </ProjectsProvider>
        <Analytics />
      </body>
    </html>
  )
}
