# Plan: Issue #10 – Comments for Art Pieces

Issue: #10 "10: Comments for Art Pieces" (https://github.com/RukiDV/Art_Gallery_App/issues/10)
Branch: `feature/10-comments-for-art-pieces`

## Summary

The details page gets a "Comments" section listing the comments of that art piece (text, date and time) and a form (text field and submit button). Submitting adds the comment to this art piece only, and empty comments cannot be submitted. Issues #4 to #9 are merged. `App.tsx` holds `artPiecesInfo: ArtPieceInfo[]` (`slug`, `isFavorite`) with `isFavorite(slug)` and `toggleFavorite(slug)`. `ArtPieceDetailsPage` renders image, favorite button, title, artist, year, genre and a Back link. `styles.css` already has `.comments`, `.comments li`, `.comments time` and `.comment-form` rules.

## Approach

- `src/types.ts`: add `ArtPieceComment = { text: string; date: string }` (`date` is an ISO string) and extend `ArtPieceInfo` with `comments: ArtPieceComment[]`.
- `src/App.tsx`: one state, one entry per slug. A small helper updates or creates the entry for a slug (new entries start with `isFavorite: false, comments: []`). `toggleFavorite(slug)` keeps its behavior. New `getComments(slug)` (returns `[]` if there is no entry) and `addComment(slug, text)`, which appends `{ text, date: new Date().toISOString() }` (oldest first). Both are passed to the details page.
- `src/components/Comments.tsx` (new): props `comments`. `<section className="comments">` with a heading "Comments" and a `<ul>` of `<li>`s, each showing the text and `<time dateTime={date}>{new Date(date).toLocaleString()}</time>`.
- `src/components/CommentForm.tsx` (new): props `onAddComment(text)`. `<form className="comment-form">` with a labelled text input ("Your comment") and a submit button ("Add comment"). On submit: `preventDefault`, `trim()`; if empty do nothing, otherwise call `onAddComment(trimmed)` and clear the field.
- `src/components/ArtPieceDetailsPage.tsx`: new props `getComments(slug)` and `onAddComment(slug, text)`; renders `Comments` and `CommentForm` for the shown art piece (not for the "not found" state).

## AC coverage

| AC                                                              | Change                      | Test                                                                                                                                                                                                                                       |
| --------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Section labeled "Comments" with a list of this piece's comments | `Comments` in details page  | `Comments.test.tsx`: heading "Comments" and one `listitem` per comment; `ArtPieceDetailsPage.test.tsx`: section present for the shown piece                                                                                                |
| Each comment's text displayed                                   | `Comments`                  | `Comments.test.tsx`: text visible                                                                                                                                                                                                          |
| Each comment's date and time displayed                          | `Comments`                  | `Comments.test.tsx`: `time` element with `new Date(date).toLocaleString()` and the `dateTime` attribute                                                                                                                                    |
| Form with a text field and a submit button                      | `CommentForm`               | `CommentForm.test.tsx`: textbox "Your comment" and button "Add comment"                                                                                                                                                                    |
| Submitting adds the comment to this art piece only              | `CommentForm` + `App` state | `CommentForm.test.tsx`: submit calls `onAddComment` with the text and clears the field; `App.test.tsx`: add a comment on piece A (fake timers fix the date), it appears with its date; on piece B it does not; back on A it is still there |
| Empty comments cannot be submitted                              | `CommentForm` guard         | `CommentForm.test.tsx`: empty and whitespace-only submits do not call `onAddComment`; `App.test.tsx`: no new list item                                                                                                                     |
| (task) type and extended stored info                            | `types.ts`, `App`           | covered by the rows above; favorites still work (existing favorite tests stay green)                                                                                                                                                       |

## Files to change

- `src/types.ts` (modify): `ArtPieceComment`, `comments` on `ArtPieceInfo`.
- `src/components/Comments.tsx` + `Comments.test.tsx` (new): list with text and date.
- `src/components/CommentForm.tsx` + `CommentForm.test.tsx` (new): form with trim and empty guard.
- `src/components/ArtPieceDetailsPage.tsx` (modify) + `ArtPieceDetailsPage.test.tsx` (modify): new props and sections; existing tests only get default props.
- `src/App.tsx` (modify) + `src/App.test.tsx` (modify): state, `getComments`, `addComment`, integration tests.

## Out of scope

Persisting comments (#12), deleting or editing comments (ideas), a "No comments yet" message, comment counts, comments on the Spotlight or Favorites pages, a max length or character counter, style changes (the needed CSS exists).

## Resolved decisions

1. Whitespace-only comments count as empty; saved comments are trimmed.
2. Comments are listed oldest first (new ones appended).

## Notes

- Dates are stored as ISO strings and displayed with `toLocaleString()`. Tests derive the expected text with the same call, so they do not depend on the machine's locale.
- Adding comments to the existing `ArtPieceInfo` entries must not break favorites: an entry created by a comment has `isFavorite: false`, and an entry created by a favorite click has `comments: []`.

## Verification

`npm run test:run`, `npm run lint`, `npm run format:check`, `npm run check`, `npm run build`; then `npm run dev`: open a details page, see the "Comments" section, add a comment (it appears with date and time), try an empty and a spaces-only comment (nothing happens), open another art piece (no comment), and return (comment still there; do not reload, persistence is #12).
