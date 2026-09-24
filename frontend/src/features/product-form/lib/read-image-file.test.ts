import { describe, expect, it } from 'vitest';
import { MAX_IMAGE_KB, readImageFile } from './read-image-file';

describe('readImageFile', () => {
  it('refuses a non-image', async () => {
    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' });
    expect(await readImageFile(file)).toEqual({ ok: false, error: 'badType' });
  });

  it('refuses an oversized image', async () => {
    const big = new Uint8Array((MAX_IMAGE_KB + 1) * 1024);
    const file = new File([big], 'big.png', { type: 'image/png' });
    expect(await readImageFile(file)).toEqual({ ok: false, error: 'tooLarge' });
  });

  it('reads an accepted image as a data URL', async () => {
    const file = new File([new Uint8Array([137, 80, 78, 71])], 'ok.png', { type: 'image/png' });
    const result = await readImageFile(file);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.dataUrl).toMatch(/^data:image\/png;base64,/);
  });
});
