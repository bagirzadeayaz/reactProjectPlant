/* global window */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { writeSoundtrack } from './soundtrack.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg';
const temp = await mkdtemp(resolve(tmpdir(), 'planto-film-'));
const wav = resolve(temp, 'score.wav');
writeSoundtrack(wav);
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROME_PATH || undefined,
  args: ['--enable-unsafe-swiftshader'],
});
const output = resolve('frontend/public/media');
async function encode(args) {
  const child = spawn(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...args], {
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  let errors = '';
  child.stderr.on('data', (b) => (errors += b));
  const [code] = await once(child, 'close');
  if (code !== 0) throw Error(errors);
}
try {
  for (const portrait of [false, true]) {
    const page = await browser.newPage({
      viewport: { width: portrait ? 1080 : 1920, height: 1080 },
    });
    page.on('pageerror', (error) => {
      console.error(error);
    });
    await page.goto(
      `http://127.0.0.1:5173/@fs/${resolve('scripts/film/film.html').replaceAll('\\', '/')}${portrait ? '?portrait' : ''}`,
    );
    await page.waitForFunction(() => window.filmReady);
    const name = portrait ? 'planto-promo-mobile' : 'planto-promo';
    const child = spawn(
      ffmpeg,
      [
        '-hide_banner',
        '-loglevel',
        'error',
        '-y',
        '-f',
        'image2pipe',
        '-vcodec',
        'mjpeg',
        '-framerate',
        '24',
        '-i',
        'pipe:0',
        '-i',
        wav,
        '-c:v',
        'libx264',
        '-preset',
        'medium',
        '-crf',
        '18',
        '-pix_fmt',
        'yuv420p',
        '-c:a',
        'aac',
        '-b:a',
        '192k',
        '-af',
        'loudnorm=I=-18:TP=-2:LRA=9',
        '-movflags',
        '+faststart',
        '-t',
        '28',
        resolve(output, `${name}.mp4`),
      ],
      { stdio: ['pipe', 'ignore', 'pipe'] },
    );
    let errors = '';
    child.stderr.on('data', (b) => (errors += b));
    const done = once(child, 'close');
    for (let frame = 0; frame < 672; frame++) {
      const base64 = await page.evaluate((t) => window.renderFilm(t), frame / 24);
      if (!child.stdin.write(Buffer.from(base64, 'base64'))) await once(child.stdin, 'drain');
      if (frame % 120 === 0) console.log(`${name}: ${Math.round((frame / 672) * 100)}%`);
    }
    child.stdin.end();
    const [code] = await done;
    if (code !== 0) throw Error(errors);
    await encode([
      '-ss',
      '2.5',
      '-i',
      resolve(output, `${name}.mp4`),
      '-frames:v',
      '1',
      '-q:v',
      '2',
      resolve(output, `${name}-poster.jpg`),
    ]);
    if (!portrait) {
      for (const [index, time] of [2.5, 9, 14, 18, 22, 26].entries()) {
        await encode([
          '-ss',
          String(time),
          '-i',
          resolve(output, name + '.mp4'),
          '-frames:v',
          '1',
          '-vf',
          'scale=480:-2',
          '-q:v',
          '3',
          resolve(output, 'planto-scene-' + (index + 1) + '.jpg'),
        ]);
      }
    }
    await page.close();
    console.log(`${name}: complete`);
  }
  await encode([
    '-i',
    resolve(output, 'planto-promo.mp4'),
    '-c:v',
    'libvpx-vp9',
    '-crf',
    '30',
    '-b:v',
    '0',
    '-row-mt',
    '1',
    '-c:a',
    'libopus',
    '-b:a',
    '128k',
    resolve(output, 'planto-promo.webm'),
  ]);
} finally {
  await browser.close();
  await rm(temp, { recursive: true, force: true });
}
