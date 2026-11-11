# Plan: Details page – click the picture to enlarge it (no GitHub issue)

Branch: `feature/details-lightbox` (from `main`). Plan is committed first as `docs/plans/details-lightbox.md`.
The user decided: the picture itself opens the large view (with a magnifier chip), and the large view shows the picture plus a small caption.

## Context

On the details page the picture is limited to the left half of the card (max 34rem high). Paintings are the point of the app, so a click on the picture should show it large, framed like on the Spotlight, on a dark blurred backdrop. This is item 4 of the user's list of ideas. Item 5 (previous/next) is separate and will get its own plan.

## Approach

- **New `src/components/Lightbox.tsx`** (custom overlay, not the native `<dialog>`): jsdom 25 has an empty `HTMLDialogElement` (no `showModal`, no Escape handling), so a native dialog could not be tested truthfully. A conditionally rendered overlay is fully testable with user-event and gives full control of the look.
  - Props: `{ imageSource, name, artist, glow, onClose }`.
  - Rendered with `createPortal(..., document.body)` so it covers the navigation and the page glow.
  - Markup: `div.lightbox[role="dialog"][aria-modal="true"][aria-label=name]` > `div.lightbox-backdrop` (aria-hidden, blurred copy of the picture) + `figure.lightbox-figure` (framed picture: `img[alt=name]` + `figcaption` with name and artist) + `button.lightbox-close[aria-label="Close"]` (× icon, aria-hidden svg).
  - Behavior (in `useEffect`s): focus moves to the close button on open and goes back to the element that opened it on close; Tab / Shift+Tab keep the focus on the close button (it is the only control); Escape closes; a click on the backdrop (not on the picture or caption) closes; `document.body.style.overflow = "hidden"` while open and the old value restored on close.
- **`src/components/ArtPieceDetailsPage.tsx`** (modify): `isLightboxOpen` state. The picture becomes `button.details-zoom[aria-label="Enlarge {name}"]` containing the existing `<ViewTransition><img/></ViewTransition>` and a decorative `span.zoom-chip[aria-hidden]` (magnifier icon). The favorite button stays a sibling (never nested in a button). When open, render `<Lightbox ... glow={colors[0]} onClose=... />`.
- **`src/styles.css`** (modify): `.details-zoom` (reset of the base button look, `cursor: zoom-in`, chip in the bottom-right corner, chip scales on hover), `.lightbox` (fixed, z-index above the navigation, centered), backdrop (like `.spotlight-backdrop`: blur, darken), framed picture (mat + dark frame + glow in `--art-glow`, `max-width: 92vw`, `max-height: 78vh`), caption as a wall label, close button (glass circle, top right), entrance animation (backdrop fade, picture scales from 0.96). Reduced motion is already covered by the global rule.
- Reused: `FavoriteButton`/chip styling patterns (`.card-chip` look), `--art-glow` + `color-mix` glow pattern from the Spotlight and details page, `fade-in` keyframes.

## Tests first (new tests only; existing tests must stay valid)

`ArtPieceDetailsPage.test.tsx` (new `describe`) and a new `Lightbox.test.tsx`:

| Behavior                                                                                   | Test                                    |
| ------------------------------------------------------------------------------------------ | --------------------------------------- |
| The picture is a button named "Enlarge {name}" and still contains the image                | details test                            |
| No dialog before a click                                                                   | details test                            |
| Click opens a dialog named after the piece with a large picture and caption (name, artist) | details test; also with the other piece |
| Close button closes it and the focus returns to the Enlarge button                         | details test                            |
| Escape closes it                                                                           | details + Lightbox test                 |
| Click on the backdrop closes it; click on the picture does not                             | Lightbox test                           |
| Focus moves to the close button on open; Tab and Shift+Tab keep it there                   | Lightbox test                           |
| Page scroll is locked while open and restored on close and on unmount                      | Lightbox test                           |
| Magnifier chip and backdrop are hidden from assistive technology                           | details + Lightbox test                 |
| The favorite button is not inside the Enlarge button and still works                       | details test                            |

If an existing test unexpectedly fails (for example a role query that now finds the button), stop and ask; do not change it.

## Files to change

- New: `src/components/Lightbox.tsx`, `src/components/Lightbox.test.tsx`, `docs/plans/details-lightbox.md`
- Modify: `src/components/ArtPieceDetailsPage.tsx`, `src/components/ArtPieceDetailsPage.test.tsx` (new tests only), `src/styles.css`

## Out of scope

Previous/next inside the large view (item 5), zoom and pan, a glide animation from the details picture into the large view, swipe gestures, download or share, higher-resolution images, the Gallery and Spotlight pages, a native `<dialog>`.

## Resolved decisions

1. The picture itself opens the large view: it becomes a button named "Enlarge {name}", with a small magnifier chip in its corner (same idea as the arrow chip on the cards).
2. The large view shows the framed picture plus a small caption with the title and the artist (like the Spotlight's wall label).
3. A custom overlay instead of the native `<dialog>`, because jsdom has no `showModal` and no Escape handling, so a native dialog could not be tested truthfully.
4. Closing: the close button, Escape, and a click on the backdrop.

## Notes

- `feature/details-glow` also edits the opening `<article>` of `ArtPieceDetailsPage.tsx`; a small merge conflict is possible. Merge that branch first, or I rebase this one.
- The branch is verified with `git branch --show-current` before and after every commit; nothing is committed on `main`.

## Verification

`npm run test:run`, `npm run lint`, `npm run format:check`, `npm run check`, `npm run build`. Then in a real browser (Playwright/Chrome here, Firefox by the user): open a details page; click the picture; check the large view in light and dark and at 400px width; Escape, close button and backdrop close it; focus returns to the picture button; Tab stays on the close button; the page does not scroll behind; with reduced motion emulated there is no animation. Delete `.playwright-mcp/` afterwards.
