'use client'

import { ProjectsProvider } from './context/ProjectsContext'
import SharedLayout from './components/SharedLayout'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ProjectsProvider>
          <SharedLayout>
            {children}
          </SharedLayout>
        </ProjectsProvider>
      </body>
    </html>
  )
}
