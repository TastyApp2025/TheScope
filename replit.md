# The Scope - Editorial Platform

## Overview

The Scope is a news/editorial content management platform built as a full-stack TypeScript application. It features a React frontend with a mobile-first design for reading stories, and an Express backend with PostgreSQL for data persistence. The platform includes user authentication, story management with CRUD operations, Cloudinary integration for image storage, and OpenAI integration for text-to-speech audio generation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library (Radix UI primitives)
- **Build Tool**: Vite with path aliases (@/ for client/src, @shared/ for shared code)
- **Form Handling**: React Hook Form with Zod validation

The frontend follows a page-based structure under `client/src/pages/` with reusable UI components in `client/src/components/ui/`. Custom hooks in `client/src/hooks/` handle authentication state and responsive design.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Passport.js with local strategy (username/password)
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple
- **Password Security**: bcrypt for hashing

The backend serves both the API (`/api/*` routes) and the static frontend in production. In development, Vite's dev server handles the frontend with HMR.

### Authentication System
- Local authentication with email/username and password
- Session-based authentication stored in PostgreSQL
- Password hashing with bcrypt (10 salt rounds)
- Protected routes via `requireAuth` middleware
- Auth endpoints: `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/user`

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` and `shared/models/auth.ts`
- **Tables**: stories (content), users (auth), sessions (session storage)
- **Migrations**: Drizzle Kit with `db:push` command

### API Structure
- RESTful endpoints defined in `shared/routes.ts` with Zod schemas
- Stories CRUD: GET/POST/PUT/DELETE `/api/stories`
- Audio generation: POST `/api/stories/:id/audio`

### Build & Deployment
- Development: `npm run dev` (tsx for server, Vite for client)
- Production build: `npm run build` creates `dist/` with bundled server and static frontend
- Production start: `npm run start` serves from `dist/`
- The app is designed to be platform-independent (not Replit-specific)

## External Dependencies

### Database
- **PostgreSQL**: Required via `DATABASE_URL` environment variable
- Session table must exist (created by connect-pg-simple or manually)

### Cloud Services
- **Cloudinary**: Image upload and storage via `CLOUDINARY_URL` environment variable
- Images are uploaded to Cloudinary and URLs stored in database
- Handles base64 and URL-based uploads

### AI Services
- **OpenAI API**: Text-to-speech generation via `OPENAI_API_KEY` environment variable
- Uses TTS-1 model with "alloy" voice for audio narration

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption (defaults to dev secret)
- `CLOUDINARY_URL`: Cloudinary credentials (format: cloudinary://api_key:api_secret@cloud_name)
- `OPENAI_API_KEY`: OpenAI API key for audio generation