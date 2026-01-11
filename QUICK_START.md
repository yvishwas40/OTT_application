# 🚀 Quick Start Guide

## Start All Services (3 Terminals Required)

### Terminal 1: API Service
```powershell
cd "c:\Users\yvish\projects\OTT platform\OTT_app-main"
.\start-api.ps1
```
**Access:** http://localhost:3000/api/docs

### Terminal 2: CMS Frontend
```powershell
cd "c:\Users\yvish\projects\OTT platform\OTT_app-main"
.\start-cms.ps1
```
**Access:** http://localhost:3001

### Terminal 3: Background Worker
```powershell
cd "c:\Users\yvish\projects\OTT platform\OTT_app-main"
.\start-worker.ps1
```

## Demo Login Credentials

- **Admin:** admin@example.com / admin123
- **Editor:** editor@example.com / editor123

## Common Commands

### Database
```powershell
# Start database
docker start 474f12b475b4

# Check database status
docker ps --filter "name=postgres"

# Access database shell
docker exec -it 474f12b475b4 psql -U postgres -d ott_cms
```

### Prisma
```powershell
cd packages\api

# Generate client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed data
npx tsx prisma/seed.ts

# Open Prisma Studio
npx prisma studio
```

### Troubleshooting

**Port in use:**
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Database not running:**
```powershell
docker start 474f12b475b4
```

**Module errors:**
```powershell
cd packages\api
npx prisma generate
```

## 📚 Full Documentation

- [LOCAL_SETUP.md](LOCAL_SETUP.md) - Complete setup guide
- [README.md](README.md) - Project overview
- [Walkthrough](C:\Users\yvish\.gemini\antigravity\brain\861a0b80-60e8-4747-a3d3-c4302d71a86d\walkthrough.md) - Setup walkthrough

## ⚡ Manual Start (Without Scripts)

**Terminal 1:**
```powershell
docker start 474f12b475b4
cd "c:\Users\yvish\projects\OTT platform\OTT_app-main\packages\api"
npm run start:dev
```

**Terminal 2:**
```powershell
cd "c:\Users\yvish\projects\OTT platform\OTT_app-main\packages\cms"
npm run dev
```

**Terminal 3:**
```powershell
cd "c:\Users\yvish\projects\OTT platform\OTT_app-main\packages\worker"
npm run dev
```

## 🎯 What Each Service Does

- **API (Port 3000):** Backend REST API with authentication, content management, and publishing
- **CMS (Port 3001):** Web interface for managing programs, lessons, and assets
- **Worker:** Background process that publishes scheduled content every minute
- **Database (Port 5432):** PostgreSQL database storing all content and user data

## ✅ Success Indicators

**API Started:**
```
🚀 API server running on http://localhost:3000
📖 API documentation available at http://localhost:3000/api/docs
```

**CMS Started:**
```
▲ Next.js 14.0.4
- Local:        http://localhost:3001
✓ Ready in 2.5s
```

**Worker Started:**
```
🚀 Starting OTT CMS Worker...
⏱️  Publishing worker scheduled (runs every minute)
🔍 Monitoring for scheduled lessons...
```
