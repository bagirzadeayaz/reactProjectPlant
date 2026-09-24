import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { initI18n } from '../../../shared/i18n';
import { issueMessage, type ValidationTranslate } from './issue-message';

const i18n = initI18n();
const t: ValidationTranslate = (key, values) => i18n.t(`validation:${key}`, values ?? {});

const firstMessage = (schema: z.ZodType, value: unknown): string | undefined =>
  schema.safeParse(value, { error: (issue) => issueMessage(issue, t) }).error?.issues[0]?.message;

describe('issueMessage', () => {
  it('reads an empty required string as required', () => {
    expect(firstMessage(z.string().min(1), '')).toBe('This field is required');
  });

  it('reads a longer minimum as too short', () => {
    expect(firstMessage(z.string().min(3), 'ab')).toBe('Must be at least 3 characters');
  });

  it('reads a maximum as too long', () => {
    expect(firstMessage(z.string().max(2), 'abc')).toBe('Must be at most 2 characters');
  });

  it('distinguishes NaN, fractions and negatives on a price', () => {
    const price = z.number().int().nonnegative();
    expect(firstMessage(price, Number.NaN)).toBe('Enter a number');
    expect(firstMessage(price, 1.5)).toBe('Enter a whole number');
    expect(firstMessage(price, -1)).toBe('Cannot be negative');
  });

  it('names a bad URL', () => {
    expect(firstMessage(z.url(), 'nope')).toBe('Enter a valid URL');
  });

  it('falls back to a generic message', () => {
    expect(firstMessage(z.enum(['a']), 'b')).toBe('Invalid value');
  });
});
