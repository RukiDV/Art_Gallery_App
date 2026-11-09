# Bonus: Delete a Comment

This is a bonus story. It builds on story 10 (Comments for Art Pieces). Users should be able to remove a comment they no longer want.

## Value Proposition

**As an** art enthusiast

**I want to** delete a comment I wrote

**so that** I can remove thoughts that I do not want to keep.

## Acceptance Criteria

- [ ] Each comment has a "Delete" button.
- [ ] Clicking "Delete" removes this comment from the list.
- [ ] Only this comment is removed, also when several comments have the same text.
- [ ] Comments of other art pieces are not changed.
- [ ] When the last comment is deleted, the comment section still works and the form is still displayed.
- [ ] If story 12 is done: the deleted comment stays deleted after a reload.

## Tasks

- [ ] Give every comment a unique `id` and extend the comment type with it.
- [ ] Add the delete button and a function that removes one comment of one art piece.

<details>
<summary>Hint ✨</summary>

Do not identify a comment by its position in the list: the position changes when a comment is removed. Use an `id`, for example `crypto.randomUUID()`.

`filter` returns a new array without the comment. Do not change the existing state directly.

</details>
