<!--
  Purpose: Ordered setup checklist for running and deploying the Open Innovation Marketplace monorepo.
  Author: Copilot
  Date: 2026-06-28
-->

# Setup Checklist

1. Install prerequisites: Node.js 20+, pnpm, Docker Desktop, and a MongoDB Atlas account.
2. Clone the repository and open `open-innovation-marketplace` in VS Code.
3. Copy `.env.example` to `.env` at the repository root and fill in all required secrets.
4. Fill `apps/backend/.env` and `apps/frontend/.env.local` with the matching runtime values.
5. Start supporting services with `docker-compose up -d mongodb redis`.
6. Install dependencies with `pnpm install` from the repository root.
7. Run the monorepo locally with `pnpm dev`.
8. Verify the frontend at `http://localhost:3000` and the backend health endpoint at `http://localhost:5000/api/health`.
9. Create required MongoDB Atlas indexes for users, companies, challenges, submissions, notifications, certificates, and payments before production traffic.
10. Configure Cloudinary with the free tier credentials and confirm upload folders are writable.
11. Configure Sentry for the frontend with the Next.js SDK and for the backend with the Express SDK.
12. Deploy the frontend to Vercel with `vercel --prod` and the production environment variables set in the Vercel project.
13. Build and publish the backend Docker image to Docker Hub, then trigger the Render deploy hook.
14. Confirm production CORS, cookies, and callback URLs point at the Vercel frontend and Render backend domains.
15. Run smoke tests for auth, challenge browsing, submission upload, realtime chat, notifications, and payments.
