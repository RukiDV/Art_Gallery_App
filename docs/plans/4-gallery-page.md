# Plan: Issue #4 – Gallery Page

Issue: #4 "4: Gallery Page" (https://github.com/RukiDV/Art_Gallery_App/issues/4)
Branch: `feature/4-gallery-page`

## Summary

Users see all art pieces (image, title, artist) as a list at `/art-pieces`. The art pieces are fetched once in `App.tsx` with `useSWR` and passed down as props, with loading and error states. The app is currently a bare starter; `src/styles.css` already has `.art-list` and `.art-piece` styles.

## Approach

- `src/types.ts`: `ArtPiece` type (`slug`, `artist`, `name`, `imageSource`; only the props used).
- `src/fetcher.ts`: `fetcher(url): Promise<ArtPiece[]>`, throws `Error` when `!response.ok`.
- `src/App.tsx`: `useSWR<ArtPiece[]>("https://example-apis.vercel.app/api/art", fetcher)`; `Routes` with `/art-pieces` rendering a gallery page that receives `artPieces`, `isLoading` and `error` as props. `/` stays unrouted.
- `src/components/ArtPieceList.tsx`: `<ul class="art-list">` of previews.
- `src/components/ArtPiecePreview.tsx`: `<li><figure class="art-piece">` with `<img alt=name>`, title and artist.
- Loading and error states shown on the gallery page.

## AC coverage

| AC                                 | Change            | Test                                                                                                  |
| ---------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------- |
| All art pieces displayed in a list | `ArtPieceList`    | `ArtPieceList.test.tsx`: role `list`, one `listitem` per piece                                        |
| Image displayed                    | `ArtPiecePreview` | role `img` with name as alt and `imageSource` as src                                                  |
| Title displayed                    | `ArtPiecePreview` | text of `name` visible                                                                                |
| Artist name displayed              | `ArtPiecePreview` | text of `artist` visible                                                                              |
| List on `/art-pieces`              | `App` routes      | `App.test.tsx`: `MemoryRouter` at `/art-pieces`, mocked fetch, pieces shown                           |
| Loading state (task)               | `App` / page      | `App.test.tsx`: loading text before data resolves                                                     |
| Error state (task)                 | fetcher + page    | `fetcher.test.ts` throws on non-ok response; `App.test.tsx` shows an error message on a failing fetch |

## Files to change

- `src/types.ts` (new): `ArtPiece` type.
- `src/fetcher.ts` (new) + `src/fetcher.test.ts`: typed fetcher that throws on non-ok.
- `src/components/ArtPieceList.tsx` + test (new): list rendering.
- `src/components/ArtPiecePreview.tsx` + test (new): single preview.
- `src/App.tsx` (modify) + `src/App.test.tsx` (new): fetch, routing, loading and error states.

## Out of scope

Spotlight (#5), navigation (#6), details page and links to it (#7), favorites (#8/#9), comments, color palette, retry button, a `/` route or redirect, SWR config tweaks, style changes.

## Resolved decisions

1. `/` stays unrouted until #5.
2. Fetch once in `App.tsx` with `useSWR` and pass data down as props (issue hint).

## Verification

`npm run test:run`, `npm run lint`, `npm run format:check`, `npm run check`, `npm run build`; then `npm run dev` and open `/art-pieces`.
