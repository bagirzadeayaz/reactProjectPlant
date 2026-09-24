import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cwd = fileURLToPath(new URL('..', import.meta.url));
const children = [
  spawn(process.execPath, ['--env-file=.env', 'backend/src/server.js'], { cwd, stdio: 'inherit' }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js'], { cwd, stdio: 'inherit' }),
];
let stopping = false;
const stop = (exitCode = 0) => {
  if (stopping) return;
  stopping = true;
  process.exitCode = exitCode;
  for (const child of children) if (child.exitCode === null) child.kill();
};
process.once('SIGINT', () => stop());
process.once('SIGTERM', () => stop());
for (const child of children) {
  child.once('error', (error) => {
    console.error('Development server failed to start:', error.message);
    stop(1);
  });
  child.once('exit', (code) => stop(code ?? 1));
}
