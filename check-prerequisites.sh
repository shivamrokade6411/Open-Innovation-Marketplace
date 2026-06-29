#!/usr/bin/env bash

# Setup colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "========================================="
echo "        PREREQUISITES CHECK"
echo "========================================="

# Helper functions
print_success() {
  echo -e "✅ $1"
}

print_failure() {
  echo -e "❌ $1"
  if [ ! -z "$2" ]; then
    echo -e "   👉 Instruction: $2"
  fi
}

# 1. Check Node.js
if command -v node >/dev/null 2>&1; then
  NODE_VER=$(node -v | cut -d'v' -f2)
  NODE_MAJOR=$(echo "$NODE_VER" | cut -d'.' -f1)
  if [ "$NODE_MAJOR" -ge 20 ]; then
    print_success "Node.js >= 20.x is installed (Detected: v$NODE_VER)"
  else
    print_failure "Node.js version is too low (Detected: v$NODE_VER)" "Install Node.js 20.x or higher from https://nodejs.org/"
  fi
else
  print_failure "Node.js is not installed" "Install Node.js 20.x or higher from https://nodejs.org/"
fi

# 2. Check pnpm
if command -v pnpm >/dev/null 2>&1; then
  PNPM_VER=$(pnpm -v)
  PNPM_MAJOR=$(echo "$PNPM_VER" | cut -d'.' -f1)
  if [ "$PNPM_MAJOR" -ge 8 ]; then
    print_success "pnpm >= 8.x is installed (Detected: v$PNPM_VER)"
  else
    print_failure "pnpm version is too low (Detected: v$PNPM_VER). Upgrading..."
    npm install -g pnpm@latest
  fi
else
  echo "pnpm is missing. Attempting to install via npm..."
  if command -v npm >/dev/null 2>&1; then
    npm install -g pnpm@latest
    if command -v pnpm >/dev/null 2>&1; then
      print_success "pnpm successfully installed"
    else
      print_failure "pnpm installation failed" "Run 'npm install -g pnpm' manually."
    fi
  else
    print_failure "pnpm is not installed and npm is missing" "Install Node.js first, then run 'npm install -g pnpm'."
  fi
fi

# 3. Check Git
if command -v git >/dev/null 2>&1; then
  GIT_VER=$(git --version | awk '{print $3}')
  print_success "Git is installed (Detected: $GIT_VER)"
else
  print_failure "Git is not installed" "Install Git from https://git-scm.com/"
fi

# 4. Check Docker & Docker Compose
DOCKER_OK=true
if command -v docker >/dev/null 2>&1; then
  if docker info >/dev/null 2>&1; then
    print_success "Docker is installed and running"
  else
    print_failure "Docker is installed but the daemon is not running" "Start Docker Desktop or start the docker system service."
    DOCKER_OK=false
  fi
else
  print_failure "Docker is not installed" "Install Docker Desktop from https://www.docker.com/"
  DOCKER_OK=false
fi

if command -v docker-compose >/dev/null 2>&1; then
  print_success "Docker Compose is installed"
elif docker compose version >/dev/null 2>&1; then
  print_success "Docker Compose (v2 plugin) is installed"
else
  print_failure "Docker Compose is not installed" "Install Docker Compose plugin or standalone binary."
fi

# 5. Check MongoDB Connection
# Load environment variables if .env file exists
if [ -f .env ]; then
  # Extract MONGODB_URI line, remove CR characters and comments
  MONGO_URI=$(grep -E "^MONGODB_URI=" .env | cut -d'=' -f2- | tr -d '\r')
fi

if [ -z "$MONGO_URI" ]; then
  MONGO_URI="mongodb://localhost:27017/oim"
fi

echo "Checking MongoDB connection to $MONGO_URI ..."

# Run inline node script to test connection
NODE_TEST_CODE="
const net = require('net');
const url = require('url');
const parseUri = (uri) => {
  try {
    // Basic parser for mongodb connection strings
    const match = uri.match(/^mongodb(?:\+srv)?:\/\/([^/]+)/);
    if (!match) return null;
    const hostsStr = match[1].split('@').pop(); // remove username/password
    const hostPort = hostsStr.split(',')[0]; // take first host in replica set
    const parts = hostPort.split(':');
    return { host: parts[0], port: parseInt(parts[1] || '27017', 10) };
  } catch (e) {
    return null;
  }
};
const config = parseUri('$MONGO_URI');
if (!config) {
  console.log('FAILED to parse URI');
  process.exit(1);
}
const socket = new net.Socket();
socket.setTimeout(2000);
socket.on('connect', () => {
  socket.destroy();
  process.exit(0);
}).on('timeout', () => {
  socket.destroy();
  process.exit(1);
}).on('error', (err) => {
  socket.destroy();
  process.exit(1);
}).connect(config.port, config.host);
"

if node -e "$NODE_TEST_CODE" >/dev/null 2>&1; then
  print_success "MongoDB connection available"
else
  print_failure "MongoDB connection failed" "Ensure MongoDB is running locally (run 'docker-compose up mongodb -d') or verify your Atlas MONGODB_URI in .env"
fi

echo "========================================="
