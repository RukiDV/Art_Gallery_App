# Plan: Issue #5 – Spotlight Page

Issue: #5 "5: Spotlight Page" (https://github.com/RukiDV/Art_Gallery_App/issues/5)
Branch: `feature/5-spotlight-page`

## Summary

The homepage `/` shows one randomly chosen art piece (image + artist) as a spotlight. Issue #4 is merged: `App.tsx` fetches art pieces with `useSWR`, and a `GalleryPage` function inside it handles loading and error and renders `ArtPieceList` at `/art-pieces`. `/` is currently unrouted. The styles `.spotlight img` and `.art-piece` already exist in `src/styles.css`.

## Approach

- `src/randomArtPiece.ts`: `getRandomArtPiece(artPieces: ArtPiece[]): ArtPiece` using `Math.random` (per the MDN example in the issue).
- `src/components/SpotlightPage.tsx`: props `artPieces: ArtPiece[]`. Picks once with `useState(() => getRandomArtPiece(artPieces))` (issue hint: no re-pick on re-render). Renders `<figure className="art-piece spotlight">` with `<img alt=name>` and a `<figcaption>` showing the artist. No title text.
- `src/App.tsx` refactor: loading and error messages move out of `GalleryPage` into `App`, rendered before `<Routes>`; routes only render once `artPieces` is loaded. Routes: `/` renders `SpotlightPage`, `/art-pieces` renders `ArtPieceList`. Remove `GalleryPage`.
- Empty array: `SpotlightPage` is only mounted with loaded data; `getRandomArtPiece` is typed for a non-empty list (the API always returns pieces); no extra empty-state UI.

## AC coverage

| AC                                  | Change                                       | Test                                                                                                                                                                                            |
| ----------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| One art piece randomly selected     | `getRandomArtPiece` + `useState` initializer | `randomArtPiece.test.ts`: with `Math.random` mocked to 0, 0.5, 0.999 returns first, middle, last piece; `SpotlightPage.test.tsx`: shows exactly one piece, and the same piece after a re-render |
| Image displayed                     | `SpotlightPage`                              | role `img` named after the piece with its `imageSource`                                                                                                                                         |
| Artist name displayed               | `SpotlightPage`                              | artist text visible                                                                                                                                                                             |
| Available on `/`                    | `App` route                                  | `App.test.tsx`: `MemoryRouter` at `/`, mocked fetch, spotlight image and artist shown                                                                                                           |
| (refactor) loading/error still work | `App`                                        | existing App tests (loading, error, list on `/art-pieces`) stay green, plus loading shown on `/`                                                                                                |

## Files to change

- `src/randomArtPiece.ts` + `src/randomArtPiece.test.ts` (new): random selection.
- `src/components/SpotlightPage.tsx` + test (new): spotlight view, picks once.
- `src/App.tsx` (modify): `/` route, loading/error handled once in App, drop `GalleryPage`.
- `src/App.test.tsx` (modify): add `/` tests; existing tests are not weakened.

## Out of scope

Navigation (#6), links to the details page (#7), favorite button (#8), showing the title, "show another spotlight" (idea), retry button, style changes, empty-list UI.

## Resolved decisions

1. Loading and error are handled once in `App` (small refactor, needed so `/` and `/art-pieces` share it).
2. The spotlight shows image + artist only; the title appears only as alt text.

## Verification

`npm run test:run`, `npm run lint`, `npm run format:check`, `npm run check`, `npm run build`; then `npm run dev`: `/` shows a random piece, a reload changes it, and `/art-pieces` still works.
