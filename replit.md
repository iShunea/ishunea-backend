# Overview

This is a Node.js/Express backend API server that provides content management endpoints for a portfolio or corporate website. The application serves multiple content types including blogs, jobs, works (portfolio items), team members, services, and form submissions. It uses MongoDB as its database and serves static image files from a local directory.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Backend Framework
- **Technology**: Express.js (Node.js)
- **Rationale**: Lightweight, flexible, and well-suited for building RESTful APIs with minimal overhead
- **Key Features**:
  - Modular route structure with separate endpoint files for each resource type
  - CORS enabled for cross-origin requests (supports frontend hosted on different domains)
  - JSON body parsing middleware for handling API requests

## Database
- **Technology**: MongoDB (NoSQL database)
- **Connection Management**: Centralized connection handler via `db.js` module
- **Rationale**: Document-based storage is ideal for content management systems where schema flexibility is valuable
- **Connection Pattern**: Single connection established at application startup

## Static File Serving
- **Approach**: Express static middleware for the `/images` directory
- **Purpose**: Serves uploaded or stored images directly from the filesystem
- **Rationale**: Simple file serving without need for separate CDN or storage service during development

## API Structure
- **Pattern**: RESTful endpoints organized by resource type
- **Modularity**: Each resource (blogs, jobs, works, team, services, forms) has its own route file in the `enpoints/` directory
- **Routing**: All routes mounted at root level (`/`), with specific paths defined within each module

## Configuration Management
- **Technology**: dotenv package
- **Rationale**: Separates environment-specific configuration from code
- **Key Variables**: 
  - `SERVER_PORT`: Configurable server port (defaults to 5000)
  - Database connection strings and credentials (assumed in `db.js`)

## Server Configuration
- **Host Binding**: `0.0.0.0` (all network interfaces)
- **Rationale**: Allows external access, necessary for cloud deployment environments and containerization

# External Dependencies

## NPM Packages
- **express**: Web application framework
- **cors**: Cross-Origin Resource Sharing middleware
- **dotenv**: Environment variable management
- **mongodb driver** (implied): Database connectivity

## Database Service
- **MongoDB**: Primary data store
- **Connection**: Configured through environment variables
- **Purpose**: Stores all content (blogs, jobs, works, team, services, form submissions)

## File System
- **Local Storage**: Images stored in `/images` directory
- **Access Pattern**: Direct file serving through Express static middleware