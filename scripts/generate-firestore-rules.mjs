import { readFile, writeFile } from 'node:fs/promises';
import { loadConfig } from '../backend/src/config.js';

const config = loadConfig(process.env);

const template = await readFile(
  new URL('../backend/firestore.rules.template', import.meta.url),
  'utf8',
);
const marker = '__ADMIN_EMAILS__';
if (!template.includes(marker) || config.adminEmails.size === 0) {
  throw new Error('Firestore rules template or ADMIN_EMAILS is invalid');
}

const rules = template.replace(marker, JSON.stringify([...config.adminEmails]));
await writeFile(new URL('../backend/firestore.rules', import.meta.url), rules);
console.log('Generated backend/firestore.rules from ADMIN_EMAILS in .env');
