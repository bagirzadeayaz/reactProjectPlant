import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadConfig } from '../src/config.js';

const env = {
  FIREBASE_PROJECT_ID: 'test-project',
  ADMIN_EMAILS: ' Admin@example.test, second@example.test ',
};
test('configuration normalizes the allowlist without reading process.env', () => {
  const config = loadConfig(env);
  assert.deepEqual([...config.adminEmails], ['admin@example.test', 'second@example.test']);
  assert.equal(config.databaseId, '(default)');
  assert.equal(config.port, 3001);
});
test('invalid configuration fails at startup', () => {
  for (const patch of [
    { PORT: 'abc' },
    { PORT: '0' },
    { PORT: '65536' },
    { ADMIN_EMAILS: ',' },
    { FIREBASE_PROJECT_ID: '' },
    { FRONTEND_ORIGIN: 'https://example.test/path' },
  ]) {
    assert.throws(() => loadConfig({ ...env, ...patch }));
  }
});
