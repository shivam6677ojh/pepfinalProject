# Team Project Management (MERN)

Team project management app with authentication, projects, and tasks.

## Project Structure

team-project-management/

- frontend/
- backend/
- k8s/
- .github/workflows/
- README.md

## Tech Stack

- Frontend: React + Vite + React Router + Axios
- Backend: Node.js + Express + MongoDB + JWT

## Backend Setup

1. Go to backend folder:

	`cd backend`

2. Install dependencies:

	`npm install`

3. Create or update `.env`:

	MONGO_URI=your_mongodb_connection
	JWT_SECRET=your_secret
	PORT=5000

4. Start server:

	`npm run dev`

Backend base URL: `http://localhost:5000/api`

## Frontend Setup

1. Go to frontend folder:

	`cd frontend`

2. Install dependencies:

	`npm install`

3. Start frontend:

	`npm run dev`

Frontend URL: `http://localhost:5173`

## API Endpoints

### Auth

- POST `/api/auth/register`
- POST `/api/auth/login`

### Projects (JWT protected)

- POST `/api/projects`
- GET `/api/projects`
- PUT `/api/projects/:id`
- DELETE `/api/projects/:id`

### Tasks (JWT protected)

- POST `/api/tasks`
- GET `/api/tasks`
- PATCH `/api/tasks/:id/status`
- PATCH `/api/tasks/:id/assign`
- DELETE `/api/tasks/:id`

## Frontend Pages

- Login Page
- Register Page
- Dashboard
- Projects Page
- Tasks Page
- Navbar

## Features Implemented

- JWT authentication (register/login)
- Protected routes
- Token persistence in local storage
- Project CRUD
- Task create, delete, assign, and status updates
- API loading and error handling states
