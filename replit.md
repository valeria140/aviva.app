# AVIVA - Personal Fitness Companion

## Overview
AVIVA is a full-stack fitness application built with React, Express.js, and PostgreSQL. The application provides users with personal fitness tracking, diet management, workout routines, and progress monitoring through an intuitive mobile-first interface. The app features Replit Auth integration, dynamic theming, and a comprehensive fitness tracking system.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: React Query for server state, React Context for client state
- **Routing**: Wouter for lightweight client-side routing
- **Form Management**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with Neon Database (PostgreSQL)
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful endpoints with consistent error handling

### Database Architecture
- **Database**: PostgreSQL (configured for Neon Database)
- **ORM**: Drizzle ORM with type-safe queries
- **Schema Management**: Database migrations through Drizzle Kit
- **Session Storage**: PostgreSQL-based session store for authentication

## Key Components

### Authentication System
- **Provider**: Replit Auth with OIDC integration
- **Session Management**: Server-side sessions stored in PostgreSQL
- **Authorization**: Route-level authentication middleware
- **User Management**: Automatic user creation and profile management

### Data Models
- **Users**: Profile information, preferences, and settings
- **Survey Responses**: Onboarding questionnaire data
- **Workout Entries**: Exercise tracking with date, type, and duration
- **Diet Entries**: Daily nutrition logging
- **Routines**: Custom workout routines and schedules

### UI/UX Features
- **Responsive Design**: Mobile-first approach with desktop compatibility
- **Dynamic Theming**: Three color themes (Matcha, Sparkles, Coffee) with dark mode
- **Component Library**: Comprehensive UI components with consistent styling
- **Progressive Enhancement**: Graceful degradation for various device capabilities

## Data Flow

### Authentication Flow
1. User accesses application
2. Replit Auth redirects to OIDC provider
3. Authentication token validated and user session created
4. User profile fetched/created in database
5. Client receives user data and authentication status

### Data Synchronization
1. Client queries data through React Query
2. Express API routes handle CRUD operations
3. Drizzle ORM manages database interactions
4. Real-time updates through query invalidation
5. Optimistic updates for improved UX

### Theme Management
1. User preferences stored in database
2. Theme context provides global state
3. CSS variables updated dynamically
4. Local storage fallback for unauthenticated users

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **express**: Web application framework
- **passport**: authentication middleware

### UI Dependencies
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **react-hook-form**: Form state management

### Development Dependencies
- **tsx**: TypeScript execution for development
- **vite**: Build tool and development server
- **esbuild**: Production JavaScript bundling

## Deployment Strategy

### Development Environment
- **Runtime**: Replit with Node.js 20
- **Database**: Neon PostgreSQL database
- **Development Server**: Vite dev server with HMR
- **Build Process**: Vite frontend build + esbuild backend bundle

### Production Deployment
- **Platform**: Replit autoscale deployment
- **Build Command**: `npm run build` (builds both frontend and backend)
- **Start Command**: `npm run start` (serves production bundle)
- **Port Configuration**: Internal port 5000, external port 80

### Environment Configuration
- **Database**: Neon PostgreSQL with CONNECTION_STRING
- **Authentication**: Replit Auth with OIDC configuration
- **Sessions**: PostgreSQL-backed session storage
- **Static Assets**: Served through Express middleware

## Changelog
- June 27, 2025: Initial setup with complete fitness app implementation
- June 27, 2025: Added account creation flow and onboarding skip for returning users
- June 27, 2025: Enhanced calendar with improved visual feedback and interaction tooltips
- June 27, 2025: Implemented three-state workout tracking (unmarked → trained → rested)
- June 27, 2025: Ready for deployment to custom domain aviva.replit.app

## User Preferences
Preferred communication style: Simple, everyday language.