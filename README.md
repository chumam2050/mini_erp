# MiniERP System

A modern Enterprise Resource Planning system built with a Lerna monorepo architecture, featuring React + Vite frontend and Node.js + Express backend.

## Tech Stack

**Frontend:** React 18, Vite 5, Axios  
**Backend:** Node.js, Express, Sequelize ORM, PostgreSQL 15  
**Authentication:** JWT with bcrypt password hashing  
**API Documentation:** Swagger/OpenAPI 3.0  
**Testing:** Jest, Supertest (80%+ coverage)  
**Monorepo:** Lerna v8 with npm Workspaces

## Quick Start

### Prerequisites
- Node.js v18+
- npm v9+
- Docker & Docker Compose (for PostgreSQL)

### Installation

```bash
# Install all dependencies
npm install

# Start PostgreSQL database for local development
# (or use the docker-compose provided below for full deployment)
docker-compose up -d

# Seed database with default users
cd packages/backend
npm run seed

# Start both frontend and backend for local dev
cd /workspace
npm run dev
```

---

## Docker Deployment (backend + frontend) 🚀

You can run the full stack with Docker Compose. This will start a Postgres database, build and run the backend, and build and serve the frontend with nginx.

```bash
# From repository root
npm run compose:up

# Tear down and remove volumes
npm run compose:down
```

Notes:
- Backend environment is read from `packages/backend/.env` (DB credentials there will be overridden to use the `db` service hostname).
- Uploaded files are persisted to `packages/backend/uploads` on the host.
- Backend: http://localhost:5000 — API docs: http://localhost:5000/api-docs
- Frontend: http://localhost:3000

If you'd like, I can add a Makefile or a Root NPM script to run `seed` automatically after docker-compose up. Let me know which option you prefer.

**Frontend:** http://localhost:5173  
**Backend:** http://localhost:5000  
**API Docs:** http://localhost:5000/api-docs

## Default Credentials

After seeding, use these accounts to test:

| Email | Password | Role |
|-------|----------|------|
| ahmad.wijaya@minierp.com | password123 | Administrator |
| siti.nurhaliza@minierp.com | password123 | Manager |
| budi.santoso@minierp.com | password123 | Staff |

## Development Commands

```bash
# Run both frontend and backend
npm run dev

# Run frontend only
npm run dev:frontend

# Run backend only
npm run dev:backend

# Build frontend for production
npm run build

# Run tests
cd packages/backend
npm test

# Run tests with coverage
npm run test:coverage
```

## Key Features

- **JWT Authentication** - Secure token-based auth with role-based access control
- **PostgreSQL Database** - Relational data storage with Sequelize ORM
- **REST API** - 11 endpoints with full CRUD operations
- **Swagger Documentation** - Interactive API docs at `/api-docs`
- **Unit Tests** - 66 tests with 80%+ code coverage
- **Role-Based Access** - Administrator, Manager, and Staff roles
- **Password Security** - bcrypt hashing with salt rounds
- **Database Seeding** - Pre-configured default users

## API Endpoints

### Authentication (Public)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### User Profile (Protected)
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update profile
- `PUT /api/auth/change-password` - Change password

### User Management (Protected, Role-based)
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (Admin only)
- `PUT /api/users/:id` - Update user (Admin/Manager)
- `DELETE /api/users/:id` - Delete user (Admin only)

See [packages/backend/API.md](./packages/backend/API.md) for detailed API documentation.

## Testing

The backend includes comprehensive unit tests:

```bash
cd packages/backend

# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run in watch mode
npm run test:watch
```

**Test Coverage:** 80.33% statements, 73.25% branches, 87.5% functions, 81.03% lines

See [packages/backend/TESTING.md](./packages/backend/TESTING.md) for testing guide.

## Project Structure

```
minierp/
├── packages/
│   ├── frontend/              # React + Vite
│   │   ├── src/
│   │   ├── vite.config.js
│   │   └── package.json
│   └── backend/               # Express API
│       ├── src/
│       │   ├── config/        # Database, Swagger
│       │   ├── middleware/    # Auth, error handling
│       │   ├── models/        # Sequelize models
│       │   ├── routes/        # API routes
│       │   └── server.js
│       ├── __tests__/         # Jest test suites
│       └── package.json
├── lerna.json
└── package.json
```

## Configuration

### Environment Variables

Edit `packages/backend/.env`:

```env
PORT=5000
DATABASE_URL=postgres://user:password@db:5432/minierp
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

### Frontend Proxy

The frontend proxies API requests to the backend. See `packages/frontend/vite.config.js`:

```javascript
server: {
  proxy: {
    '/api': 'http://localhost:5000'
  }
}
```

## Documentation

- [QUICKSTART.md](./QUICKSTART.md) - Quick setup and testing guide
- [packages/backend/API.md](./packages/backend/API.md) - Complete API reference
- [packages/backend/SWAGGER.md](./packages/backend/SWAGGER.md) - Swagger documentation guide
- [packages/backend/TESTING.md](./packages/backend/TESTING.md) - Testing documentation
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Implementation details

## Troubleshooting

**Port already in use:**
- Change `PORT` in `packages/backend/.env`
- Change `server.port` in `packages/frontend/vite.config.js`

**Dependencies not installed:**
```bash
npx lerna clean -y
npm install
```

**Database connection error:**
```bash
docker-compose down
docker-compose up -d
```

## License

MIT
