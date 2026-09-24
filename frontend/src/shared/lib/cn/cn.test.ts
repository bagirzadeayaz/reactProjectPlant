import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('drops falsy values', () => {
    expect(cn('a', false, null, undefined, '')).toBe('a');
  });

  it('applies conditional objects and arrays', () => {
    expect(cn(['a', { b: true, c: false }])).toBe('a b');
  });

  it('lets the later Tailwind utility win a conflict', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-ink', 'text-ink-muted')).toBe('text-ink-muted');
  });

  it('keeps non-conflicting utilities', () => {
    expect(cn('rounded-control', 'border-2')).toBe('rounded-control border-2');
  });

  it("resolves conflicts between the project's own scale names", () => {
    expect(cn('rounded-control', 'rounded-icon')).toBe('rounded-icon');
    expect(cn('text-h1', 'text-h2')).toBe('text-h2');
    expect(cn('shadow-media', 'shadow-float')).toBe('shadow-float');
  });
});
