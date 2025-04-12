# portfolio-morph
A portfolio website featuring a morphing text in the center.
It uses Next.js in the frontend, and Strapi as a headless CMS in the backend.

# Frontend (Next.js App Router)

Built with Next.js App Router.

## Core Concepts

-   **Structure:** Uses Server Components (`src/app/layout.tsx`) for initial server-side data fetching (all projects via `getProjectsGrid`) and Client Components (`src/app/page.tsx`) for client-side fetching ("About" section via `getAbout`). Project details are under `src/app/project/[id]/`.
-   **Data:** Fetches content from a Strapi backend using helpers in `src/strapi/`. Project data and filter state are managed globally via `ProjectsContext` (`src/app/context/`).
-   **UI Components:** Key components in `src/app/components/` include:
    -   `SharedLayout.tsx`: Base layout, Navbar, `TextMorphEffect`, page transitions.
    -   `ProjectGrid.tsx`: Isotope/Packery-based grid for projects.
    -   `TextMorphEffect.tsx`: Central text morphing animation.
-   **Styling:** Combines CSS Modules for component styles with global CSS (`page.css`, `fonts.css`).
-   **Development:** Run locally using `npm run dev`.

## Deployment

-   Deployed on Vercel.
-   The `frontend-deploy` branch triggers auto-deployment.
-   Requires the `NEXT_PUBLIC_STRAPI_URL` environment variable pointing to the Strapi backend.

# Backend (Strapi)
Run with `npm run dev`

## Deployment

-   Deployed on Render.com, with a SQLite instance & built-in data drive (`/data`) containing the .db file and media.
-   The `backend-deploy` branch triggers auto-deployment.
-   Make sure `DATABASE_FILENAME` environment variable points to the correct database in the data drive.