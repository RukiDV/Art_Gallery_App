# Bonus: Show Another Spotlight

This is a bonus story. It builds on story 5 (Spotlight Page).

## Value Proposition

**As an** art enthusiast

**I want to** ask for another spotlight art piece

**so that** I can discover new art without leaving the homepage.

## Acceptance Criteria

- [ ] The Spotlight page has a button labeled "Show another".
- [ ] Clicking the button shows a different art piece with its image and the artist's name.
- [ ] The new art piece is never the same as the one that is displayed right now, as long as there is more than one art piece.
- [ ] With only one art piece, the button is not displayed.

## Tasks

- [ ] Write a function that picks a random art piece, and that can exclude one art piece.
- [ ] Add the button to the Spotlight page.

<details>
<summary>Hint ✨</summary>

Randomness makes tests unreliable. Pass the random number into your function, or replace `Math.random` in the test, for example with `vi.spyOn(Math, "random").mockReturnValue(0)`.

A simple way to exclude the current piece: pick from the list **without** the current piece.

</details>
