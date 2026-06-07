# Setup & Development Environment

This document provides detailed instructions for setting up the development environment and running the project locally.

## Prerequisites
- **Node.js**: Version 14 or higher (`node -v`).
- **npm** or **yarn**: Package manager (`npm -v` or `yarn -v`).
- **Docker**: For containerized services (`docker --version`).
- **Ollama**: Ensure Ollama CLI is installed (`ollama --help`).

## Step-by-Step Setup
### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/your-project.git
cd your-project
```

### 2. Install Dependencies
Navigate to each service directory and install dependencies:
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 3. Configure Environment Variables
Create a copy of the example environment file in the backend directory:
```bash
cp .env.example .env
```
Edit `.env` to set variables such as `OLLAMA_HOST`, `DATABASE_URL`, etc., according to your setup.

### 4. Build and Run Docker Containers
From the project root, execute:
```bash
docker-compose up --build -d
```
This command builds the images defined in `docker-compose.yml` and starts them in detached mode.

### 5. Access the Application
- **Frontend Dashboard**: Open `http://localhost:8080` (or the port specified in `frontend/nginx.conf`).
- **Backend API**: Test endpoints using tools like Postman or curl, e.g., `curl http://localhost:5000/api/dashboard`.

## Development Server (Optional)
For hot-reloading during development, use:
```bash
# Backend
npm run dev   # Typically starts on port 3000

# Frontend
cd frontend && npm run serve
```
Ensure Docker containers are stopped or expose ports appropriately to avoid conflicts.

## Troubleshooting
- **Docker Issues**: Verify Docker is running and has sufficient resources.
- **Ollama Errors**: Check that Ollama service is reachable at the configured host/port.
- **Database Connection**: Confirm `.env` DATABASE_URL points to a valid SQLite file or PostgreSQL instance.
