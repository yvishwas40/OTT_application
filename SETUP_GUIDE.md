# 🚀 OTT CMS - Complete Setup & Run Guide

## 📁 Project Structure

This is a **monorepo** (single repository with multiple packages). Here's what you're seeing:

```
OTT_app-main/
├── package.json                    # Root workspace configuration
├── docker-compose.yml              # Orchestrates all services
├── packages/
│   ├── api/                        # Backend API (NestJS)
│   │   ├── package.json           # API dependencies
│   │   ├── Dockerfile             # API container config
│   │   ├── prisma/                # Database schema & migrations
│   │   └── src/                   # API source code
│   ├── cms/                        # Frontend CMS (Next.js)
│   │   ├── package.json           # CMS dependencies
│   │   ├── Dockerfile             # CMS container config
│   │   └── app/                     # CMS source code
│   └── worker/                     # Background worker
│       ├── package.json           # Worker dependencies
│       ├── Dockerfile             # Worker container config
│       └── src/                   # Worker source code
└── node_modules/                   # Root dependencies (workspace)
```

**Why multiple package.json files?**
- Each package (`api`, `cms`, `worker`) has its own dependencies
- Root `package.json` manages the workspace and shared scripts
- This allows independent versioning and smaller Docker images

---

## ✅ Prerequisites

Before starting, ensure you have:

- **Node.js 18+** ([Download](https://nodejs.org/))
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop))
- **Git** (for cloning)
- **PowerShell** (Windows) or **Bash** (Mac/Linux)

---

## 🎯 Quick Start (Recommended - Docker)

The easiest way to run everything:

### Step 1: Install Root Dependencies

```powershell
# From project root
npm install
```

This installs:
- Root workspace dependencies
- All package dependencies (via workspaces)

### Step 2: Start Everything with Docker

```powershell
npm run docker:up
```

This command:
- Builds Docker images for API, CMS, and Worker
- Starts PostgreSQL database
- Runs all services in containers
- Sets up networking between services

**What's running:**
- 🗄️ PostgreSQL: `localhost:5432`
- 🔌 API: `http://localhost:3000`
- 🎨 CMS: `http://localhost:3001`
- ⚙️ Worker: Running in background

### Step 3: Initialize Database

Open a **new terminal** and run:

```powershell
# Run database migrations
npm run db:migrate

# Seed sample data
npm run db:seed
```

### Step 4: Access the Application

- **CMS Frontend**: http://localhost:3001
- **API Backend**: http://localhost:3000
- **API Docs (Swagger)**: http://localhost:3000/api/docs

**Login Credentials:**
- Admin: `admin@example.com` / `admin123`
- Editor: `editor@example.com` / `editor123`

---

## 🛠️ Manual Development Setup (Without Docker)

If you prefer running services directly (useful for debugging):

### Step 1: Install All Dependencies

```powershell
# From project root
npm install
```

This installs dependencies for all packages via npm workspaces.

### Step 2: Start PostgreSQL Database

**Option A: Using Docker (Recommended)**
```powershell
docker run -d --name ott-postgres `
  -e POSTGRES_DB=ott_cms `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=postgres `
  -p 5432:5432 `
  postgres:15-alpine
```

**Option B: Local PostgreSQL**
- Install PostgreSQL 15+
- Create database: `ott_cms`
- User: `postgres`, Password: `postgres`

### Step 3: Setup Environment Variables

**API Environment** (`packages/api/.env`):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ott_cms?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3000
CMS_URL="http://localhost:3001"
```

**CMS Environment** (`packages/cms/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Step 4: Generate Prisma Client

```powershell
# Navigate to API package
cd packages/api

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npx tsx prisma/seed.ts

# Go back to root
cd ../..
```

### Step 5: Generate Prisma Client for Worker

The worker also needs Prisma client. You have two options:

**Option A: Share API's Prisma Client (Recommended)**
```powershell
# Copy Prisma schema to worker
Copy-Item packages/api/prisma packages/worker/prisma -Recurse

# Generate client in worker
cd packages/worker
npx prisma generate
cd ../..
```

**Option B: Use API's generated client**
- Modify `packages/worker/src/index.ts` to import from `@ott-cms/api/node_modules/@prisma/client`
- Or use a shared Prisma client package

### Step 6: Start Services

Open **4 separate terminals**:

**Terminal 1 - API:**
```powershell
cd packages/api
npm run start:dev
```

**Terminal 2 - CMS:**
```powershell
cd packages/cms
npm run dev
```

**Terminal 3 - Worker:**
```powershell
cd packages/worker

# First time setup: Copy Prisma schema and generate client
Copy-Item ../api/prisma ./prisma -Recurse
npx prisma generate

# Start worker
npm run dev
```

