# Bonus: Favorites Counter in the Navigation

This is a bonus story. It builds on stories 6, 8 and 9.

## Value Proposition

**As an** art enthusiast

**I want to** see how many favorites I have in the navigation

**so that** I always know the size of my collection without opening the Favorites page.

## Acceptance Criteria

- [ ] The navigation shows the number of favorites next to the "Favorites" link, for example "Favorites (3)".
- [ ] Without favorites, the link is only labeled "Favorites".
- [ ] The number changes right away when a favorite is added or removed, on every page.
- [ ] The number is part of the link text, so that screen readers read it.

## Tasks

- [ ] Compute the number of favorites from your existing state. Do not store it as separate state.
- [ ] Pass it to the navigation component.

<details>
<summary>Hint ✨</summary>

The number is derived from the list of art piece information: count the entries with `isFavorite`. Two copies of the same information get out of sync.

</details>
