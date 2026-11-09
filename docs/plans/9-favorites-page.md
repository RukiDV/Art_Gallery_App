# Plan: Issue #9 – Favorites Page

Issue: #9 "9: Favorites Page" (https://github.com/RukiDV/Art_Gallery_App/issues/9)
Branch: `feature/9-favorites-page`

## Summary

A "Favorites" navigation link and a page at `/favorites` listing only the favorite art pieces, each with image, title, artist and an active favorite button. Issues #4 to #8 are merged. `App.tsx` holds the `artPiecesInfo` state with `isFavorite(slug)` and `toggleFavorite(slug)` and renders the routes `/`, `/art-pieces`, `/art-pieces/:slug` and `*` through `withArtPieces`. `ArtPieceList` (props `artPieces`, `isFavorite`, `onToggleFavorite`) already renders previews with image, title, artist and `FavoriteButton`. `Navigation` has `NavLink`s "Spotlight" (`end`) and "Gallery". `styles.css` styles the nav (flex, centered, gap), so a third link needs no CSS.

## Approach

- `src/components/FavoritesPage.tsx` (new): props `artPieces` (all pieces), `isFavorite`, `onToggleFavorite`. Filters with `artPieces.filter((piece) => isFavorite(piece.slug))`. With no favorites it renders `<p>No favorites yet</p>`. Otherwise it reuses `ArtPieceList` with the filtered pieces (task: reuse an existing component), so every entry shows image, title, artist and a pressed favorite button.
- `src/components/Navigation.tsx`: add `<NavLink to="/favorites">Favorites</NavLink>` after Gallery.
- `src/App.tsx`: add `<Route path="/favorites" element={withArtPieces(...)} />` rendering `FavoritesPage`, before `*`.
- Unfavoriting on the Favorites page removes the piece from the list right away (the state lives in `App`).

## AC coverage

| AC                                                            | Change                            | Test                                                                                                                                                                    |
| ------------------------------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Link "Favorites" displayed                                    | `Navigation`                      | `Navigation.test.tsx`: link "Favorites" with `href="/favorites"`; highlighted (`aria-current`, `active`) on `/favorites` only                                           |
| Clicking "Favorites" shows the Favorites page on `/favorites` | `App` route + `Navigation`        | `App.test.tsx`: click "Favorites" in the nav, the page for `/favorites` is shown; starting at `/favorites` also works                                                   |
| Only favorite art pieces in a list                            | `FavoritesPage`                   | `FavoritesPage.test.tsx`: role `list`, only favorite pieces as `listitem`; `App.test.tsx`: favorite one piece in the gallery, open Favorites, only that piece is listed |
| Image, title, artist displayed                                | reused `ArtPieceList`             | `FavoritesPage.test.tsx`: image, title and artist of a favorite are visible                                                                                             |
| Active favorite button on each piece                          | `ArtPieceList` / `FavoriteButton` | `FavoritesPage.test.tsx`: each button has `aria-pressed="true"`; `App.test.tsx`: clicking it removes the piece from the list                                            |
| (task) reuse an existing component                            | `ArtPieceList`                    | covered by the rows above                                                                                                                                               |
| (decision) empty state                                        | `FavoritesPage`                   | `FavoritesPage.test.tsx` and `App.test.tsx`: "No favorites yet" when nothing is favorited                                                                               |

Existing tests keep their assertions.

## Files to change

- `src/components/FavoritesPage.tsx` + `FavoritesPage.test.tsx` (new): filtered list and empty state.
- `src/components/Navigation.tsx` (modify) + `Navigation.test.tsx` (modify): third link; new tests only.
- `src/App.tsx` (modify) + `src/App.test.tsx` (modify): route and integration tests.

## Out of scope

Persisting favorites (#12), a favorites counter in the nav (idea), comments (#10), color palette (#11), links from the empty state to the gallery, sorting or filtering, style changes.

## Resolved decisions

1. Empty state: a short "No favorites yet" message (small `FavoritesPage` component).

## Notes

- The "navigation exactly once" tests and the existing highlight tests are unaffected by a third link.
- The Favorites route uses `withArtPieces`, so loading and error states behave like the other data routes.

## Verification

`npm run test:run`, `npm run lint`, `npm run format:check`, `npm run check`, `npm run build`; then `npm run dev`: favorite a few pieces, open Favorites from the nav (link highlighted), only favorites show with image, title, artist and a pink heart; clicking the heart removes the piece; with none favorited the message appears.
