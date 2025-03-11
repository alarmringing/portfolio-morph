'use client'

import SharedLayout from './components/SharedLayout'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SharedLayout>{children}</SharedLayout>
      </body>
    </html>
  )
}
