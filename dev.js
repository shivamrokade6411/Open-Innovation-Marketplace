/*
 * Purpose: Custom local dev runner bypass to avoid Turbo Windows access violation crashes,
 * and automatically manage local portable database and Redis services.
 * Author: Antigravity Pair Programmer
 * Date: 2026-06-30
 */

const { spawn } = require('child_process');
const path = require('path');

function startProcess(name, command, args) {
  console.log(`[System] Starting ${name}...`);
  const proc = spawn(command, args, { 
    cwd: __dirname, 
    shell: true,
    env: { ...process.env, FORCE_COLOR: 'true', NODE_OPTIONS: '--max-old-space-size=4096' }
  });

  proc.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.log(`[\x1b[36m${name}\x1b[0m] ${line.trim()}`);
      }
    });
  });

  proc.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.error(`[\x1b[31m${name} Error\x1b[0m] ${line.trim()}`);
      }
    });
  });

  proc.on('close', (code) => {
    console.log(`[System] ${name} exited with code ${code}`);
  });

  return proc;
}

// Absolute paths to local database binaries
const mongoBin = path.join(__dirname, '.local-db', 'mongodb', 'mongodb-win32-x86_64-windows-7.0.6', 'bin', 'mongod.exe');
const mongoData = path.join(__dirname, '.local-db', 'mongodb-data');
const redisBin = path.join(__dirname, '.local-db', 'redis', 'redis-server.exe');
const postgresBin = 'C:\\Program Files\\PostgreSQL\\18\\bin\\postgres.exe';
const postgresData = path.join(__dirname, '.local-db', 'postgres-data');

// Double quotes for paths with spaces
const mongoCmd = `"${mongoBin}"`;
const redisCmd = `"${redisBin}"`;
const postgresCmd = `"${postgresBin}"`;

// Delete postmaster.pid lock file if exists
try {
  const fs = require('fs');
  const lockFile = path.join(postgresData, 'postmaster.pid');
  if (fs.existsSync(lockFile)) {
    fs.unlinkSync(lockFile);
  }
} catch (e) {}

const mongodb = startProcess('MongoDB', mongoCmd, ['--dbpath', `"${mongoData}"`, '--port', '27017']);
const redis = startProcess('Redis', redisCmd, ['--port', '6379']);
const postgres = startProcess('PostgreSQL', postgresCmd, ['-D', `"${postgresData}"`, '-p', '5433']);

let backend;
let frontend;

// Delay starting the frontend and backend slightly to allow MongoDB, Redis and Postgres to initialize
setTimeout(() => {
  backend = startProcess('Backend', 'pnpm', ['--filter', 'backend', 'dev']);
  frontend = startProcess('Frontend', 'pnpm', ['--filter', 'frontend', 'dev']);
}, 3000);

const cleanup = () => {
  console.log('\n[System] Stopping all servers and database services...');
  if (backend) backend.kill('SIGINT');
  if (frontend) frontend.kill('SIGINT');
  mongodb.kill('SIGINT');
  redis.kill('SIGINT');
  postgres.kill('SIGINT');
  
  setTimeout(() => {
    process.exit(0);
  }, 1000);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

