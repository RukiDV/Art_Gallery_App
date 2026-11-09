# Bonus: Search the Gallery

This is a bonus story. It builds on story 4 (Gallery Page). If you also built "Filter the Gallery by Genre", the search and the genre filter work together.

## Value Proposition

**As an** art enthusiast

**I want to** search for an art piece by its title or its artist

**so that** I can quickly find a specific piece.

## Acceptance Criteria

- [ ] The Gallery page has a text field labeled "Search".
- [ ] While typing, only art pieces whose title or artist contains the text are displayed.
- [ ] The search ignores upper and lower case.
- [ ] Spaces at the start and the end of the text are ignored.
- [ ] When the field is empty, all art pieces are displayed.
- [ ] When nothing matches, the message "No art pieces found" is displayed.
- [ ] If the genre filter exists: only art pieces that match the search **and** the selected genre are displayed.

## Tasks

- [ ] Create a search field component.
- [ ] Keep the search text in state and compute the filtered list from it.

<details>
<summary>Hint ✨</summary>

Compare lower case with lower case: `text.toLowerCase().includes(query.toLowerCase())`.

The filtered list is not state. Compute it from the art pieces and the search text.

</details>
