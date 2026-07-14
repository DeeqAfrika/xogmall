# Design QA

Reference: `.qa/visual-reference-v2.png`

## Visual comparison

- Desktop hero matches the selected split blue/photo composition with a floating horizontal calculator.
- Section density, pale blue receive-options band, photo destination grid, agent banner, trust row, FAQ, and navy footer follow the reference hierarchy.
- Brand logo assets are used in the header and footer; supplied favicon remains the app icon.
- Generated imagery is sized and cropped for its actual hero, destination-card, and agent-banner slots.
- Unsupported service, speed, fee, and regulatory claims from the visual reference were not copied.

## Responsive and interaction checks

- Desktop checked at 1600 x 900.
- Mobile checked at the compact browser breakpoint with no horizontal overflow.
- Mobile navigation opens and exposes all primary and portal links.
- Calculator input, portal links, destination links, native FAQ controls, and section anchors remain functional.
- Browser console: no warnings or errors.

## Build checks

- `npm install`: passed, 0 vulnerabilities.
- `npm run build`: passed.
- `/` is statically generated from `src/app/page.tsx`.

final result: passed
