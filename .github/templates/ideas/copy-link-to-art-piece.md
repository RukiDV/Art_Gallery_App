# Bonus: Copy the Link to an Art Piece

This is a bonus story. It builds on story 7 (Art Piece Details Page).

## Value Proposition

**As an** art enthusiast

**I want to** copy the link to an art piece with one click

**so that** I can share it with friends.

## Acceptance Criteria

- [ ] The details page has a button labeled "Copy link".
- [ ] Clicking it copies the address of the current page to the clipboard.
- [ ] After copying, the message "Link copied" is displayed for a short time and then disappears.
- [ ] If copying is not possible, the message "Could not copy the link" is displayed instead.
- [ ] The message is announced by screen readers.

## Tasks

- [ ] Create a `CopyLinkButton` component.
- [ ] Test both outcomes: copying works and copying fails.

<details>
<summary>Hint ✨</summary>

`navigator.clipboard.writeText(window.location.href)` returns a promise. It can be rejected, for example when the browser does not allow it: handle the error.

The clipboard does not exist in the test environment. Replace it in the test with a mock that resolves or rejects. Clear the message with `setTimeout`, and in tests use fake timers instead of waiting.

An element with `role="status"` is announced by screen readers when its text changes.

</details>
