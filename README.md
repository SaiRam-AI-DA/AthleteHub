# AthleteHub

AthleteHub is a comprehensive web platform for managing athletes, organizations, coaches, and sports events. It features a modern, responsive UI built with React/Vite, a scalable REST API powered by Java Spring Boot, and robust Role-Based Access Control (RBAC).

## Project Structure

```
Athlete-hub/
├── backend/            # Java Spring Boot Backend
│   ├── src/
│   │   ├── main/java/com/athletehub/api/  # Application logic (controllers, services, repositories, dto)
│   │   └── main/resources/                # Configuration settings (application.yml)
│   └── pom.xml         # Maven configuration
│
└── frontend/           # React/Vite Frontend
    ├── src/
    │   ├── api/        # Axios API client setup
    │   ├── components/ # Reusable UI components
    │   ├── contexts/   # React Contexts (e.g., AuthContext)
    │   ├── layouts/    # Layouts (e.g., DashboardLayout)
    │   └── pages/      # Route pages
    ├── index.html
    └── package.json
```

## Setup Instructions

### Prerequisites
- Java 21+
- Node.js 18+
- MySQL Server
- Maven

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Configure Database:**
   Update the database connection settings in `backend/src/main/resources/application.yml` if necessary (defaults to `jdbc:mysql://localhost:3306/athletehub`).

3. **Run Backend Server:**
   ```bash
   mvn compile spring-boot:run
   ```
   The backend runs by default at `http://localhost:8080`.

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run Frontend Server:**
   ```bash
   npm run dev
   ```
   The frontend runs by default at `http://localhost:5173`.

## API Overview

The backend uses a standard RESTful structure grouped by API version (e.g., `/api/v1`). 

### Authentication (`/api/auth`)
- `POST /register`: Register a new user
- `POST /login`: Authenticate and receive JWT tokens
- `GET /me`: Get current authenticated user profile
- `PUT /me`: Update user profile

### Athletes (`/api/v1/athletes`)
- `GET /`: List athletes (with pagination, search, filtering)
- `GET /<id>`: Get athlete details
- `POST /`: Create an athlete
- `PUT /<id>`: Update an athlete
- `DELETE /<id>`: Remove an athlete

### Organizations (`/api/v1/organizations`)
- `GET /`: List organizations
- `GET /<id>`: Get organization details
- `POST /`: Create an organization
- `PUT /<id>`: Update an organization
- `GET /<id>/athletes`: Get athletes in an organization

### Security
All protected endpoints require a valid JWT token sent in the `Authorization` header:
```
Authorization: Bearer <your_access_token>
```
Roles are enforced strictly using Spring Security `@PreAuthorize` annotations.

## Modules Implementation Status
- **Authentication & Security** - Completed
- **Reference Data (Sports & Org Types)** - Completed
- **Athlete Management** - Completed
- **Organization Management** - Completed
- **Dashboard Statistics** - Completed
- **Coach Management** - Completed
