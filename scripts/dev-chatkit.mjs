import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import nextEnv from '@next/env';

const root = fileURLToPath(new URL('../', import.meta.url));
nextEnv.loadEnvConfig(root, true, { info() {}, error() {} });
const python = fileURLToPath(new URL('../backend/.venv/bin/python', import.meta.url));
if (!existsSync(python)) {
  console.error('Install backend dependencies first: cd backend && uv venv --python 3.12 .venv && uv pip sync --python .venv/bin/python requirements.lock');
  process.exit(1);
}
const webPort = process.env.CHATKIT_DEV_WEB_PORT || '4173';
const apiPort = process.env.CHATKIT_DEV_API_PORT || '8001';
mkdirSync(new URL('../backend/.local/', import.meta.url), { recursive: true });
const env = {
  ...process.env,
  CHATKIT_BACKEND_URL: `http://127.0.0.1:${apiPort}/`,
  CHATKIT_BACKEND_TOKEN: process.env.CHATKIT_BACKEND_TOKEN || randomBytes(32).toString('hex'),
  DATABASE_URL: process.env.DATABASE_URL || `sqlite:///${fileURLToPath(new URL('../backend/.local/chatkit.sqlite', import.meta.url))}`,
};
const backend = spawn(python, ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', apiPort], { cwd: `${root}backend/`, env, stdio: 'inherit' });
const frontend = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--webpack', '--hostname', '127.0.0.1', '--port', webPort], { cwd: root, env, stdio: 'inherit' });
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  backend.kill('SIGTERM');
  frontend.kill('SIGTERM');
  process.exitCode = code;
}
for (const child of [backend, frontend]) {
  child.on('error', () => stop(1));
  child.on('exit', (code) => stop(code || 0));
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
console.log(`Portfolio preview: http://127.0.0.1:${webPort}`);
