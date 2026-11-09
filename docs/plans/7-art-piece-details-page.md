# Plan: Issue #7 – Art Piece Details Page

Issue: #7 "7: Art Piece Details Page" (https://github.com/RukiDV/Art_Gallery_App/issues/7)
Branch: `feature/7-art-piece-details-page`

## Summary

Clicking an art piece in the gallery list opens `/art-pieces/:slug` with image, title, artist, year, genre, a back button to the list, and an "Art piece not found" message for unknown slugs. Issues #4 to #6 are merged. Currently `ArtPiecePreview` is a plain `<figure className="art-piece">` rendered inside `<li>` by `ArtPieceList`. `App.tsx` has the routes `/`, `/art-pieces` and `*` plus the `withArtPieces(render)` helper that shows loading and error for data routes. `types.ts` only has `slug`, `artist`, `name` and `imageSource`. `styles.css` already has `.details img` and `.art-piece` styles, and the nav's Gallery `NavLink` (no `end`) stays active on `/art-pieces/:slug`.

## Approach

- `src/types.ts`: add `year: string` and `genre: string` (the API sends both as strings), the properties now used.
- `src/components/ArtPiecePreview.tsx`: inside the `<figure>`, wrap image and caption in `<Link to={`/art-pieces/${slug}`}>`. The whole card is clickable, and the figure stays the positioning parent so the future favorite button (#8) can sit outside the link.
- `src/components/ArtPieceDetailsPage.tsx` (new): props `artPieces: ArtPiece[]`; reads `slug` with `useParams` and finds the piece. If it is missing, render `<p>Art piece not found</p>`. Otherwise render `<article className="details">` with the image (alt = name), an `h2` title, artist, year, genre and a `<Link to="/art-pieces">Back</Link>`.
- `src/App.tsx`: add `<Route path="/art-pieces/:slug" element={withArtPieces(...)} />` rendering `ArtPieceDetailsPage`, before `*`.

## AC coverage

| AC                                                        | Change                      | Test                                                                                                                                           |
| --------------------------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Clicking a piece in the list navigates to the detail page | `Link` in `ArtPiecePreview` | `ArtPiecePreview.test.tsx`: link with `href="/art-pieces/<slug>"`; `App.test.tsx`: at `/art-pieces` click the piece's link, its details appear |
| Route `/art-pieces/:slug`                                 | `App` route                 | `App.test.tsx`: start at `/art-pieces/the-harvesters`, details of that piece shown                                                             |
| Image displayed                                           | `ArtPieceDetailsPage`       | role `img` named after the piece with its `imageSource`                                                                                        |
| Title displayed                                           | same                        | heading with the piece name                                                                                                                    |
| Artist displayed                                          | same                        | artist text                                                                                                                                    |
| Year displayed                                            | same                        | year text                                                                                                                                      |
| Genre displayed                                           | same                        | genre text                                                                                                                                     |
| Back button displayed                                     | same                        | link "Back" with `href="/art-pieces"`                                                                                                          |
| Back navigates to the list                                | `App`                       | `App.test.tsx`: from details click "Back", the list of pieces is shown                                                                         |
| Unknown slug shows "Art piece not found"                  | `ArtPieceDetailsPage`       | `ArtPieceDetailsPage.test.tsx` and `App.test.tsx`: `/art-pieces/nope` shows the message, no crash                                              |

## Files to change

- `src/types.ts` (modify): `year`, `genre`.
- `src/components/ArtPiecePreview.tsx` (modify) + `ArtPiecePreview.test.tsx` (modify): link; the test's `render` is wrapped in `MemoryRouter` because `Link` needs a router. Existing assertions stay unchanged.
- `src/components/ArtPieceList.test.tsx` (modify): same `MemoryRouter` wrapper only.
- `src/components/ArtPieceDetailsPage.tsx` + `ArtPieceDetailsPage.test.tsx` (new): details view and not-found.
- `src/App.tsx` (modify) + `src/App.test.tsx` (modify): new route and navigation tests; test fixtures get `year` and `genre`.

## Out of scope

Favorite button (#8), comments (#10), color palette (#11), links from the Spotlight to details, `dimensions` and `colors` in the type, page titles, a back link inside the not-found state, retry button, style changes, history-based back (`navigate(-1)`).

## Resolved decisions

1. The back button is a `Link` to `/art-pieces` (always returns to the list).
2. The whole preview card (image, title and artist) is the link, not just the title.

## Notes

- Adding `Link` forces `MemoryRouter` wrappers in the two existing component tests; this is a setup change only, no assertion is weakened.
- Type fixtures in tests need `year` and `genre` once the type requires them.

## Verification

`npm run test:run`, `npm run lint`, `npm run format:check`, `npm run check`, `npm run build`; then `npm run dev`: gallery cards are clickable, details show all fields, Back returns to the list, `/art-pieces/xyz` shows "Art piece not found", and the nav still shows Gallery highlighted on details.
