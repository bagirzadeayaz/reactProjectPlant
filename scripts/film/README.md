# Planto film source

A 28-second, 24 fps botanical brand film. `scene.mjs` renders a deterministic timeline using the site's original plant geometry and existing product/room artwork. `soundtrack.mjs` synthesizes an original stereo ambient score; it uses no third-party music or recordings.

The six scenes are: leaf/dew close-up (0s), growth (5s), daylight room (12s), evening room (16s), collection (20s), and brand finale (24s). The phone composition is independently framed at 1080×1080; desktop is 1920×1080.

To render, start the project's Vite server at `http://127.0.0.1:5173`, then run `node scripts/film/render.mjs`. Supply these environment variables when the tools are not available on the default paths:

- `PLAYWRIGHT_PATH`: installed Playwright package path.
- `CHROME_PATH`: Chrome executable path.
- `FFMPEG_PATH`: FFmpeg executable path (H.264, AAC, VP9 and Opus enabled).

The generator writes MP4 masters, a desktop WebM fallback, posters and chapter thumbnails to `frontend/public/media`. It uses a unique temporary folder for the soundtrack and removes it after rendering. These are authoring tools, not runtime application dependencies. The public player selects the appropriate composition at load, provides keyboard-operable controls, and supports English/Russian subtitle tracks. Native video controls remain available without JavaScript.

Art direction references: [Renewal](https://madebymotionx.com/work/renewal) for warm light and deliberate camera movement; [The Botanist](https://www.samplistic.com/motion/the-botanist-new) for a botanical CG narrative. No footage or audio was copied from these references.
