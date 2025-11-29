# TutorHub - Online Tutoring Platform

## Overview

TutorHub is a full-stack web application that connects students with tutors for personalized online learning sessions. The platform enables students to browse available tutors, book tutoring sessions, access learning materials, and manage their schedule. Administrators can manage tutors, students, sessions, and learning materials through a dedicated admin panel.

The application features role-based access control (student/admin), session scheduling, material management, and real-time authentication using Replit's OpenID Connect integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight alternative to React Router)
- TanStack Query (React Query) for server state management and API caching
- shadcn/ui component library with Radix UI primitives for accessible, customizable components
- Tailwind CSS for utility-first styling with custom design system

**Design System:**
- Typography: Inter (UI/body) and Poppins (headings) fonts loaded from Google Fonts
- Color scheme: Indigo-based primary color with neutral grays
- Component library based on shadcn/ui "new-york" style variant
- Design inspiration from Calendly (scheduling interface) and Khan Academy (educational dashboards)
- Responsive layout with mobile-first approach

**State Management:**
- Server state managed through TanStack Query with custom query client configuration
- Authentication state accessed via `useAuth` hook that queries `/api/auth/user`
- Query invalidation pattern for mutations to keep UI synchronized with server
- Form state managed with React Hook Form + Zod validation

**Routing Strategy:**
- Role-based route rendering: students see student dashboard routes, admins see admin panel routes
- Unauthenticated users are redirected to landing page
- All protected routes check authentication status and redirect to `/api/login` if needed
- Route protection handled in main `Router` component in `App.tsx`

### Backend Architecture

**Technology Stack:**
- Node.js with Express.js for HTTP server
- TypeScript throughout for type safety
- Drizzle ORM for database operations with PostgreSQL dialect
- Neon serverless PostgreSQL driver for database connectivity
- Express session management with PostgreSQL session store (connect-pg-simple)

**Server Configuration:**
- Dual entry points: `index-dev.ts` (development with Vite middleware) and `index-prod.ts` (production serving static assets)
- Development mode integrates Vite's HMR and transforms HTML on-the-fly
- Production mode serves pre-built static files from `dist/public`
- Raw body buffering enabled for webhook/payment integrations
- Request/response logging middleware for API routes

**API Architecture:**
- RESTful API design with `/api` prefix for all endpoints
- Route-based organization in `server/routes.ts`
- Middleware chain: authentication → authorization → route handler
- Consistent error handling with HTTP status codes
- JSON request/response format

**Authentication & Authorization:**
- Replit OpenID Connect (OIDC) integration via Passport.js
- Session-based authentication using encrypted cookies
- User claims stored in session (sub, email, profile data)
- Role-based access control with `isAuthenticated` and `isAdmin` middleware
- Auto-provisioning: users created on first login via `upsertUser`
- Session persistence in PostgreSQL `sessions` table (7-day TTL)

**Data Access Layer:**
- Repository pattern implemented via `DatabaseStorage` class in `server/storage.ts`
- Interface-based design (`IStorage`) for potential storage implementation swapping
- Drizzle ORM queries with type-safe schema imports
- Transaction support for complex operations
- Centralized database connection pool management

### Data Storage

**Database:**
- PostgreSQL (via Neon serverless driver)
- Connection pooling with WebSocket support for serverless environments
- Environment variable-based connection string (`DATABASE_URL`)
- Drizzle Kit for schema migrations (push-based workflow)

**Schema Design:**

Core tables:
- `users`: User profiles with role enum (student/admin), stores Replit OIDC claims
- `tutors`: Tutor profiles with name, email, specialization, bio, hourly rate, profile image
- `tutoring_sessions`: Session bookings with student/tutor relationships, scheduled date/time, duration, subject, status enum (scheduled/completed/cancelled/in_progress)
- `learning_materials`: Educational resources with title, description, subject, file URL, tutor relationship
- `lecture_videos`: Video content with title, description, subject, video URL (YouTube embed), thumbnail URL, duration, optional tutor association, uploaded by admin
- `feedback`: Student feedback with subject, message, rating (1-5 stars), status, admin response
- `sessions`: Express session storage for authentication (required by connect-pg-simple)

Enums:
- `user_role`: "student" | "admin"
- `session_status`: "scheduled" | "completed" | "cancelled" | "in_progress"
- `feedback_status`: "pending" | "reviewed" | "resolved"

Relationships:
- Tutoring sessions reference both users (students) and tutors
- Learning materials belong to tutors
- Lecture videos optionally reference tutors (as instructors) and always reference the admin who uploaded them
- All relationships use UUID foreign keys with cascade behavior

**Visual Theming:**
- Student interface: Indigo primary color (#4F46E5), emerald accents for video content
- Admin interface: Amber accent theme (#F59E0B) to distinguish from student portal
- Professor images: Stock images in attached_assets/stock_images/ with deterministic assignment via tutor ID hash

**Validation:**
- Drizzle-Zod integration for runtime schema validation
- Insert schemas generated from Drizzle table definitions
- React Hook Form resolver integration on frontend
- Backend validation before database operations

### External Dependencies

**Third-Party Services:**
- **Replit Authentication**: OpenID Connect provider for user authentication
  - Discovery URL: `https://replit.com/oidc` (or custom via `ISSUER_URL` env var)
  - Provides user identity, email, profile data
  - Required environment variables: `REPL_ID`, `SESSION_SECRET`

**Database:**
- **Neon Serverless PostgreSQL**: Managed PostgreSQL database with WebSocket support
  - Serverless-optimized for Replit deployment
  - Required environment variable: `DATABASE_URL`
  - WebSocket constructor override for Node.js compatibility

**UI Component Libraries:**
- **Radix UI**: Unstyled, accessible component primitives (28+ components installed)
- **shadcn/ui**: Pre-styled component patterns built on Radix UI
- **Lucide React**: Icon library for consistent iconography
- **React Day Picker**: Calendar component for date selection
- **date-fns**: Date formatting and manipulation utilities

**Build Tools:**
- **Vite**: Development server with HMR, production bundler
- **esbuild**: Server-side code bundling for production
- **TypeScript**: Type checking and compilation
- **Tailwind CSS**: PostCSS-based utility CSS generation
- **Replit Vite plugins**: Runtime error overlay, cartographer, dev banner (development only)

**Development Tools:**
- **tsx**: TypeScript execution for development server
- **Drizzle Kit**: Database schema management and migrations
- **nanoid**: Unique ID generation for cache busting

**Session Management:**
- **express-session**: Session middleware
- **connect-pg-simple**: PostgreSQL session store adapter

**Form & Validation:**
- **React Hook Form**: Form state management
- **Zod**: Runtime type validation
- **@hookform/resolvers**: Integration between React Hook Form and Zod