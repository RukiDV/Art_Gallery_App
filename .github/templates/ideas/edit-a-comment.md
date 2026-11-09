# Bonus: Edit a Comment

This is a bonus story. It builds on story 10 (Comments for Art Pieces). If you also want to delete comments, do the story "Delete a Comment" first: it adds the `id` that you need here.

## Value Proposition

**As an** art enthusiast

**I want to** change the text of a comment I wrote

**so that** I can correct mistakes or update my thoughts.

## Acceptance Criteria

- [ ] Each comment has an "Edit" button.
- [ ] Clicking "Edit" shows a text field with the current text of the comment, together with a "Save" and a "Cancel" button.
- [ ] Clicking "Save" replaces the text of this comment, and only of this comment.
- [ ] Clicking "Cancel" keeps the old text.
- [ ] An empty text cannot be saved.
- [ ] An edited comment shows the label "edited". Its original date and time stay the same.
- [ ] If story 12 is done: the edited text is still there after a reload.

## Tasks

- [ ] Extend the comment type with an `id` (if it does not have one yet) and an `edited` flag.
- [ ] Create an edit form for one comment and a function that updates one comment of one art piece.

<details>
<summary>Hint ✨</summary>

Whether a comment is being edited is state of the single comment, not of the whole list. Keep it in the component of one comment.

Use `map` to return a new list in which only the comment with the matching `id` is replaced.

</details>
