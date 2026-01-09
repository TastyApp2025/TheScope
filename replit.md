# The Scope - Editorial Platform

## Overview

The Scope is a full-stack TypeScript news and editorial content management platform. It features a mobile-first React frontend for reading stories with immersive design, and an Express backend with PostgreSQL for data persistence. The platform includes an admin dashboard for content management, AI-powered audio narration via OpenAI TTS, and cloud-based image storage through Cloudinary.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state caching
- **Styling**: Tailwind CSS with shadcn/ui component library (Radix UI primitives)
- **Build Tool**: Vite with path aliases (`@/` for client/src, `@shared/` for shared code)
- **Form Handling**: React Hook Form with Zod validation
- **SEO**: React Helmet Async for dynamic meta tags

The frontend follows a page-based structure under `client/src/pages/` with reusable UI components in `client/src/components/ui/`. Custom hooks in `client/src/hooks/` handle authentication state and mobile detection.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Passport.js with local strategy (username/password)
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple
- **Password Security**: bcrypt for hashing (10 salt rounds)

The backend serves both the API (`/api/*` routes) and the static frontend in production. In development, Vite's dev server handles the frontend with HMR. The server entry point is `server/index.ts`.

### Authentication System
- Local authentication with email/username and password
- Session-based authentication stored in PostgreSQL
- Password reset flow with email tokens
- Protected routes via `requireAuth` middleware
- Auth endpoints: `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/user`, `/auth/forgot-password`, `/auth/reset-password`

### Data Models
- **stories**: Editorial content with title, summary, content, cover image, category, optional audio URL, author info, and timestamps
- **users**: Authentication with email, username, password hash, profile info, and password reset tokens
- **sessions**: Express session storage for persistent logins

### API Structure
- RESTful endpoints defined in `shared/routes.ts` with Zod schemas for validation
- Stories CRUD: GET/POST/PUT/DELETE `/api/stories`
- Audio generation: POST `/api/stories/:id/audio` (uses OpenAI TTS)

### Build & Deployment
- Development: `npm run dev` runs tsx for the server with Vite middleware
- Production build: `npm run build` compiles client with Vite and bundles server with esbuild to CommonJS
- Database migrations: `npm run db:push` uses Drizzle Kit to push schema changes
- The app is designed to be platform-independent and deployable to services like Render

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Schema defined in `shared/schema.ts` and `shared/models/auth.ts`
- SSL enabled in production with `rejectUnauthorized: false`

### Cloud Services
- **Cloudinary**: Image upload and storage via `CLOUDINARY_URL` environment variable
- **OpenAI API**: Text-to-speech audio generation via `OpenAI_API_KEY` environment variable

### Email
- **Nodemailer**: Password reset emails via SMTP configuration
- Environment variables: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`

### Key Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `SESSION_SECRET`: Session encryption key (defaults to dev secret)
- `CLOUDINARY_URL`: Cloudinary credentials for image uploads
- `OpenAI_API_KEY`: OpenAI API key for audio generation
- `NODE_ENV`: Set to "production" for production builds