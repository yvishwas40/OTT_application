# Local Development Setup Guide

## Prerequisites

Before starting, ensure you have the following installed:

- ✅ **Node.js 18+** - Check with `node --version`
- ✅ **npm** - Check with `npm --version`
- ✅ **Docker** (for PostgreSQL database) - Check with `docker --version`
- ✅ **Git** - Check with `git --version`

## Quick Start

### 1. Database Setup

The project uses PostgreSQL running in a Docker container. Start the database:

```powershell
# Start the PostgreSQL container
docker start 474f12b475b4

# Verify it's running
docker ps --filter "name=postgres"

# Test connection
docker exec 474f12b475b4 psql -U postgres -d ott_cms -c "SELECT version();"
```

**Database Credentials:**
- Host: `localhost`
- Port: `5432`
- Database: `ott_cms`
- User: `postgres`
- Password: `postgres`

### 2. Environment Configuration

Environment files are already configured:

**API (.env):**
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ott_cms?schema=public
JWT_SECRET=dev-secret
PORT=3000
CMS_URL=http://localhost:3001
```

**CMS (.env):**
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Install Dependencies

All dependencies are already installed. If you need to reinstall:

```powershell
# Root dependencies
npm install

# API dependencies
cd packages\api
npm install

# CMS dependencies
cd ..\cms
npm install

# Worker dependencies
cd ..\worker
npm install
```

### 4. Database Initialization

Generate Prisma clients and initialize the database:

```powershell
# In packages/api directory
cd packages\api

# Generate Prisma client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# Seed initial data (optional)
npx tsx prisma/seed.ts
```

### 5. Running the Services

You'll need **THREE separate terminal windows** to run all services.

#### Terminal 1: API Service

```powershell
cd packages\api
npm run start:dev
```

**Expected Output:**
```
[7:04:26 pm] Starting compilation in watch mode...
[7:04:29 pm] Found 0 errors. Watching for file changes.
🚀 API server running on http://localhost:3000
📖 API documentation available at http://localhost:3000/api/docs
```

**Access Points:**
- API: http://localhost:3000/api
- Swagger Docs: http://localhost:3000/api/docs

#### Terminal 2: CMS Frontend

```powershell
cd packages\cms
npm run dev
```

**Expected Output:**
```
▲ Next.js 14.0.4
- Local:        http://localhost:3001
✓ Ready in 2.5s
```

**Access Point:**
- CMS UI: http://localhost:3001

#### Terminal 3: Background Worker

```powershell
cd packages\worker
npm run dev
```

**Expected Output:**
```
🚀 Starting OTT CMS Worker...
⏱️  Publishing worker scheduled (runs every minute)
🔍 Monitoring for scheduled lessons...
```

## Troubleshooting

### Database Connection Issues

If you see "Can't reach database server at `localhost`":

1. Check if PostgreSQL container is running:
   ```powershell
   docker ps --filter "name=postgres"
   ```

2. If not running, start it:
   ```powershell
   docker start 474f12b475b4
   ```

3. If container doesn't exist, create it:
   ```powershell
   docker run -d --name ott-postgres `
     -e POSTGRES_DB=ott_cms `
     -e POSTGRES_USER=postgres `
     -e POSTGRES_PASSWORD=postgres `
     -p 5432:5432 `
     postgres:15-alpine
   ```

### Port Already in Use

If ports 3000 or 3001 are in use:

1. Find the process using the port:
   ```powershell
   netstat -ano | findstr :3000
   netstat -ano | findstr :3001
   ```

2. Kill the process (replace PID with the actual process ID):
   ```powershell
   taskkill /PID <PID> /F
   ```

### Prisma Client Not Generated

If you see "Cannot find module '@prisma/client'":

```powershell
# In packages/api
cd packages\api
npx prisma generate

# In packages/worker
cd ..\worker
npx prisma generate
```

### Module Not Found Errors

If you see module resolution errors:

```powershell
# Clean install all dependencies
cd packages\api
rm -r node_modules
npm install

cd ..\cms
rm -r node_modules
npm install

cd ..\worker
rm -r node_modules
npm install
```

### API Won't Start in Production Mode

Use development mode instead:

```powershell
cd packages\api
npm run start:dev
```

Development mode uses `nest start --watch` which handles TypeScript compilation automatically.

## Demo Credentials

Once all services are running, you can log in to the CMS:

- **Admin**: admin@example.com / admin123
- **Editor**: editor@example.com / editor123

## Testing the Setup

### 1. Check API Health

Visit http://localhost:3000/api/docs to see the Swagger documentation.

### 2. Test CMS Login

1. Go to http://localhost:3001
2. Login with admin credentials
3. You should see the CMS dashboard

### 3. Verify Worker

Check the worker terminal - you should see log messages every minute:

```
[2026-01-11T13:30:00.000Z] Running publishing worker...
```

## Development Workflow

### Creating Content

1. **Login to CMS** at http://localhost:3001
2. **Create a Program**:
   - Navigate to Programs
   - Click "Create Program"
   - Fill in details (title, description, language)
   - Upload poster assets

3. **Add Terms** (Seasons/Modules):
   - Open the program
   - Add terms with term numbers

4. **Create Lessons**:
   - Navigate to a term
   - Create lessons with content URLs
   - Upload thumbnail assets

5. **Publish Content**:
   - Publish immediately OR
   - Schedule for future publishing (worker will handle it)

### Monitoring Scheduled Publishing

The worker runs every minute and:
- Finds lessons scheduled for publishing
- Validates assets and content
- Updates status to PUBLISHED
- Auto-publishes parent programs when eligible

Check the worker terminal for real-time logs.

## Stopping Services

To stop all services:

1. Press `Ctrl+C` in each terminal window
2. Stop the database (optional):
   ```powershell
   docker stop 474f12b475b4
   ```

## Restarting Services

To restart after stopping:

1. Start database:
   ```powershell
   docker start 474f12b475b4
   ```

2. Start services in 3 terminals (see step 5 above)

## Additional Commands

### Database Management

```powershell
# Access database shell
docker exec -it 474f12b475b4 psql -U postgres -d ott_cms

# View all tables
\dt

# View specific table
SELECT * FROM users;

# Exit
\q
```

### Prisma Studio (Database GUI)

```powershell
cd packages\api
npx prisma studio
```

Opens a web interface at http://localhost:5555 to browse and edit database records.

### Build for Production

```powershell
# Build API
cd packages\api
npm run build

# Build CMS
cd ..\cms
npm run build

# Build Worker
cd ..\worker
npm run build
```

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CMS Frontend  │    │   Backend API   │    │ Background      │
│   (Next.js)     │◄──►│   (NestJS)      │◄──►│ Worker          │
│   Port: 3001    │    │   Port: 3000    │    │ (Node.js)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   PostgreSQL    │    │   Publishing    │
                       │   Database      │    │   Queue         │
                       │   Port: 5432    │    │   (Memory)      │
                       └─────────────────┘    └─────────────────┘
```

## Next Steps

- Review the [README.md](../../../README.md) for detailed feature documentation
- Check the API documentation at http://localhost:3000/api/docs
- Explore the database schema in `packages/api/prisma/schema.prisma`
- Review the worker logic in `packages/worker/src/publishing-worker.ts`

## Support

If you encounter issues not covered in this guide:

1. Check the terminal output for error messages
2. Verify all prerequisites are installed
3. Ensure the database is running
4. Try restarting the services
5. Check the Docker logs: `docker logs 474f12b475b4`
