# Tana Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **PostgreSQL** 14.x or higher ([Download](https://www.postgresql.org/download/))
- **Redis** 7.x or higher ([Download](https://redis.io/download))
- **Git** ([Download](https://git-scm.com/downloads))
- **npm** or **yarn** (comes with Node.js)

## Quick Start (5 minutes)

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/tana-feature-flags.git
cd tana-feature-flags

# Start all services with Docker
docker-compose up -d

# Wait for services to be healthy (30 seconds)
docker-compose ps

# Run database migrations
docker-compose exec backend npm run migrate

# Access the application
# Dashboard: http://localhost:5173
# API: http://localhost:3000
```

### Option 2: Manual Setup

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/tana-feature-flags.git
cd tana-feature-flags

# 2. Install dependencies
cd backend && npm install
cd ../sdk && npm install
cd ../dashboard && npm install
cd ..

# 3. Setup PostgreSQL database
createdb tana_flags

# 4. Configure environment variables
cp backend/.env.example backend/.env
cp dashboard/.env.example dashboard/.env
# Edit .env files with your configurations

# 5. Run database migrations
cd backend
npm run migrate

# 6. Start Redis (separate terminal)
redis-server

# 7. Start backend API (separate terminal)
cd backend
npm run dev

# 8. Start dashboard (separate terminal)
cd dashboard
npm run dev
```

## Detailed Setup

### 1. Database Setup

#### Using PostgreSQL

```bash
# Create database
createdb tana_flags

# Connect to verify
psql tana_flags

# Run migrations
cd backend
npm run migrate

# Verify tables
psql tana_flags -c "\dt"
```

#### Using Docker

```bash
docker run --name tana-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=tana_flags \
  -p 5432:5432 \
  -d postgres:15-alpine
```

### 2. Redis Setup

#### Using Redis Server

```bash
# Start Redis
redis-server

# Verify connection
redis-cli ping
# Should return: PONG
```

#### Using Docker

```bash
docker run --name tana-redis \
  -p 6379:6379 \
  -d redis:7-alpine
```

### 3. Backend Configuration

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```bash
# Minimal required configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tana_flags
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret_key_min_32_characters_long
API_KEY_SECRET=your_api_key_secret_min_32_chars
```

### 4. Start Backend

```bash
cd backend
npm install
npm run dev
```

You should see:
```
🚀 Tana API Server running on http://localhost:3000
✅ Database connected
✅ Redis connected
```

### 5. Dashboard Configuration

```bash
cd dashboard
cp .env.example .env
```

Edit `dashboard/.env`:

```bash
VITE_API_URL=http://localhost:3000
```

### 6. Start Dashboard

```bash
cd dashboard
npm install
npm run dev
```

You should see:
```
  VITE ready in 500ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Verification

### 1. Check API Health

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-26T...",
  "database": "connected",
  "redis": "connected"
}
```

### 2. Access Dashboard

Open http://localhost:5173 in your browser.

You should see the Tana login page.

### 3. Create First Account

1. Click "Register"
2. Enter email and password
3. Click "Create Account"
4. You'll be redirected to the projects page

## Common Issues

### Port Already in Use

```bash
# Find process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Database Connection Failed

```bash
# Check if PostgreSQL is running
pg_isready

# Check connection string
psql postgresql://postgres:postgres@localhost:5432/tana_flags

# If using Docker
docker ps | grep postgres
docker logs tana-postgres
```

### Redis Connection Failed

```bash
# Check if Redis is running
redis-cli ping

# If using Docker
docker ps | grep redis
docker logs tana-redis
```

### Migration Errors

```bash
# Reset database (WARNING: deletes all data)
dropdb tana_flags
createdb tana_flags
cd backend
npm run migrate
```

### TypeScript Build Errors

```bash
# Clear and rebuild
cd backend  # or sdk or dashboard
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Development Workflow

### Running Tests

```bash
# Backend tests
cd backend
npm test

# SDK tests
cd sdk
npm test

# Watch mode
npm run test:watch
```

### Code Formatting

```bash
# Format all code
cd backend
npm run format

# Lint
npm run lint
```

### Database Migrations

```bash
# Create new migration
cd backend/migrations
touch 002_add_new_feature.sql

# Run migrations
npm run migrate
```

## Environment-Specific Setup

### Development

```bash
NODE_ENV=development npm run dev
```

### Production

```bash
# Build
cd backend
npm run build

cd dashboard
npm run build

# Start
NODE_ENV=production npm start
```

## Using the SDK

### Install SDK

```bash
npm install @tana/feature-flags-sdk
```

### Basic Usage

```typescript
import { TanaClient } from '@tana/feature-flags-sdk';

const tana = new TanaClient({
  apiKey: 'your_api_key',
  environment: 'production'
});

await tana.initialize();

// Check flag
if (tana.isEnabled('new-feature', userId)) {
  // New feature code
}
```

### Get API Key

1. Login to dashboard
2. Create a project
3. Create an environment
4. Copy API key from environment settings

## Troubleshooting Tips

### Enable Debug Logging

```bash
# Backend
LOG_LEVEL=debug npm run dev

# SDK
const tana = new TanaClient({
  apiKey: '...',
  debug: true
});
```

### Check Database Contents

```bash
psql tana_flags

-- List all tables
\dt

-- Check users
SELECT * FROM users;

-- Check projects
SELECT * FROM projects;

-- Check flags
SELECT * FROM feature_flags;
```

### Check Redis Cache

```bash
redis-cli

# List all keys
KEYS *

# Get flag cache
GET flags:project-id:env-id

# Clear cache
FLUSHDB
```

## Next Steps

1. ✅ Complete Day 1 documentation
2. ✅ Review PRD and technical decisions
3. ✅ Start Day 2: Architecture design
4. 🚀 Begin implementation!

## Getting Help

- 📖 [Documentation](./docs/README.md)
- 🐛 [Issues](https://github.com/yourusername/tana-feature-flags/issues)
- 💬 [Discussions](https://github.com/yourusername/tana-feature-flags/discussions)

## Resources

- [Feature Flags Best Practices](https://martinfowler.com/articles/feature-toggles.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)

---

**Ready to build Tana? Let's go! 🚀**
