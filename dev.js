/*
 * Purpose: Custom local dev runner bypass to avoid Turbo Windows access violation crashes,
 * and automatically manage local portable database and Redis services.
 * Author: Antigravity Pair Programmer
 * Date: 2026-06-30
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function killProcessByName(name) {
  try {
    const result = spawnSync('powershell', ['-NoProfile', '-Command', `Get-Process ${name} -ErrorAction SilentlyContinue | Stop-Process -Force`], {
      stdio: 'inherit'
    });
    return result.status === 0 || result.status === null;
  } catch (error) {
    console.warn(`[System] Unable to stop ${name}:`, error.message);
    return false;
  }
}

function safeDelete(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return;

  try {
    fs.rmSync(filePath, { force: true });
  } catch (error) {
    console.warn(`[System] Could not remove stale file ${filePath}:`, error.message);
  }
}

function startProcess(name, command, args) {
  console.log(`[System] Starting ${name}...`);
  const useShell = process.platform === 'win32' && (command === 'pnpm' || command.endsWith('.cmd') || command.endsWith('.bat'));
  const proc = spawn(command, args, {
    cwd: __dirname,
    shell: useShell,
    env: { ...process.env, FORCE_COLOR: 'true', NODE_OPTIONS: '--max-old-space-size=4096' }
  });

  proc.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach((line) => {
      if (line.trim()) {
        console.log(`[\x1b[36m${name}\x1b[0m] ${line.trim()}`);
      }
    });
  });

  proc.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach((line) => {
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

const mongoBin = path.join(__dirname, '.local-db', 'mongodb', 'mongodb-win32-x86_64-windows-7.0.6', 'bin', 'mongod.exe');
const mongoData = path.join(__dirname, '.local-db', 'mongodb-data');
const redisBin = path.join(__dirname, '.local-db', 'redis', 'redis-server.exe');
const postgresBin = 'C:\\Program Files\\PostgreSQL\\18\\bin\\postgres.exe';
const postgresData = path.join(__dirname, '.local-db', 'postgres-data');

killProcessByName('mongod');
killProcessByName('redis-server');

if (fs.existsSync(mongoData)) {
  safeDelete(path.join(mongoData, 'mongod.lock'));
  safeDelete(path.join(mongoData, 'WiredTiger.lock'));
}

const lockFile = path.join(postgresData, 'postmaster.pid');
safeDelete(lockFile);

if (!fs.existsSync(mongoData)) {
  fs.mkdirSync(mongoData, { recursive: true });
}

const mongodb = fs.existsSync(mongoBin)
  ? startProcess('MongoDB', mongoBin, ['--dbpath', mongoData, '--port', '27017', '--bind_ip', '127.0.0.1'])
  : null;

const redis = fs.existsSync(redisBin)
  ? startProcess('Redis', redisBin, ['--port', '6379', '--save', '', '--appendonly', 'no'])
  : null;

let postgres = null;
if (fs.existsSync(postgresBin) && fs.existsSync(postgresData)) {
  postgres = startProcess('PostgreSQL', postgresBin, ['-D', postgresData, '-p', '5433']);
} else {
  console.log('[System] PostgreSQL is not installed or configured locally; skipping PostgreSQL startup.');
}

let backend;
let frontend;

setTimeout(() => {
  backend = startProcess('Backend', 'pnpm', ['--dir', 'apps/backend', 'dev']);
  frontend = startProcess('Frontend', 'pnpm', ['--dir', 'apps/frontend', 'dev']);
}, 2000);

const cleanup = () => {
  console.log('\n[System] Stopping all servers and database services...');
  if (backend) backend.kill('SIGINT');
  if (frontend) frontend.kill('SIGINT');
  if (mongodb) mongodb.kill('SIGINT');
  if (redis) redis.kill('SIGINT');
  if (postgres) postgres.kill('SIGINT');

  setTimeout(() => {
    process.exit(0);
  }, 1000);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