**Terminal 4 - Database (if using Docker):**
```powershell
# Already running from Step 2
# Check status: docker ps
```

---

## 📋 Available Commands

### Root Level Commands

```powershell
# Development (runs all services)
npm run dev

# Individual services
npm run api:dev      # Start API only
npm run cms:dev      # Start CMS only
npm run worker:dev   # Start Worker only

# Database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed sample data

# Docker
npm run docker:up    # Start all services
npm run docker:down  # Stop all services

# Build
npm run build        # Build API + CMS
npm run api:build    # Build API only
npm run cms:build    # Build CMS only
```

### Package-Specific Commands

**API (`packages/api`):**
```powershell
npm run start:dev    # Development mode
npm run build        # Build for production
npm run start:prod   # Production mode
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio
```

**CMS (`packages/cms`):**
```powershell
npm run dev          # Development mode
npm run build        # Build for production
npm run start        # Production mode
```

**Worker (`packages/worker`):**
```powershell
npm run dev          # Development mode
npm run build        # Build TypeScript
npm start            # Run compiled code
```

---

## 🔧 Troubleshooting

### Issue: "Cannot find module '@prisma/client'"

**Solution:**
```powershell
cd packages/api
npx prisma generate
```

### Issue: "Prisma client did not initialize yet" (Worker)

**Solution:**
The worker needs its own Prisma client:
```powershell
# Copy schema to worker
Copy-Item packages/api/prisma packages/worker/prisma -Recurse

# Generate client
cd packages/worker
npx prisma generate
```

### Issue: "Port 3000/3001/5432 already in use"

**Solution:**
- Stop other services using those ports
- Or change ports in `docker-compose.yml` or `.env` files

### Issue: "PostCSS configuration error" (CMS)

**Solution:**
The `postcss.config.js` file should exist in `packages/cms/`. If missing:
```powershell
# Create it with:
# module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }
```

### Issue: Docker containers won't start

**Solution:**
```powershell
# Clean up and restart
docker-compose down -v
docker-compose up --build
```

### Issue: Database connection errors

**Solution:**
1. Check PostgreSQL is running: `docker ps`
2. Verify `DATABASE_URL` in `packages/api/.env`
3. Ensure database exists: `docker-compose exec postgres psql -U postgres -c "\l"`

---

## 🐳 Docker vs Manual: Which to Use?

### Use Docker When:
- ✅ You want everything running with one command
- ✅ You're setting up for the first time
- ✅ You want isolated environments
- ✅ You're deploying to production

### Use Manual Setup When:
- ✅ You need to debug specific services
- ✅ You want faster hot-reload
- ✅ You're developing new features
- ✅ You prefer running services natively

---

## 📦 Understanding the Monorepo

### Why This Structure?

1. **Shared Code**: All packages can share utilities
2. **Consistent Versions**: Manage dependencies centrally
3. **Atomic Commits**: Change API + CMS + Worker together
4. **Easier Testing**: Test entire system as one unit

### Package Dependencies

- **Root**: Workspace management, shared dev tools
- **API**: NestJS, Prisma, JWT, Swagger
- **CMS**: Next.js, React, TailwindCSS, Axios
- **Worker**: Prisma Client, node-cron

### Node Modules Locations

You'll see `node_modules` in:
- Root: Workspace dependencies
- `packages/api/node_modules`: API-specific packages
- `packages/cms/node_modules`: CMS-specific packages
- `packages/worker/node_modules`: Worker-specific packages

This is **normal** for monorepos!

---

## 🚀 Production Deployment

### Build for Production

```powershell
# Build all packages
npm run build

# Or individually
npm run api:build
npm run cms:build
```

### Environment Variables

Set these in your production environment:

**API:**
- `DATABASE_URL` - Production database
- `JWT_SECRET` - Strong secret key
- `PORT` - API port (default: 3000)
- `CMS_URL` - Frontend URL

**CMS:**
- `NEXT_PUBLIC_API_URL` - API URL

**Worker:**
- `DATABASE_URL` - Same as API

### Docker Production

```powershell
docker-compose -f docker-compose.prod.yml up --build
```

(You may need to create a production docker-compose file)

---

## 📚 Next Steps

1. **Explore the API**: Visit http://localhost:3000/api/docs
2. **Login to CMS**: http://localhost:3001
3. **Check Worker Logs**: `docker-compose logs -f worker`
4. **View Database**: `npx prisma studio` (in `packages/api`)

---

## ❓ Still Having Issues?

1. Check all services are running: `docker ps` or check terminal outputs
2. Verify ports aren't blocked: `netstat -ano | findstr :3000`
3. Check logs: `docker-compose logs` or terminal outputs
4. Ensure Node.js 18+: `node --version`
5. Clear caches: `npm cache clean --force` and reinstall

---

**Happy Coding! 🎉**
