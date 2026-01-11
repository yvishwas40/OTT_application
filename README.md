# OTT Content Management System

A production-grade Over-the-Top (OTT) Content Management System built with modern technologies, similar to internal CMS tools used by streaming platforms like Netflix and Hotstar.

## 🏗️ Architecture

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

## 🚀 Tech Stack

- **Backend**: Node.js + TypeScript + NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Frontend**: Next.js 14 + React + TypeScript
- **Authentication**: JWT-based RBAC
- **Worker**: Node-cron for scheduled publishing
- **Containerization**: Docker + Docker Compose
- **Styling**: TailwindCSS

## 📦 Domain Model

### Core Entities

- **Program**: Main content container (like a course or series)
- **Term**: Seasons or modules within a program
- **Lesson**: Individual content pieces (video/article)
- **Topic**: Content categorization
- **Assets**: Media files (posters, thumbnails, subtitles)
- **Users**: Admin, Editor, Viewer roles

### Key Features

- Multi-language content support
- Scheduled publishing with background workers
- Asset management with validation
- Role-based access control
- Public catalog API with caching
- Responsive CMS interface

## 🛠️ Local Development

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ott-cms-system
   ```

2. **Environment Setup**
   ```bash
   # Copy environment files
   cp packages/api/.env.example packages/api/.env
   cp packages/cms/.env.example packages/cms/.env
   ```

3. **Start with Docker**
   ```bash
   npm run docker:up
   ```

   This will start all services:
   - CMS Frontend: http://localhost:3001
   - API Backend: http://localhost:3000
   - API Docs: http://localhost:3000/api/docs
   - PostgreSQL: localhost:5432

4. **Initialize Database**
   ```bash
   # Run migrations
   npm run db:migrate
   
   # Seed sample data
   npm run db:seed
   ```

### Manual Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   cd packages/api && npm install && cd -
   cd packages/cms && npm install && cd -
   cd packages/worker && npm install && cd -
   ```

2. **Start Services Individually**
   ```bash
   # Terminal 1: Database
   docker run -d --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:15

   # Terminal 2: API
   cd packages/api
   npm run db:migrate
   npm run db:seed
   npm run start:dev

   # Terminal 3: CMS
   cd packages/cms
   npm run dev

   # Terminal 4: Worker
   cd packages/worker
   npm run dev
   ```

## 📚 Usage

### Demo Credentials

- **Admin**: admin@example.com / admin123
- **Editor**: editor@example.com / editor123

### Key Workflows

1. **Content Creation**
   - Create Program → Add Terms → Create Lessons
   - Upload required assets (posters, thumbnails)
   - Set multi-language content and subtitles

2. **Publishing**
   - Publish immediately or schedule for later
   - Background worker processes scheduled content
   - Automatic program publishing when lessons go live

3. **Content Management**
   - Role-based permissions (Admin, Editor, Viewer)
   - Asset validation before publishing
   - Multi-language support with primary language validation

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Content Management
- `GET /api/programs` - List programs
- `GET /api/lessons` - List lessons
- `POST /api/lessons/:id/publish` - Publish lesson immediately
- `POST /api/lessons/:id/schedule` - Schedule lesson publishing

### Public Catalog (No Auth Required)
- `GET /api/catalog/programs` - Published programs with pagination
- `GET /api/catalog/programs/:id` - Program details
- `GET /api/catalog/lessons/:id` - Lesson details

### Asset Management
- `POST /api/assets/programs` - Upload program assets
- `POST /api/assets/lessons` - Upload lesson assets

## 🔄 Background Worker

The publishing worker runs every minute and:

1. Finds lessons scheduled for publishing (`status = SCHEDULED`, `publish_at <= now()`)
2. Validates publishing requirements (assets, content URLs)
3. Updates lesson status to `PUBLISHED` in transaction-safe manner
4. Auto-publishes parent program if conditions are met
5. Handles concurrent execution safely

### Publishing Requirements

**Lesson Publishing**:
- Must have portrait + landscape thumbnails for primary content language
- Must have content URL for primary language

**Program Publishing**:
- Must have portrait + landscape posters for primary language
- Must have at least one published lesson

## 🐳 Docker Commands

```bash
# Start all services
npm run docker:up

# Stop all services
npm run docker:down

# View logs
docker-compose logs -f api
docker-compose logs -f cms
docker-compose logs -f worker

# Database access
docker-compose exec postgres psql -U postgres -d ott_cms
```

## 📊 Database Schema

Key tables with proper constraints and indexes:

- `programs` - Main content programs
- `terms` - Program sections/seasons
- `lessons` - Individual content pieces
- `program_assets` / `lesson_assets` - Media assets
- `program_topics` - Many-to-many program-topic relationships
- `users` - Authentication and RBAC

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Input validation with class-validator
- SQL injection protection via Prisma
- CORS configuration
- Rate limiting with @nestjs/throttler

## 🚀 Production Deployment

### Environment Variables

**API (`packages/api/.env`)**:
```env
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
JWT_SECRET="your-production-secret"
PORT=3000
CMS_URL="https://your-cms-domain.com"
```

**CMS (`packages/cms/.env`)**:
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

### Build Commands

```bash
# Build all packages
npm run build

# Build individually
npm run api:build
npm run cms:build
```

## 📝 Development Notes

- Database migrations are auto-generated and versioned
- All APIs include Swagger documentation
- TypeScript strict mode enabled
- Comprehensive error handling and logging
- Production-ready Docker configurations
- Optimized for concurrent access patterns

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.