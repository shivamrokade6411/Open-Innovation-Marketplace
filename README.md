# Open Innovation Marketplace

A production-oriented monorepo for a SaaS platform where companies post innovation challenges and innovators submit solutions, collaborate in real time, and earn rewards.

## Tech Stack

- Frontend: Next.js 14, TypeScript, Tailwind CSS, Redux Toolkit, TanStack Query, Framer Motion, Radix UI
- Backend: Node.js, Express.js, TypeScript, MongoDB, Mongoose, Socket.io, Redis, Bull, Cloudinary, OpenAI, Nodemailer, Razorpay, Stripe, Winston
- DevOps: Docker, Docker Compose, GitHub Actions, Vercel, Render, MongoDB Atlas

## Repository Layout

- `apps/frontend` - Next.js app
- `apps/backend` - Express API
- `packages/shared` - Shared TypeScript types and constants
- `.github/workflows` - CI and deployment workflows

## Prerequisites

- Node.js 20+
- pnpm
- Docker Desktop
- MongoDB Atlas account for production
- Cloudinary account for file uploads
- OpenAI API key for AI features
- Razorpay and Stripe keys for payments
- SMTP credentials for email delivery

## Local Setup

1. Copy `.env.example` to `.env` at the repo root.
2. Fill in the required environment variables.
3. Start MongoDB and Redis:

   ```bash
   docker-compose up -d mongodb redis
   ```

4. Install dependencies:

   ```bash
   pnpm install
   ```

5. Start the monorepo in development mode:

   ```bash
   pnpm dev
   ```

6. Open the apps:

   - Frontend: http://localhost:3000
   - Backend health: http://localhost:5000/api/health

## Environment Variables

See `.env.example` for the complete list of required variables.

## Deployment

### Frontend to Vercel

- Connect the GitHub repository to Vercel.
- Set the production environment variables in the Vercel project.
- Deploy with the Vercel CLI or via GitHub Actions.

### Backend to Render

- Build the backend Docker image.
- Push the image to Docker Hub.
- Trigger the Render deploy hook.

### Database to MongoDB Atlas

- Create a cluster in MongoDB Atlas.
- Add the Atlas connection string to `MONGODB_URI`.
- Create the required indexes before production traffic.

### CDN

- Configure Cloudinary and store its credentials in the environment.
- Use the Cloudinary free tier for development and early production.

### Monitoring

- Add Sentry to the frontend with the Next.js SDK.
- Add Sentry to the backend with the Express SDK.

## Useful Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm test
pnpm typecheck
```

## Notes

- The repo is configured as a pnpm monorepo with Turborepo.
- The backend and frontend include the initial scaffolding for auth, challenges, submissions, chat, notifications, AI, payments, and certificates.
- Review `SETUP_CHECKLIST.md` for an ordered zero-to-local-dev checklist.
