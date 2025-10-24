# Ishunea Backend API

## Overview
This is a REST API backend for the Ishunea website, built with Node.js, Express, and MongoDB. The API manages blogs, jobs, portfolio works, team members, services, and form submissions.

**Current Status:** Successfully configured for Replit environment and connected to MongoDB Atlas.

## Project Architecture

### Technology Stack
- **Runtime:** Node.js 20.x
- **Framework:** Express.js
- **Database:** MongoDB Atlas (cloud-hosted)
- **File Storage:** Cloudflare R2 (S3-compatible cloud object storage)
- **File Uploads:** Multer with memory storage + AWS SDK S3 client
- **CORS:** Enabled for cross-origin requests

### Project Structure
```
/
├── server.js           # Main application entry point
├── db.js              # MongoDB connection configuration
├── r2-storage.js      # Cloudflare R2 storage module (S3-compatible)
├── handleImage.js     # Image upload handling with Multer + R2
├── handleFiles.js     # File handling utilities
├── enpoints/          # API route handlers
│   ├── blogs.js       # Blog CRUD operations
│   ├── jobs.js        # Job listings endpoints
│   ├── works.js       # Portfolio works endpoints
│   ├── team.js        # Team members endpoints
│   ├── services.js    # Services endpoints
│   ├── forms.js       # Form submissions endpoints
│   └── translations.js # Multi-language translations API
└── schemas/           # Mongoose data models
    ├── blog.js
    ├── job.js
    ├── work.js
    ├── team.js
    ├── service.js
    ├── translation.js
    ├── form-alert.js
    ├── form-call.js
    └── form-job.js
```

## Configuration

### Environment Variables (Secrets)
- **MONGODB_URI** (Required): MongoDB Atlas connection string
  - Format: `mongodb+srv://username:password@cluster.mongodb.net/?options`
  - Configured in Replit Secrets
- **CLOUDFLARE_R2_ACCOUNT_ID** (Required): Cloudflare R2 account ID
- **CLOUDFLARE_R2_ACCESS_KEY_ID** (Required): R2 access key ID
- **CLOUDFLARE_R2_SECRET_ACCESS_KEY** (Required): R2 secret access key

### Server Configuration
- **Port:** 5000 (required for Replit)
- **Host:** 0.0.0.0 (binds to all interfaces for Replit)
- **CORS:** Enabled for all origins

## API Endpoints

### Blogs
- `GET /blogs` - Get all blogs
- `GET /blogs/:id` - Get single blog by ID
- `GET /blogs/tags` - Get unique blog tags/labels
- `GET /admin/blogs/list` - Get simplified blog list (admin)
- `GET /admin/edit/blogs/:id` - Get blog for editing (admin)
- `POST /blogs` - Create new blog (with file upload)
- `PUT /admin/edit/blogs/:id` - Update blog (with file upload)
- `DELETE /admin/blogs/:id` - Delete blog (admin)

### Jobs
- `GET /jobs` - Get all jobs
- `GET /jobs/:id` - Get single job by ID
- `POST /jobs` - Create new job
- `PUT /jobs/:id` - Update job

### Works (Portfolio)
- `GET /works` - Get all portfolio works
- `GET /works/:id` - Get single work by ID
- `GET /works/tags` - Get unique work tags
- `GET /admin/works/list` - Get simplified works list (admin)
- `GET /admin/edit/works/:id` - Get work for editing (admin)
- `POST /works` - Create new work (with file upload)
- `PUT /admin/edit/works/:id` - Update work (with file upload)
- `DELETE /admin/works/:id` - Delete work (admin)

### Team
- `GET /team` - Get all team members
- `GET /admin/team/list` - Get simplified team list (admin)
- `GET /admin/edit/team/:id` - Get team member for editing (admin)
- `POST /team` - Create new team member (with file upload)
- `PUT /admin/edit/team/:id` - Update team member (with file upload)
- `DELETE /admin/team/:id` - Delete team member (admin)

### Services
- `GET /services` - Get all services
- `GET /services/:id` - Get single service by ID
- `GET /services/other/:id` - Get all services except specified ID
- `GET /admin/services/list` - Get simplified services list (admin)
- `GET /admin/edit/services/:id` - Get service for editing (admin)
- `POST /services` - Create new service (with file upload)
- `PUT /admin/edit/services/:id` - Update service (with file upload)
- `DELETE /admin/services/:id` - Delete service (admin)

### Forms
- `POST /forms/alert` - Submit alert form
- `POST /forms/call` - Submit call request form
- `POST /forms/job` - Submit job application form

