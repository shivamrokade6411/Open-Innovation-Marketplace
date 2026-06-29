# Monorepo Development Commands Cheat Sheet

This document contains a comprehensive reference of the commands available in the Open Innovation Marketplace monorepo.

## 🚀 Local Development

Start the entire stack (Frontend, Backend, MongoDB, Redis in parallel):
```bash
pnpm dev
```

Run specific packages in development mode:
```bash
pnpm --filter frontend dev       # Start Next.js frontend only (http://localhost:3000)
pnpm --filter backend dev        # Start Express.js backend only (http://localhost:5000)
```

Start backing infrastructure services only (MongoDB, Redis, Mongo Express) in the background via Docker:
```bash
docker-compose up mongodb redis mongo-express -d
```

Run in dev mode utilizing Turborepo pipeline dependencies:
```bash
pnpm turbo dev
```

---

## 🛠️ Code Quality and Linting

Run linters on all workspaces:
```bash
pnpm lint
```

Automatically fix linting issues:
```bash
pnpm lint:fix
```

Format code styling using Prettier:
```bash
pnpm format
```

Run TypeScript compiler type checks for all workspaces:
```bash
pnpm typecheck
```

---

## 🧪 Testing

Run all test suites across the monorepo:
```bash
pnpm test
```

Run backend test suite only:
```bash
pnpm --filter backend test
```

Run frontend test suite only:
```bash
pnpm --filter frontend test
```

Run tests with test coverage reporting:
```bash
pnpm test:coverage
```

---

## 🗄️ Database Utilities

Seed the database with sample development records (1 Admin, 2 Companies, 5 Innovators, 10 Challenges, and submissions):
```bash
pnpm --filter backend seed
```

Wipe all collections and re-seed clean development data:
```bash
pnpm --filter backend seed:reset
```

Build and apply all required indexes (including text search and compound query indexes) on MongoDB:
```bash
pnpm --filter backend create-indexes
```

---

## 🐳 Docker Deployment & Environment

Build Docker images from the root context:
```bash
docker-compose build
```

Run the complete dockerized stack (Next.js, Express, Mongo, Redis, Mongo Express):
```bash
docker-compose up -d
```

Tail live logs of a specific service:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

Stop the docker containers:
```bash
docker-compose down
```

Stop the docker containers and completely delete named volumes (wipes database state):
```bash
docker-compose down -v
```

---

## 📦 Production Builds & Deployment

Compile all packages for production:
```bash
pnpm build
```

Link and deploy the Next.js frontend application to Vercel:
```bash
vercel login
vercel link
vercel --prod
```

Build and push the backend Docker container:
```bash
docker build -t <username>/oim-backend -f apps/backend/Dockerfile .
docker push <username>/oim-backend
```
