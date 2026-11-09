# Plan: Issue #8 – Mark Art Pieces as Favorites

Issue: #8 "8: Mark Art Pieces as Favorites" (https://github.com/RukiDV/Art_Gallery_App/issues/8)
Branch: `feature/8-mark-art-pieces-as-favorites`

## Summary

A reusable favorite button on the Gallery list, the Spotlight page and the Details page. Clicking toggles the favorite status with a visual indication, and favorites are highlighted. Issues #4 to #7 are merged. Currently `App.tsx` owns the data (`useSWR`), the `withArtPieces` helper and all routes. `ArtPieceList` renders `ArtPiecePreview` (`<figure className="art-piece">` with a `Link`), `SpotlightPage` is `<figure className="art-piece spotlight">` and picks once via `useState`, and `ArtPieceDetailsPage` is `<article className="details">`. `styles.css` already has `.favorite-button` (absolute, top-right of `.art-piece`) and `.favorite-button[aria-pressed="true"]` (pink). `.art-piece` is `position: relative`, `.details` is not.

## Approach

- `src/types.ts`: add `ArtPieceInfo = { slug: string; isFavorite: boolean }` (per the issue hint; the fetched art pieces are not changed).
- `src/App.tsx`: `useState<ArtPieceInfo[]>([])`. `isFavorite(slug)` is true only if an entry with that slug has `isFavorite: true`. `toggleFavorite(slug)` flips an existing entry or adds `{ slug, isFavorite: true }`. Both are passed to the three pages as props `isFavorite` and `onToggleFavorite`.
- `src/components/FavoriteButton.tsx` (new): props `artPieceName`, `isFavorite`, `onToggle`. A `<button type="button" className="favorite-button" aria-pressed={isFavorite} aria-label={`Favorite ${artPieceName}`}>` containing an inline SVG heart (`fill="currentColor"` when favorite, `fill="none"` otherwise, `aria-hidden`). The existing CSS gives the pink highlight when `aria-pressed="true"`.
- `ArtPieceList` and `ArtPiecePreview`: take `isFavorite` and `onToggleFavorite`; the button is a sibling of the `Link` inside the `<figure>` (not nested in the link).
- `SpotlightPage` and `ArtPieceDetailsPage`: take the same props and render the button.
- `src/styles.css`: add `position: relative` to `.details` so the absolutely positioned button anchors to the details article (the only CSS change).

## AC coverage

| AC                                                       | Change                                       | Test                                                                                                                                                                    |
| -------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button on each entry in the list                         | `ArtPiecePreview`                            | `ArtPieceList.test.tsx`: one favorite button per piece (role `button`, name `Favorite <name>`)                                                                          |
| Button on the details view                               | `ArtPieceDetailsPage`                        | `ArtPieceDetailsPage.test.tsx`: button named for that piece                                                                                                             |
| Button on the spotlight view                             | `SpotlightPage`                              | `SpotlightPage.test.tsx`: button named for the spotlighted piece                                                                                                        |
| Clicking a non-favorite saves it, with visual indication | `FavoriteButton` + `App` state               | `FavoriteButton.test.tsx`: click calls `onToggle`; `aria-pressed` false then true when `isFavorite` flips; `App.test.tsx`: click in the gallery, button becomes pressed |
| Clicking a favorite removes it, with visual indication   | same                                         | `App.test.tsx`: second click, button not pressed again                                                                                                                  |
| Favorites visually highlighted                           | `aria-pressed="true"` styling + filled heart | `FavoriteButton.test.tsx`: pressed state when `isFavorite`; `App.test.tsx`: only the clicked piece is pressed                                                           |
| (task) status shared across pages                        | state in `App`                               | `App.test.tsx`: favorite a piece in the gallery, open its details via the link: the button is pressed there; the Spotlight keeps its piece when toggled                 |

Existing tests keep their assertions; they only get the new required props.

## Files to change

- `src/types.ts` (modify): `ArtPieceInfo`.
- `src/components/FavoriteButton.tsx` + `FavoriteButton.test.tsx` (new): reusable button.
- `src/components/ArtPiecePreview.tsx`, `ArtPieceList.tsx` (modify) + their tests: props and button.
- `src/components/SpotlightPage.tsx`, `ArtPieceDetailsPage.tsx` (modify) + their tests: props and button.
- `src/App.tsx` (modify) + `src/App.test.tsx` (modify): favorites state, props, integration tests.
- `src/styles.css` (modify): `.details { position: relative }`.

## Out of scope

Favorites page and a favorites link in the navigation (#9), persisting favorites in the browser (#12), comments (#10), color palette (#11), the favorites counter idea, `lucide-react`, animations, undo, changing the fetched art pieces.

## Resolved decisions

1. The heart is an inline SVG inside `FavoriteButton`, no new dependency.

## Notes

- The new required props mean existing component tests get default props in their render helpers; no assertion is weakened.
- Toggling re-renders `App`, but `SpotlightPage` keeps its random piece because it picks once in a `useState` initializer; a test covers this.
- The button's accessible name stays constant (`Favorite <name>`) and the state is exposed with `aria-pressed`.

## Verification

`npm run test:run`, `npm run lint`, `npm run format:check`, `npm run check`, `npm run build`; then `npm run dev`: the heart shows on gallery cards, the spotlight and the details page; clicking fills it and turns it pink; the state is the same on all pages; reloading resets favorites (persistence is #12).