### Translations (Multi-language Support)
- `GET /api/translations?lang={lang}&category={optional}` - Get all translations for a language
  - Parameters: `lang` (required: en/ro/ru), `category` (optional: ui/seo/content/errors/validation)
- `GET /api/translations/:key?lang={lang}` - Get specific translation by key
  - Parameters: `key` (translation key), `lang` (required: en/ro/ru)
- `POST /api/translations` - Create/update translation (admin)
- `PUT /api/translations/:key?lang={lang}` - Update specific translation (admin)
- `DELETE /api/translations/:key?lang={lang}` - Delete translation (admin)

**Supported Languages:** EN (English), RO (Romanian), RU (Russian)
**Categories:** ui, seo, content, errors, validation
**Key Format:** Dot notation (e.g., `nav.home`, `home.hero.title`, `seo.services.title`)

## Recent Changes

### 2025-10-15: Initial Replit Setup & Translations API
- Configured server to run on port 5000 with host 0.0.0.0 for Replit environment
- Set up MongoDB Atlas connection using MONGODB_URI secret
- Configured IP whitelist in MongoDB Atlas to allow Replit connections (0.0.0.0/0)
- Created workflow "Backend Server" to run the application
- Configured deployment using autoscale (stateless API)
- Installed all Node.js dependencies
- **Added Translations API** for multi-language support (EN/RO/RU)
  - Created translation schema with indexed key+language compound uniqueness
  - Implemented GET endpoints for frontend cache integration
  - Supports filtering by language and category
  - Admin endpoints for managing translations (POST/PUT/DELETE)

### 2025-10-15: Cloudflare R2 Cloud Storage Integration
- Installed AWS SDK for S3 (`@aws-sdk/client-s3`) for R2 compatibility
- Created `r2-storage.js` module with R2 client configuration and upload functions
- Updated `handleImage.js` to use memory storage instead of disk storage
- Modified all endpoint files (blogs, services, team, works) to upload images to R2
- Images now stored in Cloudflare R2 bucket `ishunea-website` with public URLs
- File organization: `/{folder}/{uuid}.{extension}` (e.g., `/blogs/abc-123.jpg`)
- Removed local file system storage in favor of cloud storage

### 2025-10-15: Admin DELETE Endpoints
- Added DELETE routes for all admin-managed resources:
  - `DELETE /admin/blogs/:id` - Delete blog by ID
  - `DELETE /admin/services/:id` - Delete service by ID
  - `DELETE /admin/team/:id` - Delete team member by ID
  - `DELETE /admin/works/:id` - Delete work by ID
- All DELETE endpoints return appropriate status codes (200/404/500)
- Proper error handling and logging implemented for all DELETE operations

### 2025-10-15: R2 Public URL Configuration
- Configured R2 bucket `ishunea-website` with public access
- Updated `r2-storage.js` to use public R2.dev domain: `https://pub-5f717ff8ac2547518a948927d4095516.r2.dev`
- All uploaded images now accessible directly from frontend via public URLs
- URL format: `https://pub-5f717ff8ac2547518a948927d4095516.r2.dev/{folder}/{filename}`

## Development

### Running Locally
The server starts automatically via the "Backend Server" workflow. It runs:
```bash
node server.js
```

### MongoDB Connection
The database connection is established automatically on server startup. Connection details are logged to the console.

### File Uploads
Images are uploaded to Cloudflare R2 bucket (`ishunea-website`) using AWS S3-compatible API. Files are organized by folders (blogs, services, team, work) and each file gets a unique UUID-based filename. The system returns public R2 URLs that can be accessed directly.

## Deployment

**Deployment Type:** Autoscale (stateless)
**Command:** `node server.js`

The API is configured for autoscale deployment, suitable for stateless REST APIs. The deployment:
- Scales automatically based on traffic
- Only runs when receiving requests
- Is cost-effective for API services

### Before Deploying
Ensure all required secrets are properly configured in the deployment environment:
- MONGODB_URI
- CLOUDFLARE_R2_ACCOUNT_ID
- CLOUDFLARE_R2_ACCESS_KEY_ID
- CLOUDFLARE_R2_SECRET_ACCESS_KEY

## User Preferences
- Language: Romanian (user prefers communication in Romanian)

## Notes
- The database is currently empty (no blogs, jobs, services, etc.)
- Image uploads are stored in Cloudflare R2 cloud storage (`ishunea-website` bucket) with public access
- CORS is enabled for all origins (should be restricted in production)
- MongoDB Atlas IP whitelist is currently set to allow all IPs (0.0.0.0/0) - this should be restricted for production
- R2 public URLs format: `https://pub-5f717ff8ac2547518a948927d4095516.r2.dev/{folder}/{filename}`
- R2 bucket configured with public access for serving images directly to frontend
