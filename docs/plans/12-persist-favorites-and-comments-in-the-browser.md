# Plan: Issue #12 – Bonus: Persist Favorites and Comments in the Browser

Issue: #12 "12: Bonus - Persist Favorites and Comments in the Browser" (https://github.com/RukiDV/Art_Gallery_App/issues/12)
Branch: `feature/12-persist-favorites-and-comments-in-the-browser`

## Summary

Favorites and comments live in `useState` in `App.tsx` (`artPiecesInfo: ArtPieceInfo[]`, entries `{ slug, isFavorite, comments }`) and are lost on reload. They should be saved in `localStorage`, and with nothing stored the app must still work. Issues #4 to #11 are merged. The art pieces themselves keep coming from the API; only `artPiecesInfo` is stored.

## Approach

- `src/storage.ts` (new): `STORAGE_KEY = "art-pieces-info"`, `loadArtPiecesInfo(): ArtPieceInfo[]` and `saveArtPiecesInfo(info: ArtPieceInfo[]): void`.
  - `load`: reads the key. `null` gives `[]`. It parses with `JSON.parse` into `unknown` and returns the value only if it is an array, otherwise `[]`. Invalid JSON or an unavailable `localStorage` (the call throws) also gives `[]`, never a crash.
  - `save`: `localStorage.setItem(key, JSON.stringify(info))`. A thrown error (storage full or blocked) is swallowed so the app keeps working in memory.
- `src/App.tsx`: `useState<ArtPieceInfo[]>(loadArtPiecesInfo)` (read once, lazily) and `useEffect(() => saveArtPiecesInfo(artPiecesInfo), [artPiecesInfo])`. Nothing else changes: `isFavorite`, `toggleFavorite`, `getComments` and `addComment` keep working on the same state.
- `src/setupTests.ts`: add `afterEach(() => localStorage.clear())` so stored data from one test never leaks into the next (the existing App tests assume an empty start).

## AC coverage

| AC                                                        | Change                                                  | Test                                                                                                                                                                                                                                                                                           |
| --------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Favorite flags and comments persist across reloads        | `loadArtPiecesInfo` as lazy initial state + save effect | `storage.test.ts`: `save` then `load` returns the same data (favorite and comment); `App.test.tsx`: mark a favorite and add a comment, unmount and render `App` again (a reload), the heart is pressed on the gallery and details page, the comment is shown, and `/favorites` lists the piece |
| Unmarking a favorite persists too                         | save effect on every change                             | `App.test.tsx`: favorite, unfavorite, remount: not pressed                                                                                                                                                                                                                                     |
| Without any data in the local storage the app still works | `null` gives `[]`                                       | `storage.test.ts`: empty storage returns `[]`; `App.test.tsx`: fresh render with empty storage shows the gallery with no favorites                                                                                                                                                             |
| (robustness) bad or unavailable storage                   | try/catch + array check                                 | `storage.test.ts`: invalid JSON gives `[]`, valid JSON that is not an array gives `[]`, `getItem` throwing gives `[]`, `setItem` throwing does not throw; `App.test.tsx`: app renders when storage contains garbage                                                                            |
| (task) use `localStorage` for favorites and comments      | `storage.ts`                                            | rows above                                                                                                                                                                                                                                                                                     |

Existing tests keep their assertions; they only gain the per-test storage cleanup.

## Files to change

- `src/storage.ts` + `src/storage.test.ts` (new): load and save helpers.
- `src/App.tsx` (modify): lazy initial state and save effect.
- `src/App.test.tsx` (modify): persistence integration tests.
- `src/setupTests.ts` (modify): clear `localStorage` after each test.

## Out of scope

Syncing between tabs (`storage` event), versioning or migrating stored data, deep validation of stored entries, persisting the fetched art pieces, a "clear data" button, deleting comments, storing anything other than favorites and comments.

## Resolved decisions

1. Defensive loading: missing, invalid or non-array data and a throwing `localStorage` all fall back to an empty list; failed saves are ignored.
2. Storage code lives in its own small module `src/storage.ts` so it can be unit-tested without rendering `App`.

## Notes

- Saving runs on the first render too, so an empty list `[]` is written when nothing was stored; that is harmless.
- Stored dates are ISO strings, so `JSON.stringify` and `JSON.parse` round-trip comments without conversion.
- Tests simulate a reload by unmounting and rendering `App` again in the same jsdom `localStorage`.

## Verification

`npm run test:run`, `npm run lint`, `npm run format:check`, `npm run check`, `npm run build`; then `npm run dev`: favorite a few pieces and add a comment, reload the page (also open `/favorites` directly), and everything is still there; clear the site data in the browser and the app works with no favorites.
