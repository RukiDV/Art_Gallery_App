# Bonus: Sort the Gallery

This is a bonus story. It builds on story 4 (Gallery Page).

## Value Proposition

**As an** art enthusiast

**I want to** change the order of the art pieces

**so that** I can browse them by title or by age.

## Acceptance Criteria

- [ ] The Gallery page has a control labeled "Sort by" with the options "Default", "Title (A to Z)", "Year (oldest first)" and "Year (newest first)".
- [ ] "Default" is selected at the start and keeps the order of the API.
- [ ] "Title (A to Z)" sorts the art pieces alphabetically by title.
- [ ] The year options sort by the numeric value of the year.
- [ ] Art pieces whose year is not a plain number are displayed last.
- [ ] Selecting "Default" again restores the order of the API.
- [ ] Sorting does not change the order on the Favorites page.

## Tasks

- [ ] Create a component for the sort control.
- [ ] Keep the selected option in state and compute the sorted list from it.

<details>
<summary>Hint ✨</summary>

In the API, the year is a **string**, not a number. Comparing strings sorts `"900"` after `"1889"`. Convert the year first and handle values that cannot be converted.

`sort` changes the array it is called on. Sort a copy, for example with `toSorted`, so that the fetched data and the default order stay untouched.

</details>
