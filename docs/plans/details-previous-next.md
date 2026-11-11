# Plan: Details page – Previous and Next painting (no GitHub issue)

Branch: `feature/details-previous-next` (from `main`). Plan is committed first as `docs/plans/details-previous-next.md`.
The user decided: wrap around at the ends; links in the top row with painting names; no arrows inside the large view.

## Context

Today you have to go back to the gallery to look at another painting. Item 5 of the user's list of ideas: browse from one details page to the next, with links and with the keyboard arrows.

## Approach

All changes are inside the details page; `App.tsx` already passes the full `artPieces` list to it, so no data or routing change is needed.

- **`src/components/ArtPieceDetailsPage.tsx`** (modify)
  - Neighbours: `index = artPieces.findIndex(slug)`, `previous = artPieces[(index - 1 + n) % n]`, `next = artPieces[(index + 1) % n]`. The order is the gallery order as delivered by the API (not the filtered gallery list, not the favorites order). With fewer than two paintings there are no links.
  - Top row: the existing `Back` link stays on the left; a `div.details-browse` (`role="group"`, `aria-label="Browse paintings"`) on the right holds two plain `<Link>`s: `← Previous: {name}` and `Next: {name} →`. The arrows are decorative (`aria-hidden`), so the link names are `Previous: {name}` and `Next: {name}`. **Not a `<nav>` element**: the global `nav { position: fixed }` style would hit it, and the App tests require exactly one navigation.
  - Keyboard: a `keydown` listener on `document` (effect): ArrowLeft goes to the previous, ArrowRight to the next painting (`useNavigate`). It does nothing when the large view is open, when a modifier key is pressed (Ctrl/Alt/Meta/Shift), when the event is already `defaultPrevented`, or when the target is an `input`, `textarea`, `select` or content-editable element (so typing a comment or moving the cursor in a field is never hijacked).
  - Switching paintings reuses the same component instance, so drafts would carry over. `key={artPiece.slug}` goes on the comments wrapper (`div.details-comments`): a half-typed comment and an open edit form are reset when the painting changes.
- **`src/styles.css`** (modify): the top row becomes a flex row (`Back` left, browse group right, wraps on narrow screens); the browse links get the `button-link` look (zero-specificity pill, already in the stylesheet); long names are shortened with `text-overflow: ellipsis` and a `max-width` on narrow screens, the full name stays in the accessible name and `title`.
- Reused: `.button-link` and `.status-actions` look from the status pages, `TransitionLink`/`Link` patterns, `renderDetails` test helper pattern.

## Tests first (new tests only; existing tests must stay valid)

`ArtPieceDetailsPage.test.tsx` (new `describe`, with a small render that also shows the current path, since the existing helper does not):

| Behavior                                                                                                       | Test         |
| -------------------------------------------------------------------------------------------------------------- | ------------ |
| A group "Browse paintings" with links `Previous: {name}` and `Next: {name}` pointing to the neighbours' pages  | details test |
| The first painting's Previous is the last painting and the last painting's Next is the first (wrap)            | details test |
| No browse group with only one painting                                                                         | details test |
| Clicking Next / Previous shows the neighbouring painting (heading, picture)                                    | details test |
| ArrowRight / ArrowLeft go to the next / previous painting                                                      | details test |
| Arrow keys do nothing while typing in the comment field, with a modifier key, and while the large view is open | details test |
| A half-typed comment is gone after switching to the next painting                                              | details test |
| The browse group is not a navigation landmark                                                                  | details test |
| The decorative arrows are hidden from assistive technology                                                     | details test |

If an existing test unexpectedly fails, stop and ask; do not change it.

## Files to change

- New: `docs/plans/details-previous-next.md`
- Modify: `src/components/ArtPieceDetailsPage.tsx`, `src/components/ArtPieceDetailsPage.test.tsx` (new tests only), `src/styles.css`

## Out of scope

Arrows inside the large view, following the filtered gallery or the favorites order, a glide or slide animation between paintings, swipe gestures, preloading the neighbour's picture, scroll-to-top on switching, changes to Gallery, Favorites or Spotlight.

## Resolved decisions

1. At the ends the links wrap around (Next on the last painting goes to the first, Previous on the first goes to the last).
2. The links sit in the top row with the painting names; the Back link stays on the left.
3. The large view does not get arrows; it stays as built in the previous change.
4. The order is the gallery order from the API, not the filtered or favorites order.

## Notes

- The branch is verified with `git branch --show-current` before and after every commit; nothing is committed on `main`.
- Local `main` is at `4525935` (PR #67 merged); the branch starts from it.

## Verification

`npm run test:run`, `npm run lint`, `npm run format:check`, `npm run check`, `npm run build`. Then in a real browser (Playwright/Chrome here, Firefox by the user): from the first painting go Previous (lands on the last), from the last go Next (lands on the first); ArrowLeft/Right work; typing in the comment field and pressing arrows does not navigate; the large view still opens and closes; at 400px width the row wraps cleanly with shortened names; light and dark mode. Delete `.playwright-mcp/` afterwards.
