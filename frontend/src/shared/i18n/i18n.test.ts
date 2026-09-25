import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { formatCurrency, formatDate, formatNumber } from './format';
import { normalizeLocale } from './config';
import { pickLocalized } from '../api';
import { resources } from './resources';

describe('normalizeLocale', () => {
  it('keeps a supported tag', () => {
    expect(normalizeLocale('ru')).toBe('ru');
    expect(normalizeLocale('en')).toBe('en');
  });

  it('strips the region, so ru-RU resolves to the ru bundle', () => {
    expect(normalizeLocale('ru-RU')).toBe('ru');
    expect(normalizeLocale('en-GB')).toBe('en');
  });

  it('falls back to English for anything unsupported or absent', () => {
    expect(normalizeLocale('de')).toBe('en');
    expect(normalizeLocale(undefined)).toBe('en');
    expect(normalizeLocale('')).toBe('en');
  });
});

describe('pickLocalized', () => {
  const field = { en: 'Calathea plant', ru: 'Калатея' };

  it('reads the requested language', () => {
    expect(pickLocalized(field, 'ru')).toBe('Калатея');
    expect(pickLocalized(field, 'en')).toBe('Calathea plant');
  });

  it('falls back to English when the translation is empty', () => {
    expect(pickLocalized({ en: 'Desk plant', ru: '' }, 'ru')).toBe('Desk plant');
  });
});

describe('Intl formatting', () => {
  it('formats currency per locale rather than by hand', () => {
    const en = formatCurrency(1299, 'AZN', 'en');
    const ru = formatCurrency(1299, 'AZN', 'ru');

    expect(en).toContain('1,299');
    expect(en).toContain('₼');
    expect(ru).toContain('₼');
    expect(ru).toContain('1');
    expect(ru).not.toBe(en);
  });

  it('groups numbers per locale', () => {
    expect(formatNumber(1234567, 'en')).toBe('1,234,567');
    expect(formatNumber(1234567, 'ru')).not.toBe(formatNumber(1234567, 'en'));
  });

  it('formats dates per locale', () => {
    const iso = '2026-01-12T09:00:00.000Z';
    expect(formatDate(iso, 'en')).not.toBe(formatDate(iso, 'ru'));
  });

  it('shows whole manats without decimal places', () => {
    expect(formatCurrency(309, 'AZN', 'en')).not.toContain('.00');
  });
});

describe('resource bundles', () => {
  it('ships the same namespaces for both languages', () => {
    expect(Object.keys(resources.ru)).toStrictEqual(Object.keys(resources.en));
  });

  it('carries Russian plural forms that English does not need', () => {
    expect(resources.ru.catalog).toHaveProperty('results_few');
    expect(resources.ru.catalog).toHaveProperty('results_many');
    expect(resources.en.catalog).toHaveProperty('results_other');
  });

  it('translates rather than copying the English through', () => {
    expect(resources.ru.common.nav.home).not.toBe(resources.en.common.nav.home);
    expect(resources.ru.catalog.title).not.toBe(resources.en.catalog.title);
  });
});

describe('language detection order', () => {
  const originalUrl = globalThis.location.href;

  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  afterEach(() => {
    globalThis.history.replaceState(null, '', originalUrl);
    globalThis.localStorage.clear();
  });

  it('stores the language under the documented key', async () => {
    const { initI18n, LANGUAGE_STORAGE_KEY } = await import('./config');
    const instance = initI18n();
    await instance.changeLanguage('ru');

    expect(globalThis.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('ru');
    await instance.changeLanguage('en');
  });
});
