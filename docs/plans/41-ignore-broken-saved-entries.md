# Plan: Issue #41 – Bonus: Ignore Broken Entries in the Saved Favorites and Comments

Issue: #41 "Bonus - Ignore Broken Entries in the Saved Favorites and Comments" (https://github.com/RukiDV/Art_Gallery_App/issues/41)
Branch: `feature/41-ignore-broken-saved-entries`

## Summary

`loadArtPiecesInfo` in `src/storage.ts` returns the parsed value as soon as `Array.isArray` is true. A valid list with broken entries (`[null]`, `[1]`, an entry with a wrong-typed property) then crashes `App` in `isFavorite`, `getComments` and `updateInfo` (`info.slug` on `null`), which shows a blank page. Missing, invalid, non-list and unreadable storage already fall back to `[]` (#12). Issues #4 to #40 are merged. The stored shape is `ArtPieceInfo = { slug: string; isFavorite: boolean; comments: ArtPieceComment[] }` with `ArtPieceComment = { text: string; date: string }` (`src/types.ts`).

## Approach

- `src/storage.ts`: add type guards and filter on load.
  - `isRecord(value: unknown): value is Record<string, unknown>` (non-null object).
  - `isArtPieceComment(value: unknown): value is ArtPieceComment` (record with string `text` and string `date`).
  - `isArtPieceInfo(value: unknown): value is ArtPieceInfo` (record with string `slug`, boolean `isFavorite`, and `comments` an array whose items all satisfy `isArtPieceComment`).
  - `loadArtPiecesInfo`: `return Array.isArray(parsedValue) ? parsedValue.filter(isArtPieceInfo) : []`. The existing `try/catch`, `null` and non-list handling stay as they are.
- A broken entry is dropped as a whole (as the issue words it: "Broken entries ... are ignored"), including an entry that has one broken comment. Valid entries in the same list are kept untouched.
- No change to `App.tsx` or `saveArtPiecesInfo`: the next save replaces the stored list with the cleaned state.

## AC coverage

| AC                                                                                                                                                | Change                                   | Test                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A saved list with broken entries does not crash the app: the Gallery page still renders                                                           | filter in `loadArtPiecesInfo`            | `App.test.tsx`: storage holds `[null, 1, <valid entry>]`; the gallery renders both art pieces                                                                                                                             |
| Broken entries are ignored (not an object, no text `slug`, no boolean `isFavorite`, no list `comments`, a comment without text `text` and `date`) | `isArtPieceInfo` and `isArtPieceComment` | `storage.test.ts`: `it.each` over `null`, `1`, `"text"`, `[]`, an entry with a missing or wrong-typed `slug`, `isFavorite` and `comments`, and a comment with a missing or wrong-typed `text` and `date`: each gives `[]` |
| Valid entries in the same list are kept (favorites and comments still shown)                                                                      | filter keeps valid entries as they are   | `storage.test.ts`: a list mixing valid and broken entries returns exactly the valid ones; `App.test.tsx`: the valid entry's favorite is pressed and its comment is shown on the details page                              |
| A list with only valid entries behaves exactly as before                                                                                          | filter keeps every valid entry           | existing `storage.test.ts` round-trip test and the existing persistence tests in `App.test.tsx` stay green and unchanged                                                                                                  |

## Files to change

- `src/storage.ts` (modify): type guards and the filter.
- `src/storage.test.ts` (modify): new tests only.
- `src/App.test.tsx` (modify): one new test with a mixed list in the local storage (new test only).

## Out of scope

Repairing or migrating old data, telling the user about ignored entries, deleting broken entries from the storage by themselves (the next save overwrites them), validating dates, removing duplicate slugs, keeping the valid comments of an entry that also has a broken comment, changes to `App.tsx`.

## Resolved decisions

1. An entry with any broken comment is dropped entirely (the issue's wording), instead of keeping the entry and filtering only the comment.

## Notes

- Mutation check for the new tests: temporarily return the parsed list without `.filter(...)` (the current behavior). The new tests must fail and the existing ones pass; then restore `storage.ts`.
- New tests are red first in the normal way: the current code returns broken entries, so the `storage.test.ts` cases fail before the guards exist.
- `JSON.parse` returns `any`; the value stays `unknown` until a guard narrows it, so no `any` is written.

## Verification

`npm run test:run`, `npm run lint`, `npm run format:check`, `npm run check`, `npm run build`; then `npm run dev`: in the browser console run `localStorage.setItem("art-pieces-info", "[null, 1]")` and reload, and the gallery renders with no blank page; then `localStorage.setItem("art-pieces-info", JSON.stringify([null, {slug: "the-harvesters", isFavorite: true, comments: []}]))` and reload, and that piece shows as a favorite.
