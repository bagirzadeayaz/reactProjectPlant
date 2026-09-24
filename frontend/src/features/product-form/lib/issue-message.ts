import type { z } from 'zod';

/** The slice of `t` this needs: a key in the `validation` namespace plus values. */
export type ValidationTranslate = (
  key:
    | 'required'
    | 'tooShort'
    | 'tooLong'
    | 'notANumber'
    | 'negative'
    | 'notWhole'
    | 'invalidUrl'
    | 'invalid',
  values?: Record<string, number>,
) => string;

/**
 * Turns a zod issue into a translated message.
 *
 * The schemas in `entities` are the only place validation rules live; this
 * only decides what to *say* about a failed rule, keyed on the issue rather
 * than on the field, so a new field with the same rule needs no new copy.
 */
export const issueMessage = (issue: z.core.$ZodRawIssue, t: ValidationTranslate): string => {
  switch (issue.code) {
    case 'too_small': {
      if (issue.origin === 'number') return t('negative');
      const min = Number(issue.minimum);
      return min <= 1 ? t('required') : t('tooShort', { min });
    }
    case 'too_big':
      return t('tooLong', { max: Number(issue.maximum) });
    case 'invalid_type':
      if (issue.expected === 'int') return t('notWhole');
      if (issue.expected === 'number') return t('notANumber');
      return t('required');
    case 'invalid_format':
      return issue.format === 'url' ? t('invalidUrl') : t('invalid');
    default:
      return t('invalid');
  }
};
