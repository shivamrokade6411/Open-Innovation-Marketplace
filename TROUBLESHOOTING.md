# Troubleshooting Guide

This guide covers common errors encountered during local development or production deployment, along with their solutions.

---

## 🔌 1. Cannot Connect to MongoDB

### Error Symptoms
- Backend console prints: `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`
- API calls fail with timeouts or database connection errors.

### Solutions
- **Check MONGODB_URI**: Verify that `MONGODB_URI` in `.env` (and `apps/backend/.env`) matches your MongoDB connection path.
- **Check Local Docker Container**: Ensure your local MongoDB container is up and healthy:
  ```bash
  docker ps | grep oim-mongodb
  ```
  If it's not running, start it:
  ```bash
  docker-compose up mongodb -d
  ```
- **IP Whitelisting**: If using MongoDB Atlas, make sure your local IP address is added to the Network Access IP whitelist in the Atlas dashboard.

---

## 🔑 2. Authentication Secret Missing

### Error Symptoms
- Node error: `JWT_ACCESS_SECRET is not defined`
- Login or token generation fails immediately.

### Solutions
- Ensure you have copied `.env.example` to both target env files:
  ```bash
  cp .env.example apps/backend/.env
  cp .env.example apps/frontend/.env.local
  ```
- Generate secure secrets using OpenSSL or Node.js crypto and assign them to `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`:
  ```bash
  openssl rand -base64 64
  ```
- Run the configuration script to automate this setup:
  ```bash
  bash setup-env.sh
  ```

---

## 🚫 3. Address Already in Use (EADDRINUSE)

### Error Symptoms
- Process crashes with: `Error: listen EADDRINUSE: address already in use :::3000` or `:::5000`

### Solutions
- Identify and terminate the blocking process running on that port:
  - **Linux / macOS**:
    ```bash
    lsof -ti:3000 | xargs kill -9
    lsof -ti:5000 | xargs kill -9
    ```
  - **Windows (PowerShell)**:
    ```powershell
    Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
    Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force
    ```
- Alternatively, modify the `PORT` or `FRONTEND_URL` in your `.env` config files.

---

## 📦 4. pnpm Workspace Resolve Failures

### Error Symptoms
- Errors compiling typescript: `Cannot find module '@oim/shared' or its corresponding type declarations`
- Installation errors: `Workspace package not found`

### Solutions
- Always run installation commands from the **root directory** of the monorepo rather than inside `apps/` folders:
  ```bash
  cd e:/Open-Innovation-Marketplace
  pnpm install
  ```
- Verify `pnpm-workspace.yaml` exists at the root with standard package paths:
  ```yaml
  packages:
    - "apps/*"
    - "packages/*"
  ```
- Make sure to compile the shared package first:
  ```bash
  pnpm --filter @oim/shared build
  ```

---

## 🎨 5. Tailwind CSS Styles Not Updating

### Error Symptoms
- UI elements appear plain, default style, or new utility classes do not apply.

### Solutions
- Verify that your styling file path is included in the `content` array of `tailwind.config.ts`:
  ```typescript
  content: ['./src/**/*.{ts,tsx}'],
  ```
- In Next.js, restart the local development server since Tailwind CSS configuration edits require a server reload to rebuild the CSS bundle:
  ```bash
  pnpm --filter frontend dev
  ```

---

## 🌐 6. Socket.io CORS Blocked

### Error Symptoms
- Browser console prints: `Access to XMLHttpRequest at '...' from origin '...' has been blocked by CORS policy`
- Chat messages do not send or notifications fail to arrive in real-time.

### Solutions
- Ensure the `FRONTEND_URL` in `apps/backend/.env` matches the client URL (e.g. `http://localhost:3000`) exactly without trailing slashes.
- Check the backend Socket.io configuration to verify it allows credentials:
  ```typescript
  cors: { origin: process.env.FRONTEND_URL, credentials: true }
  ```
- Clear local browser storage / cookies and retry connecting.
