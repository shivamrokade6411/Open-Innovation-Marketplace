/*
 * Purpose: Custom local dev runner bypass to avoid Turbo Windows access violation crashes.
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

const backend = startProcess('Backend', 'pnpm', ['--filter', 'backend', 'dev']);
const frontend = startProcess('Frontend', 'pnpm', ['--filter', 'frontend', 'dev']);

const cleanup = () => {
  console.log('\n[System] Stopping development servers...');
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
