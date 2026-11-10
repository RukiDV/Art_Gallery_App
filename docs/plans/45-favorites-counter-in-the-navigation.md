# Plan: Issue #45 – Bonus: Favorites Counter in the Navigation

Issue: #45 "17: Bonus - Favorites Counter in the Navigation" (https://github.com/RukiDV/Art_Gallery_App/issues/45)
Branch: `feature/45-favorites-counter-in-the-navigation`

## Summary

The navigation shows how many favorites the user has, for example "Favorites (3)". Issues #4 to #54 are merged. `Navigation` (`src/components/Navigation.tsx`) has no props and renders `NavLink`s "Spotlight", "Gallery" and "Favorites". `App.tsx` keeps `artPiecesInfo: ArtPieceInfo[]` (`slug`, `isFavorite`, `comments`) in state, loaded from and saved to `localStorage`, and renders `<Navigation />` once, outside the routes and outside the loading and error handling, so it is always visible. An entry can exist without being a favorite (for example a piece that only has comments).

## Approach

- `src/components/Navigation.tsx`: new prop `favoritesCount: number`. The favorites link text is `Favorites (${favoritesCount})` when the count is greater than 0 and `Favorites` otherwise. The number is part of the link text, so it is also the accessible name. Nothing else changes (`to="/favorites"`, highlight behavior).
- `src/App.tsx`: `const favoritesCount = artPiecesInfo.filter((info) => info.isFavorite).length;` computed on every render from the existing state (not stored separately) and passed as `<Navigation favoritesCount={favoritesCount} />`.
- No CSS change.

## AC coverage

| AC                                                                                       | Change                                | Test                                                                                                                                                                                                                                                                           |
| ---------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The navigation shows the number of favorites in the link text, so screen readers read it | `Navigation` text                     | `Navigation.test.tsx`: with `favoritesCount={3}` the link is found by the name "Favorites (3)" and keeps `href="/favorites"`; it is highlighted on `/favorites` with a count too                                                                                               |
| Without favorites, the link is labeled only "Favorites"                                  | count 0 gives plain text              | `Navigation.test.tsx`: with `favoritesCount={0}` the name is exactly "Favorites" (no "(0)")                                                                                                                                                                                    |
| The number changes right away when a favorite is added or removed, on every page         | derived from `artPiecesInfo` in `App` | `App.test.tsx`: favorite a piece in the gallery, the link reads "Favorites (1)", favorite a second one, "(2)", unfavorite one, "(1)", unfavorite the last, plain "Favorites"; the same on the details page and on the Spotlight page (favorite there, the count changes there) |
| The number survives a reload, because favorites are saved                                | existing save and load                | `App.test.tsx`: favorite, unmount, render `App` again: the link reads "Favorites (1)"; with favorites in storage and a fetch that never finishes, the link already shows the count while loading                                                                               |
| (note) entries that are not favorites must not be counted                                | filter on `isFavorite`                | `App.test.tsx`: a piece with only a comment, or an unfavorited piece, does not count                                                                                                                                                                                           |
| (task) compute from the existing state, no separate state                                | `App`                                 | covered by the rows above (the count follows every change)                                                                                                                                                                                                                     |
| (task) pass it to `Navigation`                                                           | `App`                                 | covered by the rows above                                                                                                                                                                                                                                                      |

## Approved changes to existing tests

Two existing `App.test.tsx` tests add a favorite and then find the navigation link by the exact name "Favorites". With the counter that link is named "Favorites (1)", so the exact name no longer matches. The intent (find the link to the Favorites page) stays the same, so only the query is loosened, with the user's approval through this plan:

- "lists only the art pieces marked as favorite on /favorites": `getByRole("link", { name: "Favorites" })` becomes `{ name: /^Favorites/ }`.
- "removes an art piece from /favorites when its favorite button is clicked": same change.

The other two uses (the click test and the "opened directly" test) start without favorites, so the name stays "Favorites" and they are not changed. Every existing `Navigation.test.tsx` render only gains the new required prop `favoritesCount={0}`; their assertions stay unchanged.

## Files to change

- `src/components/Navigation.tsx` (modify): the prop and the link text.
- `src/components/Navigation.test.tsx` (modify): `favoritesCount={0}` in the existing renders; new tests for the count.
- `src/App.tsx` (modify): derive and pass `favoritesCount`.
- `src/App.test.tsx` (modify): the two query changes above and the new integration tests.

## Out of scope

A badge or other styling for the number, hiding the link or the number in other cases, pluralization, counting comments, animating the change, a "99+" cap for large numbers, counting only favorites that still exist in the fetched art pieces.

## Resolved decisions

1. The count is the number of entries with `isFavorite` in the saved state, as the issue says. If the API ever removes an art piece that was marked as favorite, the count can be higher than the number of pieces on the Favorites page; this is a known limit and not handled here.
2. The count is shown as soon as the state is loaded, also while the art pieces are still loading, because the navigation does not wait for the fetch.

## Notes

- Mutation checks at the end, each must make a test fail: counting every entry instead of only favorites; showing "Favorites (0)" when there are none; hard-coding the count (so it does not follow changes).

## Verification

`npm run test:run`, `npm run lint`, `npm run format:check`, `npm run check`, `npm run build`; then `npm run dev`: with no favorites the link says "Favorites"; heart a piece on the Gallery, the Spotlight and a details page and the number follows on every page; unheart them and it goes away; reload and it is still right.
