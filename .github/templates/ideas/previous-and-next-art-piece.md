# Bonus: Previous and Next Art Piece

This is a bonus story. It builds on story 7 (Art Piece Details Page).

## Value Proposition

**As an** art enthusiast

**I want to** go to the previous or the next art piece from the details page

**so that** I can browse through the art without going back to the list.

## Acceptance Criteria

- [ ] The details page has a "Previous" and a "Next" link.
- [ ] "Next" opens the details page of the art piece that follows in the Gallery list.
- [ ] "Previous" opens the details page of the art piece that comes before in the Gallery list.
- [ ] On the first art piece, there is no "Previous" link.
- [ ] On the last art piece, there is no "Next" link.
- [ ] An unknown `slug` shows the "Art piece not found" message and no links.

## Tasks

- [ ] Find the position of the current art piece in the list and compute its neighbors.
- [ ] Add the two links to the details component.

<details>
<summary>Hint ✨</summary>

Use `findIndex` with the `slug` from `useParams`. It returns `-1` when nothing is found: handle that case first.

The first and the last piece are edge cases. Write a test for both.

</details>
