# Plan: Issue #44 – Bonus: Edit a Comment

Issue: #44 "16: Bonus - Edit a Comment" (https://github.com/RukiDV/Art_Gallery_App/issues/44)
Branch: `feature/44-edit-a-comment`

## Summary

Users can change the text of a comment they wrote. Issue #43 is merged, so comments have an `id` (`ArtPieceComment = { id, text, date }`). `Comments` maps the list to `<li>` with text, date and a "Delete" button. `App` holds `artPiecesInfo` and has `updateInfo`, `addComment` and `deleteComment`. `CommentForm` trims and rejects empty text for new comments. `storage.ts` validates saved comments (`isStoredComment`) and drops an entry whose comment has a wrong-typed field (the #41 and #43 rule). The comment text is not editable anywhere yet.

## Approach

- `src/types.ts`: `ArtPieceComment` gets an optional `edited?: boolean`.
- `src/storage.ts`: `StoredComment` gets `edited?: boolean`. `isStoredComment` accepts an `edited` that is undefined or a boolean (a non-boolean `edited` makes the entry broken, like a bad `id`). `withCommentIds` already spreads the comment, so `edited` is kept.
- `src/App.tsx`: new `editComment(slug, commentId, text)` using `updateInfo` and `comments.map(...)` that sets `{ ...comment, text, edited: true }` only on the comment with the matching `id`. `date` and `id` are not touched. It is passed down as `onEditComment(slug, id, text)`.
- `src/components/CommentEditForm.tsx` (new): props `initialText`, `onSave(text)` and `onCancel()`. A form with a labelled text field ("Edit your comment", starting with the current text), a "Save" button and a "Cancel" button. Save trims; empty or spaces-only text does nothing (the form stays open).
- `src/components/CommentItem.tsx` (new): one comment. It owns `isEditing` (state of the single comment, as the issue notes say). Normal view: text, date and time, the "edited" label when `comment.edited`, and "Edit" and "Delete" buttons. Edit view: date and time plus the `CommentEditForm` (the Edit and Delete buttons are hidden while editing). On Save: if the trimmed text equals the current text it behaves like Cancel (no change, no "edited" label); otherwise it calls `onEdit(id, text)` and closes the form. Cancel closes the form and keeps the old text.
- `src/components/Comments.tsx`: renders `CommentItem` for each comment and takes a new prop `onEditComment(id, text)`.
- `src/components/ArtPieceDetailsPage.tsx`: new prop `onEditComment(slug, id, text)`; passes `(id, text) => onEditComment(artPiece.slug, id, text)` to `Comments`.
- Buttons: "Edit" with the accessible name "Edit comment: <text>" (like Delete), and "Save" and "Cancel" with their plain names.

## AC coverage

| AC                                                                            | Change                                                   | Test                                                                                                                                                                     |
| ----------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Each comment has an "Edit" button                                             | `CommentItem`                                            | `Comments.test.tsx`: one button per comment, visible text "Edit", named "Edit comment: <text>"                                                                           |
| Clicking "Edit" shows a text field with the current text, "Save" and "Cancel" | `CommentItem` + `CommentEditForm`                        | `Comments.test.tsx`: after the click the textbox has the current text and "Save" and "Cancel" are shown; `CommentEditForm.test.tsx`: initial value, both buttons         |
| "Save" replaces the text of this comment, and only this comment               | `editComment` maps by `id`                               | `Comments.test.tsx`: Save reports the `id` and the new text; `App.test.tsx`: edit the second of two comments with the same text, only it changes                         |
| "Cancel" keeps the old text                                                   | `CommentItem`                                            | `Comments.test.tsx` and `App.test.tsx`: type a new text, Cancel, the old text is shown and nothing was reported or saved                                                 |
| Empty text (also only spaces) cannot be saved; saved text is trimmed          | `CommentEditForm` guard and trim                         | `CommentEditForm.test.tsx`: empty and spaces-only Save does not call `onSave` and the form stays; padded text is saved trimmed; `App.test.tsx`: no change in the comment |
| An edited comment shows the label "edited"; the original date stays           | `edited: true`, `date` untouched; label in `CommentItem` | `Comments.test.tsx`: label only when `edited`; `App.test.tsx` (fake timers): edit later, the label is shown and the date text is the original one                        |
| The edited text is still there after a reload                                 | existing save effect + `storage.ts` accepts `edited`     | `App.test.tsx`: edit, unmount, render again: new text and "edited"; `storage.test.ts`: `edited: true` round-trips, an `edited` of a wrong type makes the entry broken    |
| (decision) Save with unchanged text is like Cancel                            | `CommentItem`                                            | `Comments.test.tsx` and `App.test.tsx`: no "edited" label, the form closes, `onEdit` is not called                                                                       |
| (task) optional `edited` flag accepted in storage                             | `types.ts`, `storage.ts`                                 | rows above                                                                                                                                                               |
| (task) edit form for one comment and a function in `App`                      | `CommentEditForm`, `editComment`                         | rows above                                                                                                                                                               |

