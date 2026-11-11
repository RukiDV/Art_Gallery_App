# Plan: Rearrange the Favorites wall (no GitHub issue)

Branch: `feature/rearrange-favorites` (from `main`). Plan is committed first as `docs/plans/rearrange-favorites.md`.
The user decided: the frames are draggable only in an "Arrange" mode, and people without a mouse use Move earlier / Move later buttons.

## Context

The Favorites page already lists favorites in the order they were added (new ones go to the end) and saves that order. Item 6 of the user's list of ideas: let people hang their favorites in their own order, by dragging frames on the wall.

## Approach

No new library. Dragging uses the browser's built-in HTML drag and drop (mouse); keyboard and touch use buttons.

- **New `src/favoriteOrder.ts`**: pure function `moveFavorite(infos, slug, toIndex)`. The favorites' order is the relative order of the entries with `isFavorite` in the saved list (this is what `FavoritesPage` already sorts by). The function takes the favorite entries, moves one to `toIndex` (clamped), and refills the favorite slots of the list in the new order; entries that are not favorites keep their places; comments and other data are untouched; no change returns the same array.
- **`src/App.tsx`** (modify): `moveFavorite(slug, toIndex)` calls `setArtPiecesInfo((current) => moveFavorite(current, slug, toIndex))` and is passed to `FavoritesPage` as `onMoveFavorite`. Saving already happens in the existing effect, so the new order survives a reload.
- **`src/components/FavoritesPage.tsx`** (modify)
  - New optional prop `onMoveFavorite?: (slug, toIndex) => void`. The **Arrange** button appears only when the prop is given and there are at least two favorites (so existing tests and the empty or single state are unchanged). Pressing it shows **Done**; arranging also ends by itself if fewer than two favorites remain (for example after removing one with its heart).
  - In arrange mode the list is rendered as `ul.art-list.arranging` (the normal mode keeps using `ArtPieceList`). Each `li` is `draggable`, with its own drag handlers; links do not open (`onClickCapture` calls `preventDefault`, which also stops Enter on a link); the hover flip is off.
  - Dragging: `dragstart` stores the dragged slug in state (not in `dataTransfer`, which jsdom lacks), `dragover` on another frame calls `preventDefault` and marks it as the drop target, `drop` calls `onMoveFavorite(draggedSlug, indexOfTarget)` (the dragged frame takes the target's place, the others shift), `dragend` clears the marks. Dropping on itself does nothing.
  - Buttons: each frame gets `Move {name} earlier` and `Move {name} later` (disabled at the ends) that call `onMoveFavorite(slug, index ∓ 1)`. After a move the focus goes back to the same button (or to its partner if it became disabled), because moving a keyed element can drop the focus.
  - Announcement: a visually hidden `role="status"` says `Moved {name} to position {n} of {total}` after every move, by drag or by button.
- **`src/styles.css`** (modify): toolbar with the Arrange/Done button above the wall; `.arranging` frames get a dashed outline, `cursor: grab`, the dragged frame is dimmed, the drop target gets an accent outline; the Move buttons are small glass pills along the bottom of each frame (same look as `.zoom-chip`/`.card-chip`, readable in both modes); the flip is disabled while arranging.
- Reused: `ArtPiecePreview` as it is, the existing `favoriteOrder` sorting in `FavoritesPage`, `.button-link`/button styles, the glass chip look.

## Tests first (new tests only; existing tests must stay valid)

- `src/favoriteOrder.test.ts` (pure): move forward and backward; clamping at both ends; same position returns the same array; unknown or non-favorite slug changes nothing; non-favorite entries keep their positions; comments and `isFavorite` values stay as they are.
- `FavoritesPage.test.tsx` (new `describe`):
  | Behavior                                                                                                                                         | Test                                                    |
  | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
  | No Arrange button without `onMoveFavorite`, and none with fewer than two favorites                                                               | page test                                               |
  | Arrange switches to Done and back; Done leaves arrange mode                                                                                      | page test                                               |
  | Arrange mode shows Move earlier / later buttons named after each painting; first has no earlier, last has no later                               | page test                                               |
  | A Move button calls `onMoveFavorite(slug, index ∓ 1)` and the page announces the new position                                                    | page test                                               |
  | The focus stays on the moved frame's button (stateful wrapper that really reorders)                                                              | page test                                               |
  | Links do not open in arrange mode (the click is prevented) and do open in normal mode                                                            | page test                                               |
  | Dragging one frame onto another calls `onMoveFavorite(draggedSlug, targetIndex)`; dropping on itself does not; drag marks are cleared at the end | page test (`fireEvent.dragStart/dragOver/drop/dragEnd`) |
  | Arrange mode ends by itself when only one favorite is left                                                                                       | page test                                               |
- `App.test.tsx` (new `describe`): with three favorites, Arrange, Move the last one earlier, Done: the Favorites page lists the new order, the saved order in `localStorage` changed, and a fresh render of `/favorites` shows the new order; removing and adding favorites still works afterwards.

If an existing test unexpectedly fails, stop and ask; do not change it.

## Files to change

- New: `src/favoriteOrder.ts`, `src/favoriteOrder.test.ts`, `docs/plans/rearrange-favorites.md`
- Modify: `src/App.tsx`, `src/App.test.tsx` (new tests only), `src/components/FavoritesPage.tsx`, `src/components/FavoritesPage.test.tsx` (new tests only), `src/styles.css`

## Out of scope

Dragging on touch screens (browsers do not start HTML drag and drop from touch reliably; the buttons cover touch), a "reset to the order I added them" button, move animations (FLIP), undo, rearranging in the Gallery, a drag library, keyboard shortcuts for moving, the Spotlight.

## Resolved decisions

1. The frames are draggable only in an Arrange mode (an Arrange button, then Done), not all the time.
2. Dragging is for the mouse. Keyboard and touch use Move earlier / Move later buttons in arrange mode; no new library.
3. The new order is saved with the existing saved list, so it survives a reload.

## Notes

- The branch is verified with `git branch --show-current` before and after every commit; nothing is committed on `main`.
- Before branching, local `main` is brought up to date with GitHub (the previous-next PR may be merged by then).

## Verification

`npm run test:run`, `npm run lint`, `npm run format:check`, `npm run check`, `npm run build`. Then in a real browser (Playwright/Chrome here, with `dragTo` for the drag; Firefox by the user): favorite three or more paintings; press Arrange; drag a frame onto another and see the order change; use the Move buttons with the keyboard (focus stays on the moved frame); links do not open while arranging; press Done and the frames behave normally again; reload and the order is kept; light, dark and 400px width. Delete `.playwright-mcp/` afterwards.
