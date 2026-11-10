# Plan: Issue #50 – Bonus: Spotlight Slideshow

Issue: #50 "22: Bonus - Spotlight Slideshow". Branch: `feature/50-spotlight-slideshow`.

## Summary

The Spotlight page gets a "Start slideshow" button. While it runs, a different art piece appears every 5 seconds and the button reads "Stop slideshow". It builds on #49: `SpotlightPage` already holds the piece in state and `getRandomArtPiece(artPieces, excludedSlug)` already excludes the current piece, so the slideshow reuses both.

## Approach

- `src/components/SpotlightPage.tsx` (only source file changed):
  - New state `isSlideshowRunning` (starts `false`, so the page opens as before).
  - `useEffect` that, only while running, starts `setInterval(() => setArtPiece(getRandomArtPiece(artPieces, artPiece.slug)), 5000)` and clears it in the cleanup. The effect depends on `isSlideshowRunning`, `artPiece` and `artPieces`.
    - A new piece (by tick or by "Show another") re-runs the effect, so the 5 seconds start again → "Show another" restarts the timer.
    - Toggling a favorite does not change `artPiece`, so the timer is not restarted and the piece does not change.
    - Stopping, or leaving the page (unmount), runs the cleanup → no timer keeps running. Stopping keeps the current piece.
  - Button "Start slideshow" / "Stop slideshow", rendered only when `artPieces.length > 1` (next to "Show another").
  - `aria-live="polite"` on the `<figure>` so the change is announced politely (issue note).
- No CSS, no `App.tsx`, no `randomArtPiece.ts` change.

## AC coverage

| AC                                                         | Change                                    | Test                                                                                                                                                           |
| ---------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button "Start slideshow"                                   | button in `SpotlightPage`                 | `SpotlightPage.test.tsx`: button present with several pieces; `App.test.tsx`: on `/`                                                                           |
| Different piece (never the current) every 5 s              | interval + `getRandomArtPiece(..., slug)` | fake timers: nothing changes at 4999 ms, changes at 5000 ms; several ticks with 3 pieces and varying random values never repeat; with two pieces it alternates |
| Label "Stop slideshow" while running; stop keeps the piece | `isSlideshowRunning` toggle, cleanup      | after start the button is "Stop slideshow"; after stop, advancing 20 s changes nothing and the piece is kept; label is "Start slideshow" again                 |
| "Show another" during the slideshow restarts the 5 s       | effect re-runs on new piece               | advance 3 s, click "Show another" (piece changes), advance 3 s → unchanged, advance 2 s more → changes; slideshow still running                                |
| Favorite neither changes the piece nor restarts the 5 s    | piece in state, effect deps unchanged     | advance 3 s, toggle favorite (parent re-render), same piece, advance 2 s → changes (timer was not restarted)                                                   |
| Leaving the page stops the slideshow                       | effect cleanup                            | unmount, then `vi.getTimerCount()` is 0; `App.test.tsx`: start on `/`, click "Gallery", advance 10 s, no timer left / no errors                                |
| One piece → no slideshow button                            | `artPieces.length > 1`                    | one piece: no "Start slideshow"                                                                                                                                |
| Does not start by itself                                   | initial state `false`                     | render, advance 20 s, piece unchanged, no timer (`vi.getTimerCount()` 0)                                                                                       |
| (note) polite announcement                                 | `aria-live="polite"`                      | the figure has `aria-live="polite"`                                                                                                                            |

## Files to change

- `src/components/SpotlightPage.tsx` – slideshow state, effect, button, `aria-live`.
- `src/components/SpotlightPage.test.tsx` – new tests with `vi.useFakeTimers()` / `vi.advanceTimersByTime` (wrapped in `act`); `user-event` set up with `advanceTimers: vi.advanceTimersByTime`; restore real timers in `afterEach`.
- `src/App.test.tsx` – new tests: button on `/`, leaving the page stops the timer.
- Existing tests: none expected to change (existing queries use names). If one unexpectedly fails, stop and ask.

## Out of scope

Configurable interval, pausing on hover, progress bar, keyboard shortcuts, remembering shown pieces, animation/transition, autoplay on load, saving the slideshow state, re-syncing the piece when the `artPieces` prop changes (pre-existing, reviewer note on #49).

## Resolved decisions (approved)

1. `aria-live="polite"` goes on the `<figure>` (image, artist and heart change together). Side effect: the heart's pressed state may be announced too, which is harmless.
2. The slideshow keeps running after "Show another"; it only restarts the 5 seconds.
3. A new `artPieces` array reference from the parent would restart the timer; today the array is stable between renders, and a test covers the favorite toggle.

## Verification

`npm run test:run`, `lint`, `format:check`, `check`, `build`; mutation checks (each must fail a test): no cleanup, no restart on a new piece (timer not tied to `artPiece`), restart on favorite, interval not excluding the current piece, button with one piece, slideshow starting by itself. Manual in `npm run dev`: start the slideshow, a new painting every 5 s, never twice in a row; "Show another" restarts the count; favoriting does not; stop keeps the painting; switching to the Gallery stops it.
