# Plan: Issue #43 – Bonus: Delete a Comment

Issue: #43 "15: Bonus - Delete a Comment" (https://github.com/RukiDV/Art_Gallery_App/issues/43)
Branch: `feature/43-delete-a-comment`

## Summary

Each comment gets a "Delete" button that removes exactly that comment. Comments are `ArtPieceComment = { text, date }` in `ArtPieceInfo.comments`, held in `App` state (`artPiecesInfo`), listed by `Comments` (keyed by `date-index`) and saved in `localStorage` by `src/storage.ts`. `loadArtPiecesInfo` keeps only entries that pass `isArtPieceInfo` (#41), and that guard drops a whole entry if any comment is not `{ text: string, date: string }`. Comments already saved by users have no `id`, so a naive `id` requirement would drop all of them on the next load. Issues #4 to #42 are merged.

## Approach

- `src/types.ts`: `ArtPieceComment` gets `id: string`.
- `src/App.tsx`: `addComment` creates `{ id: crypto.randomUUID(), text, date }`. New `deleteComment(slug, commentId)` uses `updateInfo` and `comments.filter((comment) => comment.id !== commentId)`. It is passed to `ArtPieceDetailsPage` as `onDeleteComment(slug, id)`.
- `src/storage.ts`: loading accepts a comment whose `id` is missing or a string (text and date still required strings; a non-string `id` counts as broken) and returns every comment with an id: a missing id is filled with `crypto.randomUUID()`. The existing save effect writes the new ids right after the first render, so they stay stable. Broken entries are still dropped as in #41.
- `src/components/Comments.tsx`: new prop `onDeleteComment(id)`. Each `<li>` gets a button of type `button` with `aria-label` "Delete comment: <text>" and the visible text "Delete" (the longer accessible name tells the buttons apart and starts with the visible text). The list is keyed by `comment.id`.
- `src/components/ArtPieceDetailsPage.tsx`: new prop `onDeleteComment(slug, id)`; passes `(id) => onDeleteComment(artPiece.slug, id)` to `Comments`.

## AC coverage

| AC                                                                     | Change                               | Test                                                                                                                                                                                                                                                                      |
| ---------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Each comment has a "Delete" button                                     | `Comments`                           | `Comments.test.tsx`: one button per comment, with visible text "Delete"                                                                                                                                                                                                   |
| Clicking "Delete" removes this comment only, also with equal texts     | `deleteComment` filters by `id`      | `App.test.tsx`: add two comments with the same text, delete the second: one remains (the first, by date); `Comments.test.tsx`: click reports the `id` of that comment                                                                                                     |
| Comments of other art pieces are not changed                           | `updateInfo` per slug                | `App.test.tsx`: comment on piece A and on piece B, delete A's, B's is still there                                                                                                                                                                                         |
| After the last comment is deleted the section and form still work      | `Comments` heading and `CommentForm` | `App.test.tsx`: delete the only comment, the "Comments" heading and the form are shown, a new comment can be added                                                                                                                                                        |
| The deleted comment stays deleted after a reload                       | existing save effect                 | `App.test.tsx`: delete, unmount, render `App` again, the comment is gone                                                                                                                                                                                                  |
| Comments saved before this change (no `id`) still load and get an `id` | `storage.ts` normalization           | `storage.test.ts`: a stored comment without `id` loads with a non-empty string `id` and the same text and date; a stored `id` is kept; a comment with a non-string `id` makes its entry broken; `App.test.tsx`: a stored comment without `id` is shown and can be deleted |
| (task) unique `id` and extended type                                   | `types.ts`, `addComment`             | `App.test.tsx`: the unique-delete test above; `crypto.randomUUID` is mocked where an exact id matters                                                                                                                                                                     |
| (task) delete function for one comment of one art piece                | `deleteComment`                      | rows above                                                                                                                                                                                                                                                                |

Existing assertions stay unchanged; existing fixtures only gain the new required `id` (see Notes).

## Files to change

- `src/types.ts` (modify): `id` on the comment type.
- `src/storage.ts` (modify) + `src/storage.test.ts` (modify): accept and fill ids; new tests, fixtures get ids.
- `src/components/Comments.tsx` (modify) + `Comments.test.tsx` (modify): delete button; fixtures get ids; new tests.
- `src/components/ArtPieceDetailsPage.tsx` (modify) + `ArtPieceDetailsPage.test.tsx` (modify): pass the callback; fixtures get ids; one new test.
- `src/App.tsx` (modify) + `src/App.test.tsx` (modify): `id` in `addComment`, `deleteComment`, integration tests.

## Out of scope

A confirmation question before deleting, undo, deleting all comments at once, editing comments (issue #44), removing duplicate ids from hand-edited storage, changing the comment layout or styles beyond the button, a visual check of the button (done in the browser).

## Resolved decisions

1. The visible label is "Delete" (as in the issue); the accessible name is "Delete comment: <text>" so screen-reader users can tell the buttons apart. Tests find buttons by `name: /^Delete/`.
2. A saved comment without an `id` gets a new random `id` on load; the next save writes it. A saved `id` that is not a string makes the entry broken (the #41 rule).

## Notes

- Existing fixtures in `storage.test.ts`, `Comments.test.tsx` and `ArtPieceDetailsPage.test.tsx` need an `id` because the type requires it. In `storage.test.ts` this also keeps the existing round-trip assertion true: without ids in the fixtures, loading would add ids and `toEqual` would differ. No assertion is changed.
- Tests that need a known id mock `crypto.randomUUID` (`vi.spyOn(crypto, "randomUUID")`), like `mockRandomFraction` does for `getRandomValues`; if used more than once, a small shared test helper next to `mockRandom.ts` is acceptable.
- Mutation checks at the end: deleting by index instead of by `id`, and not filling the missing `id` in `storage.ts`, must each make a test fail.

## Verification

`npm run test:run`, `npm run lint`, `npm run format:check`, `npm run check`, `npm run build`; then `npm run dev`: add three comments (two with the same text) to a piece, delete the middle one, and only it disappears; reload, and it is still gone; delete the last comment, and the form still works; other pieces keep their comments. In the console, store an old-format comment (without `id`) and reload: it shows and can be deleted.
