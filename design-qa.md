# Hogmall landing-page design QA

- Source visual truth: `/Users/Deeq/.codex/generated_images/019f60a0-2436-7e82-a36b-d5d0dbc6fd60/exec-1617b6e3-5b37-458b-bc6a-fc7c5c5d620c.png`
- Desktop implementation: `/Users/Deeq/Documents/GitHub/xogmall/output/playwright/hogmall-redesign-desktop-final.png`
- Mobile implementation: `/Users/Deeq/Documents/GitHub/xogmall/output/playwright/hogmall-redesign-mobile-final.png`
- Combined comparison: `/Users/Deeq/Documents/GitHub/xogmall/output/playwright/hogmall-design-comparison-final.png`
- Viewports: 1440 × 1000 desktop; 390 × 844 mobile
- State: public landing page with Supabase configuration intentionally absent and the safe rate-unavailable state visible

## Findings

No actionable P0, P1, or P2 issues remain.

- Fonts and typography: Georgia supplies the selected editorial serif character for the hero and major section headlines; Geist remains the readable UI/body face. Weight, wrapping, scale, and hierarchy match the selected direction without clipping at either viewport.
- Spacing and layout rhythm: the asymmetric three-part hero, offset rate dock, editorial local-support block, photo essay, agent finale, and compact footer preserve the selected composition. Desktop and mobile have no horizontal overflow or hidden primary actions.
- Colors and visual tokens: Hogmall red, oxblood, warm cream, white, and ink map consistently to the selected palette with accessible foreground contrast.
- Image quality and asset fidelity: all visible photography and logos use the supplied raster assets through `next/image`; crops remain sharp and preserve faces and focal points. No placeholder, CSS-drawn, or substitute imagery is present.
- Copy and content: rate, calculator, locator, and agent-onboarding actions remain functional. Unverified rates, addresses, regulatory status, and service claims from the visual concept were deliberately replaced with approval-safe product copy and live-data routes.

## Focused comparison evidence

- Hero: source and implementation both use the cream editorial introduction, large portrait, red utility dock, and serif “Real people. Real rates.” hierarchy. The live implementation correctly shows “Temporarily unavailable” when no rate is configured.
- Local support: the source’s fabricated branch records were replaced with one real locator entry point plus three system-grounded publishing principles; structure, imagery, and asymmetric rhythm remain faithful without inventing operational data.
- Mobile: navigation opens and exposes every primary route; the calculator accepts numeric input; the image, rate dock, story rows, CTA, and footer stack without clipping.

## Comparison history

### Pass 1 — blocked

- P1: all-sans display typography lost the editorial character of the selected concept.
- P2: the retained FAQ and multi-column footer created a substantially longer, more ClickPay-like tail.
- Fixes: introduced an editorial serif display hierarchy; removed the landing-page FAQ; replaced the multi-column footer with a compact single-row structure.

### Pass 2 — passed

- Post-fix comparison confirms the page now matches the selected information hierarchy, visual rhythm, palette, and imagery closely.
- Remaining differences are intentional product constraints: no fabricated exchange rate, branch address, contact number, fee, regulatory claim, or service promise.

## Interaction checks

- Mobile menu opens and exposes rate, locator, how-it-works, help, and agent-network routes.
- GBP calculator input accepts and retains `250`; the USD estimate remains blank while the rate is unavailable.
- All primary CTA destinations are valid.
- Browser console: 0 errors. The only warning is the Next.js development-tools notice.

## Follow-up polish

- P3: replace Georgia with an approved licensed Hogmall display font if a formal typography standard is supplied.

final result: passed
