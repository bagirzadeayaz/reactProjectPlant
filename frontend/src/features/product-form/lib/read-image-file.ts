/** Kilobytes. The API stores uploaded bytes in Firestore, so keep them below its document limit. */
export const MAX_IMAGE_KB = 300;
export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

export type ImageFileError = 'tooLarge' | 'badType' | 'unreadable';

export type ImageFileResult = { ok: true; dataUrl: string } | { ok: false; error: ImageFileError };

/**
 * Validates a dropped or chosen file and reads it as a data URL.
 *
 * Type and size are checked before the read, so a 20 MB drop is refused
 * without ever touching it. The result is a discriminated union rather than
 * a throw because "the user picked the wrong file" is a normal outcome.
 */
export const readImageFile = (file: File): Promise<ImageFileResult> => {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type))
    return Promise.resolve({ ok: false, error: 'badType' });
  if (file.size > MAX_IMAGE_KB * 1024) return Promise.resolve({ ok: false, error: 'tooLarge' });

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const { result } = reader;
      if (typeof result === 'string') resolve({ ok: true, dataUrl: result });
      else resolve({ ok: false, error: 'unreadable' });
    };
    reader.onerror = () => {
      resolve({ ok: false, error: 'unreadable' });
    };
    reader.readAsDataURL(file);
  });
};
