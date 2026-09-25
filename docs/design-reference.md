# Storefront design reference

Source: [Figma community design, frame 22:2](https://www.figma.com/design/pAChQOhAXx4RyL4cUkL8nZ/?node-id=22-2), inspected on 2026-09-25. Desktop canvas: 1728 × 7558.

The storefront now uses the original high-resolution plant cutouts, tree photograph, logo and reviewer portraits retrieved from the public Figma canvas. Responsive AVIF/WebP derivatives are generated with `npm run images`. Files live in `frontend/public/plants`, `images` and `avatars`.

The layout follows the reference's hero, two promotional panels, six-product grid, reviews, Best O2 feature and footer. Typography, translucent panels, spacing, plant overhangs and green heading corners were aligned to the reference. Mobile layouts and the Care and Contact pages extend its visual language because no corresponding designs were supplied.

Product descriptions, prices, stock and reviews remain live store content rather than the design's placeholder copy. Account access, language selection, cart and newsletter functionality are retained. The second promotional plant is decorative campaign artwork; its purchase controls use the associated live product.

Motion includes staged hero entrances, section reveals, floating featured artwork, carousel changes and hover responses. Continuous motion and hover transforms respect reduced-motion preferences.

Verification: desktop and mobile browser review, English and Russian layouts down to 320px, lint, production build, 300 frontend tests, 21 backend tests and 12 desktop/mobile browser tests. The browser suite uses installed Chrome (`PLAYWRIGHT_CHANNEL=chrome`).
