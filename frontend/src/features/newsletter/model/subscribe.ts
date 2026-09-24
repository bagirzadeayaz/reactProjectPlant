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

/** Sends the signup to the Node.js API, which saves it in Firestore. */
export const subscribe = async (email: string): Promise<void> => {
  const response = await fetch(new URL('/api/newsletter', globalThis.location.href), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) throw new Error('subscription failed');
};