Existing assertions stay unchanged; existing renders only get the new required props (see Notes).

## Files to change

- `src/types.ts` (modify): optional `edited`.
- `src/storage.ts` (modify) + `src/storage.test.ts` (modify): accept `edited`; new tests only.
- `src/components/CommentEditForm.tsx` + `CommentEditForm.test.tsx` (new): the edit form.
- `src/components/CommentItem.tsx` (new): one comment with its edit state. It is covered through the `Comments` tests, not a separate test file.
- `src/components/Comments.tsx` (modify) + `Comments.test.tsx` (modify): render `CommentItem`, new prop, new tests.
- `src/components/ArtPieceDetailsPage.tsx` (modify) + `ArtPieceDetailsPage.test.tsx` (modify): pass the callback; one new test.
- `src/App.tsx` (modify) + `src/App.test.tsx` (modify): `editComment` and integration tests.

## Out of scope

Edit history or undo, closing the form with the Escape key, editing the date, showing when a comment was edited, a confirmation before saving, styling beyond what exists (a visual check is done in the browser), repairing duplicate ids from hand-edited storage.

## Resolved decisions

1. Save with text that equals the old text (after trimming) behaves like Cancel: no change and no "edited" label (chosen over marking it as edited).
2. While a comment is edited, its Edit and Delete buttons are hidden and the form replaces them; the date and time stay visible. Several comments can be edited at the same time because the state is per comment.
3. A saved `edited` value that is not a boolean makes the entry broken (the #41 and #43 rule).
4. Added after the first look in the browser, at the user's request: the "edited" label is shown on the same line as the date and time, in the same small grey style, separated by a dot, so it no longer looks like a link. The date and the label sit in one `<p className="comment-meta">`; the label is a `<span className="comment-edited">` whose dot comes from CSS (`::before`), so its text stays exactly "edited". This is markup and CSS only: the automated tests cannot check the layout (jsdom has no layout), so it is checked in the browser, and the existing tests stay unchanged.

## Notes

- `Comments` gets a new required prop, so existing renders in `Comments.test.tsx` and `renderDetails` in `ArtPieceDetailsPage.test.tsx` get a no-op `onEditComment` (setup only, like `onDeleteComment` in #43).
- Adding "Edit" buttons must not break tests that look for buttons by name: existing queries use names such as `/^Delete/`, "Add comment" and "Favorite <name>", which stay unique.
- Mutation checks at the end, each must make a test fail: replacing the text of every comment instead of only the matching `id`; not setting `edited`; changing `date` on edit; making `storage.ts` reject `edited`.

## Verification

`npm run test:run`, `npm run lint`, `npm run format:check`, `npm run check`, `npm run build`; then `npm run dev`: add two comments (same text), edit the second to a new text and Save, and only it changes and shows "edited" with the old date; Cancel keeps the text; an empty text cannot be saved; Save without changing the text shows no "edited"; reload, and the edit is still there.
