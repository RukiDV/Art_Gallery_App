# Plan: Issue #53 – Bonus: Comment Edit History

Issue: #53 "23: Bonus - Comment Edit History" (https://github.com/RukiDV/Art_Gallery_App/issues/53)
Branch: `feature/53-comment-edit-history`

## Summary

Clicking the "edited" label of an edited comment shows the earlier versions of that comment. Issue #44 is merged, so `ArtPieceComment = { id, text, date, edited? }`. `editComment(slug, commentId, text)` in `App.tsx` replaces the text and sets `edited: true`. `CommentItem` shows `<time>`, then a decorative dot and `<span className="comment-edited">edited</span>` inside `p.comment-meta`; it owns the edit state and gives focus back to the Edit button after the form closes. `storage.ts` validates saved comments (`isStoredComment`) and drops a whole entry when a comment field has a wrong type (the #41, #43 and #44 rule). The earlier text of an edited comment is lost today. Issues #4 to #52 are merged.

## Approach

- `src/types.ts`: new `ArtPieceCommentVersion = { text: string; replacedAt: string }` (ISO date) and an optional `history?: ArtPieceCommentVersion[]` on `ArtPieceComment`.
- `src/storage.ts`: `StoredComment` gets `history?: ArtPieceCommentVersion[]`. New guard `isStoredVersion` (record with string `text` and string `replacedAt`); `isStoredComment` accepts `history` that is undefined or an array of valid versions. A wrong shape makes the whole entry broken (same rule as the other fields). `withCommentIds` already spreads the comment, so `history` is kept.
- `src/App.tsx`: `editComment` computes `replacedAt = new Date().toISOString()` once and, for the matching comment, appends `{ text: <old text>, replacedAt }` to `history` (`[...(comment.history ?? []), version]`) before setting the new `text` and `edited: true`. `id` and `date` stay as they are. Nothing is added when the text did not change, because `CommentItem` does not call `onEdit` then (#44).
- `src/components/CommentHistory.tsx` (new): props `history` (the versions). With versions: an ordered list (oldest first, `aria-label="Earlier versions"`), each item showing the old text and `Replaced <time dateTime>` in the small grey style. Without versions: the text "No earlier versions saved".
- `src/components/CommentItem.tsx`: the `edited` label becomes a `<button type="button" className="comment-edited" aria-expanded aria-controls>` (aria-controls only while open). Clicking toggles `isOpen` (state of that single comment). When open, `CommentHistory` is shown below the meta line in an element with an `id`. The visible text stays exactly "edited". A comment without `edited` has no button.
- `src/styles.css`: `.comment-edited` reset to look like the date text (no button chrome, inherit font and colour) plus a dotted underline, a pointer and a darker colour on hover, so it is quiet but clearly clickable. Markup and CSS only; checked in the browser.

## AC coverage

| AC                                                                                                            | Change                                                | Test                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| On an edited comment "edited" is a button; clicking shows the earlier versions below it; clicking hides them  | `CommentItem` toggle + `CommentHistory`               | `Comments.test.tsx`: an edited comment has a button named "edited" with `aria-expanded="false"`; click shows the versions and sets `aria-expanded="true"`; a second click hides them |
| Each earlier version shows its text and when it was replaced                                                  | `CommentHistory`                                      | `CommentHistory.test.tsx`: the text and a `<time>` with `toLocaleString()` of `replacedAt` and its `datetime` attribute                                                              |
| Versions listed oldest first; the current text is not in the list                                             | `CommentHistory` keeps the stored order               | `CommentHistory.test.tsx`: versions appear in stored order; `Comments.test.tsx`: the current text appears once (as the comment), not in the list                                     |
| Every saved edit with a changed text adds exactly one version; Cancel, empty text and unchanged Save add none | `editComment` appends once                            | `App.test.tsx`: two edits give two versions in order (fake timers fix the times); Cancel, empty and unchanged Save add no version                                                    |
| Versions are still there after a reload                                                                       | existing save effect + `storage.ts` accepts `history` | `App.test.tsx`: edit, unmount, render again, open the history: the old text is listed; `storage.test.ts`: a comment with `history` round-trips                                       |
| Comments edited before this change still work and say "No earlier versions saved"                             | `history ?? []`, empty state in `CommentHistory`      | `storage.test.ts`: `edited: true` without `history` loads; `App.test.tsx`: a stored legacy comment shows the button and opening says "No earlier versions saved"                     |
| A never-edited comment has no label and no button                                                             | `comment.edited &&`                                   | `Comments.test.tsx`: no button named "edited"                                                                                                                                        |
| Deleting a comment deletes its versions; other comments' versions are unchanged                               | `history` is part of the comment                      | `App.test.tsx`: two edited comments, delete one, the other still shows its versions                                                                                                  |
| Keyboard use, `aria-expanded`, focus stays on the button                                                      | real `<button>`, no focus handling on toggle          | `Comments.test.tsx`: Tab reaches the button, Enter toggles, `aria-expanded` follows, the button keeps focus after the click                                                          |
| (task) type and storage check for the list of versions                                                        | `types.ts`, `storage.ts`                              | `storage.test.ts`: a `history` of a wrong shape (not a list, a version without `text` or `replacedAt`, wrong types) makes the entry broken; a valid history is kept                  |
| (task) add the old text and time in `App`                                                                     | `editComment`                                         | rows above                                                                                                                                                                           |
| (task) toggle button and list component                                                                       | `CommentItem`, `CommentHistory`                       | rows above                                                                                                                                                                           |
| (task) quiet but clickable style                                                                              | `styles.css`                                          | manual check in the browser (jsdom has no layout)                                                                                                                                    |

Existing assertions stay unchanged. Where an existing test looks up the "edited" label by text, the text is still exactly "edited" (see Notes).

## Files to change

- `src/types.ts` (modify): version type and optional `history`.
- `src/storage.ts` (modify) + `src/storage.test.ts` (modify): accept and validate `history`; new tests only.
- `src/App.tsx` (modify) + `src/App.test.tsx` (modify): append the old version in `editComment`; integration tests.
- `src/components/CommentHistory.tsx` + `CommentHistory.test.tsx` (new): the list and the empty state.
- `src/components/CommentItem.tsx` (modify) + `Comments.test.tsx` (modify): the toggle button and the open state; new tests.
- `src/styles.css` (modify): the quiet-but-clickable label style.

## Out of scope

Restoring an earlier version, highlighting what changed between two versions, deleting a single version, a limit on the number of versions, a popup or modal, showing the history of comments that were never edited, repairing duplicate ids, changing the Edit form.

## Resolved decisions

1. Each version stores its old `text` and `replacedAt` (when it was replaced). The comment's own `date` stays the original posting time.
2. The `edited` flag stays as it is and `history` is added next to it, so comments edited before this feature still load; for them the list says "No earlier versions saved".
3. The history opens inline below the comment (not a popup), oldest version first, as the issue says.
4. A `history` of the wrong shape makes the whole entry broken (the #41, #43 and #44 rule).
5. The accessible name of the toggle is its visible text "edited"; `aria-expanded` tells screen readers whether the list is open.

## Notes

- Existing tests find the label with `getByText("edited")` / `getAllByText("edited")` and check it is not `aria-hidden`; a `<button>` with the text "edited" still satisfies them. `getAllByRole("button", { name: /^Edit/ })` is case sensitive and does not match "edited".
- Nested lists: the history list sits inside the comment's `<li>`. Existing App tests that pick comment items with `listitem` filtered by `<time>` never open a history, so they are unaffected; new tests that open it select the history list by its role and name.
- Mutation checks at the end, each must make a test fail: not appending the old version; storing the new text instead of the old one; prepending instead of appending; `storage.ts` rejecting `history`; a toggle button whose `aria-expanded` does not follow; showing a button on a never-edited comment.

## Verification

`npm run test:run`, `npm run lint`, `npm run format:check`, `npm run check`, `npm run build`; then `npm run dev`: add a comment, edit it twice, click "edited", and two earlier versions appear, oldest first, each with the time it was replaced; click again, and they hide; reload, and they are still there; delete the comment, and it is gone; an old comment edited before this change shows "No earlier versions saved". Check the look of the label (quiet, dotted underline, hover) and that the keyboard works.
