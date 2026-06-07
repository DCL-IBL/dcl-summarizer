# Architecture Overview

This document provides a high-level view of the application's architecture, detailing its components and how they interact.

## Components
- **Backend**: Node.js service handling API routes, database interactions, and background processing.
- **Frontend**: React-based dashboard served via Nginx for user interaction.
- **Dockerization**: Both services are containerized using Docker for consistent deployment.
- **Ollama Integration**: Utilizes Ollama for LLM inference within the document processing service.

## Directory Structure Summary
### Backend (`/backend`)
```
src/
├─ app.js               # Entry point of the application
├─ controllers/         # Business logic for handling requests
├─ models/              # Database schemas and models
├─ routes/              # API endpoints definition
├─ services/            # Utility services (e.g., documentProcessor.js, ollamaService.js)
└─ uploads/             # Directory for storing uploaded documents
.env                        # Environment variables configuration
``` 
### Frontend (`/frontend`)
```
src/
├─ dashboard.html       # Main dashboard page
├─ index.html           # Entry HTML file
├─ login.css            # Styles for login components
├─ main.js              # Primary JavaScript bundle
└─ script.js            # Additional scripts
public/dashboard/           # Static assets for the dashboard
logs/                       # Log files (access.log, error.log)
certs/                     # SSL certificates
nginx.conf                  # Nginx configuration file
``` 
## Data Flow
1. **User Interaction**: Users access the frontend via a web browser.
2. **API Requests**: Frontend sends requests to backend endpoints (`/api/*`).
3. **Processing**: Backend routes handle requests, invoking appropriate services (e.g., `documentProcessor.js` for uploading and embedding documents).
4. **Ollama Service**: For LLM tasks, the `ollamaService.js` communicates with Ollama via HTTP.
5. **Database**: Persistent storage of documents and queries using SQLite/PostgreSQL as configured in `.env`.
6. **Responses**: Processed data is sent back to the frontend for display.

## Technology Stack
- **Backend**: Node.js, Express, Ollama, SQLite/PostgreSQL (via `better-sqlite3` or Sequelize).
- **Frontend**: React, Tailwind CSS, EJS templating for server-side rendering.
- **Containerization**: Docker with `docker-compose.yml` defining services.
- **Deployment**: Automated via GitHub Actions or manual Docker builds.

## Development Workflow
1. Clone the repository.
2. Run `npm install` in both `/backend` and `/frontend` directories.
3. Configure `.env` with necessary environment variables (e.g., Ollama host, database URLs).
4. Start services locally using Docker (`docker-compose up --build`).
5. Access the application via `http://localhost:PORT`.

## Contribution Guidelines
- Fork the repository and create a new branch for your feature/bug fix.
- Ensure all tests (if any) pass and documentation is updated accordingly.
- Submit a pull request with a clear description of changes.