/**
 * The HTML specification's e-mail pattern — what a browser applies to
 * `<input type="email">`. Zod uses the same shape for `z.email()`.
 *
 * Not a zod schema on purpose: the footer is on every page, and this one
 * check is not worth carrying zod's core in the entry bundle. Entity schemas
 * stay on zod; they load with the admin form and the mock backend only
 * (ARCHITECTURE.md, decision 56).
 */
const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export type EmailResult = { success: true; data: string } | { success: false };

/** Trims, then validates. Mirrors zod's `safeParse` result shape. */
export const parseEmail = (value: string): EmailResult => {
  const data = value.trim();
  return EMAIL_PATTERN.test(data) ? { success: true, data } : { success: false };
};

export const NEWSLETTER_STORAGE_KEY = 'planto:newsletter';

/**
 * The "backend" for the newsletter.
 *
 * There is no mail service behind a static deploy, so this records the
 * address locally and takes long enough to show a loading state. It rejects
 * a specific address so the error path can be exercised by hand and in tests.
 */
export const subscribe = async (email: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  if (email.endsWith('@fail.test')) {
    throw new Error('subscription failed');
  }
  try {
    globalThis.localStorage.setItem(NEWSLETTER_STORAGE_KEY, email);
  } catch {
    // Storage blocked: the subscription still "succeeded" for this session.
  }
};
