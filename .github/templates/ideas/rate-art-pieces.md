# Bonus: Rate Art Pieces

This is a bonus story. It builds on stories 7 and 8: you store the rating next to the favorite flag of the art piece.

## Value Proposition

**As an** art enthusiast

**I want to** rate an art piece from 1 to 5 stars

**so that** I can remember how much I like it.

## Acceptance Criteria

- [ ] The details page shows five stars for the rating.
- [ ] Without a rating, no star is filled.
- [ ] Clicking the n-th star sets the rating to n: the first n stars are filled.
- [ ] Clicking the star of the current rating removes the rating.
- [ ] A rating belongs only to this art piece.
- [ ] The stars can be used with the keyboard, and each star has a name that says what it does, for example "Rate 3 out of 5".
- [ ] The current rating is also available as text for screen readers, for example "Rating: 3 out of 5".
- [ ] If story 12 is done: the rating is still there after a reload.

## Tasks

- [ ] Create a `StarRating` component that gets the current rating and a function to change it.
- [ ] Extend the information you store for each art piece with the rating.

<details>
<summary>Hint ✨</summary>

A rating is a number from 1 to 5, or `null` when there is no rating. Type it that way, for example `rating: number | null`.

Do not change the fetched art pieces. Store the rating in your own state and connect it via the `slug`, like the favorites.

</details>
