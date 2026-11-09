# Bonus: Filter the Gallery by Genre

This is a bonus story. It builds on story 4 (Gallery Page).

## Value Proposition

**As an** art enthusiast

**I want to** show only the art pieces of one genre

**so that** I can find the kind of art I am interested in.

## Acceptance Criteria

- [ ] The Gallery page has a control labeled "Genre" with the option "All genres" and one option for each genre in the art pieces.
- [ ] "All genres" is selected at the start, and all art pieces are displayed.
- [ ] Selecting a genre shows only the art pieces of this genre.
- [ ] Selecting "All genres" again shows all art pieces.
- [ ] Every genre appears only once in the options.
- [ ] The Favorites page and the Spotlight page are not affected.

## Tasks

- [ ] Create a component for the genre filter.
- [ ] Derive the list of genres from the fetched art pieces.
- [ ] Keep the selected genre in state and filter the list with it.

<details>
<summary>Hint ✨</summary>

Do not write the genres into your code: the API can change. Build the list from the data, for example with `new Set(artPieces.map(...))`.

The filtered list is not state. Compute it from the art pieces and the selected genre.

</details>
