# Plan: Issue #49 – Bonus: Show Another Spotlight

Issue: #49 "21: Bonus - Show Another Spotlight" (https://github.com/RukiDV/Art_Gallery_App/issues/49)
Branch: `feature/49-show-another-spotlight`

## Summary

The Spotlight page gets a "Show another" button that shows a different, random art piece. Issues #4 to #57 are merged. `SpotlightPage` picks its piece once with `useState(() => getRandomArtPiece(artPieces))` (so it does not change when the page re-renders, for example when a favorite is toggled) and shows the image, the artist and the favorite button. `getRandomArtPiece(artPieces)` in `src/randomArtPiece.ts` picks with `crypto.getRandomValues`; tests control it with `mockRandomFraction` in `src/mockRandom.ts`. The next issue (#50, slideshow) will reuse "pick another piece".

## Approach

- `src/randomArtPiece.ts` (modify): `getRandomArtPiece(artPieces, excludedSlug?)`. With an `excludedSlug` it picks from the list without that piece. If that would leave nothing (only one piece), it falls back to the full list, so it never returns `undefined`. Without the second argument it behaves exactly as before.
- `src/components/SpotlightPage.tsx` (modify): the piece stays in `useState`, now with its setter. A button "Show another" calls `setArtPiece(getRandomArtPiece(artPieces, artPiece.slug))`. The button is rendered only when there is more than one art piece. It sits below the figure; the favorite button stays in the figure and always belongs to the shown piece.
- No CSS change; no change to `App.tsx`.

## AC coverage

| AC                                                                           | Change                                 | Test                                                                                                                                                                                                                                                                                                  |
| ---------------------------------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The Spotlight page has a button labeled "Show another"                       | button in `SpotlightPage`              | `SpotlightPage.test.tsx`: a button named "Show another" with several pieces; `App.test.tsx`: it is on `/`                                                                                                                                                                                             |
| Clicking shows a different piece with its image, artist and favorite button  | state + `getRandomArtPiece(..., slug)` | `SpotlightPage.test.tsx`: with the random value fixed, the click changes the image, the artist and the name of the favorite button to those of another piece; the heart shows the favorite status of the new piece                                                                                    |
| The new piece is never the one shown right now, as long as there are several | exclusion                              | `randomArtPiece.test.ts`: with an excluded slug, every random fraction (0, 0.25, 0.5, 0.75, 0.999) gives another piece; `SpotlightPage.test.tsx`: repeated clicks with different random values never show the same piece twice in a row; with exactly two pieces the click always gives the other one |
| With only one art piece the button is not displayed                          | `artPieces.length > 1`                 | `SpotlightPage.test.tsx`: one piece, no "Show another" button                                                                                                                                                                                                                                         |
| Marking the displayed piece as favorite does not change it                   | the piece stays in state               | `SpotlightPage.test.tsx`: after "Show another" a re-render with a changed favorite status keeps the same piece; `App.test.tsx`: click "Show another", mark the piece as favorite, the same piece is still shown and the counter says "Favorites (1)"                                                  |
| (task) random selection that can exclude one piece                           | `getRandomArtPiece`                    | `randomArtPiece.test.ts`: exclusion, fallback with one piece, unknown slug is ignored, the old behavior without the argument                                                                                                                                                                          |
| (task) spotlight piece as state the button can change                        | `SpotlightPage`                        | rows above                                                                                                                                                                                                                                                                                            |
| (note) the button exists only on the Spotlight                               | `SpotlightPage` only                   | `App.test.tsx`: no "Show another" button on `/art-pieces` and `/favorites`                                                                                                                                                                                                                            |

## Changes to existing tests (approved)

Two tests that are already on `main`, both in `SpotlightPage.test.tsx`, use a button query without a name. With a second button on the page they no longer match exactly one button:

- "shows a favorite button for the selected art piece": `expect(screen.getAllByRole("button")).toHaveLength(1)` becomes `screen.getAllByRole("button", { name: /^Favorite / })`, still expecting one.
- "reports the slug of the selected art piece when the button is clicked": `screen.getByRole("button")` becomes `screen.getByRole("button", { name: /^Favorite / })`.

Their intent (there is one favorite button, and it reports the slug) and their assertions stay the same; only the query now says which button is meant. The existing tests in `randomArtPiece.test.ts` and the App tests that use the favorite button by name are not changed.

## Files to change

- `src/randomArtPiece.ts` (modify) + `src/randomArtPiece.test.ts` (modify, new tests only).
- `src/components/SpotlightPage.tsx` (modify) + `src/components/SpotlightPage.test.tsx` (modify: the two queries above and new tests).
- `src/App.test.tsx` (modify, new tests only).

## Out of scope

The slideshow (issue #50), announcing the change to screen readers with a live region (the slideshow issue plans that), an animation, remembering earlier pieces so they do not come back soon, a keyboard shortcut, showing the title, changing the Gallery or the Favorites pages.

## Resolved decisions

1. The piece is chosen from the list without the current one, as the issue's hint says; with only one piece the function returns that piece and the button is not shown.
2. The button is below the figure, so the favorite button stays the only button inside it.
3. The button keeps its place in the page, so the keyboard focus stays on it after a click.

## Notes

- Random values are controlled with the existing `mockRandomFraction` helper (it uses `crypto.getRandomValues`, not `Math.random`).
- Mutation checks at the end, each must make a test fail: not excluding the current piece; showing the button with only one piece; not updating the state on click; excluding by position instead of by slug; showing the button on another page.

## Verification

`npm run test:run`, `npm run lint`, `npm run format:check`, `npm run check`, `npm run build`; then `npm run dev`: open `/`, click "Show another" several times, and a different painting appears every time, never the same twice in a row; mark one as favorite and it stays; the counter in the navigation follows; the other pages have no such button.
