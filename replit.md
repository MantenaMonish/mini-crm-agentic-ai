# Mini-CRM with AI Agent - Replit Guide

## Overview

This is a full-stack Mini-CRM application designed for Piazza Consulting Group, featuring AI agent interactions and workflow automation. The system is built with React frontend and Express backend, using modern web technologies for a responsive and interactive user experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS (via CDN) with shadcn/ui components
- **State Management**: React Context API for global state (CRM context)
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with custom styling
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **API Pattern**: RESTful API with CRUD operations
- **Data Storage**: In-memory storage with planned database migration
- **Schema Validation**: Zod for type-safe API validation

### Key Design Decisions
1. **Monorepo Structure**: Client, server, and shared code in one repository for easier development
2. **Type Safety**: Full TypeScript implementation across all layers
3. **Component-Based UI**: Modular React components for maintainability
4. **Real-time Interactions**: Mock AI chat functionality with pattern-based responses

## Key Components

### Frontend Components
- **CRM Dashboard**: Main application interface with lead management
- **Lead Management**: Table display with filtering and CRUD operations
- **Manual Lead Form**: Form-based lead creation
- **Document Upload**: OCR integration for PDF/PNG lead extraction using Tesseract.js and PDF.js
- **AI Interaction Modal**: Chat interface with mock AI responses
- **Workflow Designer**: React Flow-based visual workflow builder

### Backend Components
- **Lead API**: CRUD endpoints for lead management (`/api/leads`)
- **Workflow API**: Endpoints for workflow management (`/api/workflows`)
- **Storage Layer**: Abstracted storage interface with in-memory implementation
- **Validation Layer**: Zod schemas for request/response validation

### Shared Components
- **Database Schema**: Drizzle ORM schema definitions for users, leads, and workflows
- **Type Definitions**: Shared TypeScript types and validation schemas

## Data Flow

### Lead Management Flow
1. **Creation**: Manual form input or document OCR extraction
2. **Storage**: Validation through Zod schemas, storage in memory layer
3. **Display**: Real-time updates via React Query cache invalidation
4. **Updates**: Status changes and deletions with optimistic UI updates

### AI Interaction Flow
1. **Trigger**: User clicks "Interact" button on lead row
2. **Modal Display**: Context-aware chat interface opens
3. **Processing**: Simple pattern matching for responses:
   - "follow-up" → Email suggestion
   - "details" → Lead information display
   - Default → Help message

### Workflow Flow
1. **Design**: Visual workflow creation with React Flow
2. **Validation**: Node and edge validation (max 3 action nodes)
3. **Storage**: JSON serialization of workflow structure
4. **Execution**: Console logging of triggered actions

## External Dependencies

### Client-Side Libraries
- **OCR Processing**: Tesseract.js for image text extraction
- **PDF Processing**: PDF.js for PDF text extraction
- **UI Components**: Extensive Radix UI component library
- **Workflow Visualization**: React Flow for node-based interfaces
- **Form Handling**: React Hook Form with Hookform Resolvers

### Server-Side Libraries
- **Database**: Neon Database (PostgreSQL) with Drizzle ORM
- **Validation**: Zod for runtime type checking
- **Development**: TSX for TypeScript execution, Vite for bundling

### Development Tools
- **Build System**: ESBuild for server bundling, Vite for client
- **Type Checking**: TypeScript with strict configuration
- **Styling**: PostCSS with Tailwind CSS and Autoprefixer

## Deployment Strategy

### Development Setup
- **Frontend**: Vite dev server with hot reload
- **Backend**: TSX execution with automatic restart
- **Database**: Environment-based PostgreSQL connection
- **Assets**: Vite static asset handling

### Production Build
- **Frontend**: Vite production build to `dist/public`
- **Backend**: ESBuild bundle to `dist/index.js`
- **Environment**: Node.js production server
- **Database**: Production PostgreSQL via DATABASE_URL environment variable

### Key Configuration Files
- **Vite Config**: Frontend build configuration with path aliases
- **Drizzle Config**: Database migration and schema management
- **TypeScript Config**: Shared configuration for all modules
- **Tailwind Config**: UI theme and component styling

### Migration Path
The application currently uses in-memory storage but is structured for easy migration to PostgreSQL. The Drizzle schema and configuration are already in place, requiring only environment setup and data migration scripts to transition to persistent storage.