#!/usr/bin/env node
/**
 * Fails when the translation bundles have drifted apart.
 *
 * Types already stop a typo in `t('...')`, but they cannot see a Russian key
 * that was never written — i18next silently falls back to English and the UI
 * looks fine to whoever is testing in English. This is the check that catches
 * that, so it runs in CI.
 *
 * Plurals are compared by base key, because the two languages legitimately need
 * different forms: English has `one`/`other`, Russian has `one`/`few`/`many`/
 * `other`. Each language is then checked against its own Intl.PluralRules
 * categories, so a missing Russian `few` is an error rather than a shrug.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const LOCALES_DIR = fileURLToPath(new URL('../src/shared/i18n/locales', import.meta.url));
const REFERENCE = 'en';
const PLURAL_SUFFIXES = ['zero', 'one', 'two', 'few', 'many', 'other'];

const flatten = (value, prefix = '') =>
  Object.entries(value).flatMap(([key, entry]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return entry !== null && typeof entry === 'object' ? flatten(entry, path) : [path];
  });

/** `results_one` -> `{ base: 'results', form: 'one' }`; a plain key -> form null. */
const splitPlural = (key) => {
  const index = key.lastIndexOf('_');
  if (index === -1) return { base: key, form: null };
  const form = key.slice(index + 1);
  return PLURAL_SUFFIXES.includes(form)
    ? { base: key.slice(0, index), form }
    : { base: key, form: null };
};

const readLocale = (locale) => {
  const dir = join(LOCALES_DIR, locale);
  const bundle = new Map();
  for (const file of readdirSync(dir).filter((name) => name.endsWith('.json'))) {
    const ns = file.replace(/\.json$/, '');
    const parsed = JSON.parse(readFileSync(join(dir, file), 'utf8'));
    for (const key of flatten(parsed)) bundle.set(`${ns}:${key}`, true);
  }
  return bundle;
};

const locales = readdirSync(LOCALES_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

if (!locales.includes(REFERENCE)) {
  console.error(`No "${REFERENCE}" locale in ${LOCALES_DIR}`);
  process.exit(1);
}

const bundles = new Map(locales.map((locale) => [locale, readLocale(locale)]));
const problems = [];

/** Compare each locale's base key set against English. */
const baseKeys = (bundle) => {
  const set = new Set();
  for (const full of bundle.keys()) {
    const [ns, ...rest] = full.split(':');
    set.add(`${ns}:${splitPlural(rest.join(':')).base}`);
  }
  return set;
};

const reference = baseKeys(bundles.get(REFERENCE));

for (const locale of locales) {
  if (locale === REFERENCE) continue;
  const own = baseKeys(bundles.get(locale));

  for (const key of [...reference].sort()) {
    if (!own.has(key)) problems.push(`${locale}: missing "${key}"`);
  }
  for (const key of [...own].sort()) {
    if (!reference.has(key)) problems.push(`${locale}: extra "${key}" (not in ${REFERENCE})`);
  }
}

/** Each locale must carry every plural form its own language actually uses. */
for (const locale of locales) {
  const bundle = bundles.get(locale);
  const required = new Intl.PluralRules(locale).resolvedOptions().pluralCategories;
  const pluralBases = new Map();

  for (const full of bundle.keys()) {
    const [ns, ...rest] = full.split(':');
    const { base, form } = splitPlural(rest.join(':'));
    if (form === null) continue;
    const id = `${ns}:${base}`;
    pluralBases.set(id, (pluralBases.get(id) ?? new Set()).add(form));
  }

  for (const [id, forms] of [...pluralBases].sort()) {
    for (const form of required) {
      if (!forms.has(form))
        problems.push(`${locale}: "${id}" is missing the "${form}" plural form`);
    }
  }
}

if (problems.length > 0) {
  console.error(`i18n key check failed (${problems.length} problem(s)):`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

console.log(`i18n key check passed: ${locales.join(', ')} agree on ${reference.size} keys.`);
