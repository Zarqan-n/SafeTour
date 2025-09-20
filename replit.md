# SafeTravel - Emergency & Places Finder

## Overview

SafeTravel is a web application that helps travelers stay safe by providing real-time disaster alerts and instant access to nearby essential services. The platform combines emergency information aggregation with location-based place discovery, allowing users to find hospitals, pharmacies, hotels, and restaurants in their vicinity during travel or emergency situations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with React and TypeScript, utilizing a component-based architecture with shadcn/ui for the design system. The application follows a single-page application (SPA) pattern with client-side routing using Wouter. Key architectural decisions include:

- **Component Structure**: Modular components organized by function (UI components, feature components, pages)
- **State Management**: React Query for server state management and React hooks for local state
- **Styling**: Tailwind CSS with CSS custom properties for theming, supporting both light and dark modes
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
The backend uses Express.js with TypeScript, implementing a RESTful API pattern. The server architecture includes:

- **Route Organization**: Centralized route registration with modular endpoint definitions
- **Middleware Stack**: Request logging, JSON parsing, and error handling middleware
- **Storage Abstraction**: Interface-based storage layer supporting both in-memory and database implementations
- **Development Setup**: Vite integration for seamless full-stack development

### Data Storage Solutions
The application uses a flexible storage architecture with two implementation strategies:

- **Development**: In-memory storage using Map-based data structures for rapid prototyping
- **Production**: PostgreSQL database with Drizzle ORM for type-safe database interactions
- **Schema Design**: Three main entities - disaster alerts, places, and search history with proper relationships and indexing

### Database Schema
- **Disaster Alerts**: Stores emergency information including title, severity, category, location, and source
- **Places**: Contains location data with Google Places integration including ratings, hours, and contact information
- **Searches**: Tracks user search patterns for analytics and caching purposes

### Authentication and Authorization
Currently implements a simplified authentication model focused on public data access. The architecture supports future implementation of user accounts and personalized features.

## External Dependencies

### Core Technologies
- **Neon Database**: Serverless PostgreSQL database for production data storage
- **Drizzle ORM**: Type-safe database toolkit for schema management and queries
- **Google Maps API**: Integrated mapping functionality and place data enrichment
- **Google Places API**: Location search and place details retrieval

### Third-Party Services
- **ReliefWeb API**: Disaster alert data aggregation (currently using sample data)
- **Google Geocoding API**: Address to coordinate conversion
- **Font APIs**: Google Fonts for typography (Inter, Architects Daughter, DM Sans, Fira Code, Geist Mono)

### UI and Styling
- **Radix UI Primitives**: Accessible component foundation for form controls, navigation, and overlays
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **shadcn/ui**: Pre-built component library with consistent design patterns
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Replit Plugins**: Development environment enhancements including error modals, cartographer, and dev banners
- **ESBuild**: Fast bundling for production server builds
- **TypeScript**: Type safety across the entire application stack

### Data Fetching and State Management
- **TanStack React Query**: Server state management with caching, background updates, and error handling
- **Axios**: HTTP client for API requests with interceptor support