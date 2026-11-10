# Plan: Issue #47 – Bonus: Search and Filter the Gallery

Issue: #47 "19: Bonus - Search and Filter the Gallery" (https://github.com/RukiDV/Art_Gallery_App/issues/47)
Branch: `feature/47-search-and-filter-the-gallery`

## Summary

The Gallery page gets a search field and a genre filter that work together. Issues #4 to #56 are merged. Today the route `/art-pieces` in `App.tsx` renders `ArtPieceList` directly with all art pieces (there is no Gallery page component). `ArtPieceList` is also used by `FavoritesPage`. `ArtPiece` already has `name`, `artist` and `genre` (strings). The Spotlight and Favorites pages must stay as they are.

## Approach

- `src/filterArtPieces.ts` (new): two pure functions.
  - `filterArtPieces(artPieces, query, genre)`: keeps pieces whose `name` or `artist` contains the trimmed `query` ignoring upper and lower case (an empty query matches everything), and, when `genre` is not empty, whose `genre` equals it exactly. Both conditions must be true.
  - `getGenres(artPieces)`: the genres of the pieces, each once, sorted alphabetically.
- `src/components/SearchField.tsx` (new): a labelled search field (`<label>` "Search" and `<input type="search">`), controlled through props `value` and `onChange(value)`.
- `src/components/GenreFilter.tsx` (new): a labelled `<select>` ("Genre") with the first option "All genres" (value empty) and one option per genre; props `genres`, `value`, `onChange(value)`.
- `src/components/GalleryPage.tsx` (new): props `artPieces`, `isFavorite`, `onToggleFavorite`. Keeps `query` and `genre` in state (both start empty), shows `SearchField` and `GenreFilter` in a `div.gallery-filters`, computes the filtered list with `filterArtPieces` (the filtered list is not state) and renders `ArtPieceList`. When nothing matches it shows `<p>No art pieces found</p>` instead of the list.
- `src/App.tsx`: the route `/art-pieces` renders `GalleryPage` instead of `ArtPieceList`. Nothing else changes; the Spotlight and Favorites pages stay untouched.
- `src/styles.css`: a small `.gallery-filters` rule (flex, wrap, gap, space below) so the two controls sit in a row. Markup and CSS only; checked in the browser.

## AC coverage

| AC                                                                                                             | Change                                    | Test                                                                                                                                                                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The Gallery page has a text field labeled "Search"                                                             | `SearchField` in `GalleryPage`            | `SearchField.test.tsx`: searchbox named "Search"; `App.test.tsx`: it is on `/art-pieces`                                                                                                                                                                             |
| While typing, only pieces whose title or artist contains the text are shown; case and outer spaces are ignored | `filterArtPieces`, state in `GalleryPage` | `filterArtPieces.test.ts`: title match, artist match, no match in other fields, case-insensitive, trimmed; `GalleryPage.test.tsx`: typing updates the list on every keystroke                                                                                        |
| A control labeled "Genre" with "All genres" and one option per genre, each once                                | `GenreFilter`, `getGenres`                | `GenreFilter.test.tsx`: combobox named "Genre", first option "All genres", each given genre once; `filterArtPieces.test.ts`: `getGenres` is unique and sorted; `GalleryPage.test.tsx`: options are built from the pieces (two pieces share a genre, it appears once) |
| Selecting a genre shows only that genre; "All genres" shows all again                                          | `filterArtPieces`, `GenreFilter`          | `GalleryPage.test.tsx`: select a genre, only its pieces; select "All genres", all pieces                                                                                                                                                                             |
| Search and genre work together                                                                                 | both conditions in `filterArtPieces`      | `filterArtPieces.test.ts` and `GalleryPage.test.tsx`: a piece must match both; the same search with another genre gives another result                                                                                                                               |
| Empty search and "All genres" show all pieces                                                                  | defaults                                  | `GalleryPage.test.tsx`: the initial state shows every piece with "All genres" selected; clearing the search shows all again                                                                                                                                          |
| When nothing matches, "No art pieces found" is shown                                                           | empty branch                              | `GalleryPage.test.tsx`: no list and the message; typing a matching text brings the list back                                                                                                                                                                         |
| The Favorites and Spotlight pages are not affected                                                             | `GalleryPage` only on `/art-pieces`       | `App.test.tsx`: no search field and no genre control on `/` and `/favorites`; filtering the Gallery does not change what Favorites lists                                                                                                                             |
| (task) search field component and genre filter component                                                       | `SearchField`, `GenreFilter`              | rows above                                                                                                                                                                                                                                                           |
| (task) text and genre in state, filtered list computed                                                         | `GalleryPage`                             | rows above                                                                                                                                                                                                                                                           |
| (task) genres derived from the fetched pieces                                                                  | `getGenres`                               | rows above                                                                                                                                                                                                                                                           |
| (note) the favorite hearts still work on filtered results                                                      | `ArtPieceList` unchanged                  | `GalleryPage.test.tsx`: clicking a heart of a filtered piece reports its slug                                                                                                                                                                                        |

Existing tests keep their assertions (see Notes).

## Files to change

- `src/filterArtPieces.ts` + `filterArtPieces.test.ts` (new): the pure functions.
- `src/components/SearchField.tsx` + `SearchField.test.tsx` (new).
- `src/components/GenreFilter.tsx` + `GenreFilter.test.tsx` (new).
- `src/components/GalleryPage.tsx` + `GalleryPage.test.tsx` (new).
- `src/App.tsx` (modify): the gallery route renders `GalleryPage`.
- `src/App.test.tsx` (modify): new tests only.
- `src/styles.css` (modify): `.gallery-filters`.

## Out of scope

Sorting (a separate idea), keeping the search or genre when leaving the Gallery, putting them in the URL, searching genre, year or comments, fuzzy or accent-insensitive search, highlighting matches, a clear button, a delay while typing, a count of results, the same controls on the Favorites page.

## Resolved decisions

1. The genre options are sorted alphabetically (the issue only says each genre once and derived from the data).
2. The search and genre state belongs to `GalleryPage` and is lost when the user leaves the page (no persistence, as the issue's "Out of scope" says).
3. The search field uses `type="search"` (role `searchbox`), the genre control is a native `<select>`.

## Notes

- Existing `App.test.tsx` tests on `/art-pieces` look for list items, favorite buttons by name and link names; the new controls add an input and a `select` with `option`s, none of which are list items or buttons, so those assertions should stay valid. Option texts are genre names ("Renaissance", "Landscape Painting"); existing text lookups for those words happen on the details page, which has no select.
- Component tests use richer fixtures (several pieces, a shared genre, mixed upper and lower case) than the two pieces in `App.test.tsx`.
- Mutation checks at the end, each must make a test fail: a case-sensitive search; no trimming of the search text; matching only the title; a duplicated genre in the options; removing the "No art pieces found" message; combining search and genre with "or" instead of "and"; applying the controls on the Favorites page.

## Verification

`npm run test:run`, `npm run lint`, `npm run format:check`, `npm run check`, `npm run build`; then `npm run dev`: on the Gallery type part of a title or an artist (upper or lower case, with spaces around), pick a genre, combine both, type something that matches nothing ("No art pieces found"), clear everything (all pieces again); the Spotlight and the Favorites pages have no such controls; check how the two controls look.

## Amendment: color filter (added during implementation, approved by the user)

After the search and genre filter were done, the user asked to filter the Gallery by color too and chose: add it to #47 (not a new issue), group colors into families, and show pieces that have **any** selected color.

Why families: every `ArtPiece` has `colors: string[]` (five hex values), and two paintings almost never share exactly the same hex, so an exact-hex filter would return one piece per click.

### Approach

- `src/colorFamilies.ts` (new): `COLOR_FAMILIES` (Red, Orange, Yellow, Green, Blue, Purple, Brown, Neutral, in this order, each with a circle color), `getColorFamily(hex)` and `getColorFamilies(artPieces)`. `getColorFamily` reads `#RRGGBB` (invalid values give `undefined` and are ignored), converts it to HSL and decides: Neutral when saturation is below 0.12 or lightness is below 0.08 or above 0.92; otherwise by hue: Red below 15 or from 345, from 15 to below 70 Brown when lightness is below 0.40 and else Orange below 40 and Yellow from 40, Green from 70 to below 165, Blue from 165 to below 260, Purple from 260 to below 345. The limits are constants at the top of the file, so they are easy to tune. `getColorFamilies` lists the families that occur in the palettes, each once, in the fixed order.
- `src/filterArtPieces.ts`: a fourth parameter `families = []`. With selected families a piece must have at least one palette color in any of them; search, genre and colors must all match.
- `src/components/ColorFilter.tsx` (new): a `<fieldset>` with the legend "Color" and one checkbox per available family, each with a colored circle and the family name. It renders nothing when no family is available. Checkboxes, not buttons: it is a multi-select, and the existing test that counts the buttons on the Gallery (the hearts) stays valid.
- `src/components/GalleryPage.tsx`: `selectedFamilies` state with a toggle; the filtered list uses all three filters.
- `src/styles.css`: the color circles and a ring around the checked one.

### New acceptance criteria and tasks (also added to the body of issue #47)

- The Gallery page has a group "Color" with one checkbox per color family that occurs in the art pieces.
- Each color is shown as a colored circle with its name.
- Selecting a color shows only the pieces with at least one palette color in that family.
- Selecting several colors shows the pieces that have any of them.
- Unselecting all colors shows all pieces again.
- Color works together with the search and the genre: a piece must match all of them.
- When nothing matches, "No art pieces found" is shown.
- The Favorites page and the Spotlight page have no color filter.
- Tasks: a function that maps a color to a family, a color filter component, and extending the filter with colors.

### Tests

`colorFamilies.test.ts` (families in a fixed order, sample colors for every family, the boundaries between Red/Orange, Orange/Yellow and Orange/Brown, neutral for very dark and very light colors, invalid values, `getColorFamilies`), new tests in `filterArtPieces.test.ts` (one family, several families as "any", never fewer pieces when a family is added, color together with search and genre), `ColorFilter.test.tsx`, new tests in `GalleryPage.test.tsx` and `App.test.tsx`. No existing test was changed.

Mutation checks, each fails tests and passes again when restored: "all selected colors" instead of "any", ignoring the selected colors, a wrong Brown/Orange limit, offering families that no piece has, and combining the color with "or".

### Out of scope

Clicking a palette swatch on a details page to open the Gallery filtered by that color, a mode where pieces must have all selected colors, matching exact hex values or by color distance, a "clear colors" button, sorting by color, showing how many pieces each color has, keeping the selection when leaving the Gallery, a color filter on the Favorites page.

## Second amendment: collapsible filters (added during implementation, approved by the user)

After trying the color filter the user did not want the Genre and Color controls to be always visible. Decisions: the Search field stays visible; Genre and Color are hidden behind a "Filters" button; the panel starts closed; while filters are active the button shows how many.

### Approach

- `src/components/GalleryPage.tsx`: new state `isPanelOpen` (starts `false`). A button next to the Search field has `aria-expanded` and `aria-controls` (only while open). Its text is "Filters" when nothing is selected and "Filters (n)" otherwise, where `n` is 1 for a chosen genre plus 1 for every selected color family; the search text is not counted because its field is always visible. The panel with `GenreFilter` and `ColorFilter` is rendered only while open (not just hidden), and the genre and color state stays in `GalleryPage`, so closing the panel keeps the filters applied and reopening shows the same choices.
- `src/styles.css`: the filter row is aligned in the center.

### New acceptance criteria and task (also added to the body of issue #47)

- The Search field is always visible.
- The Genre and Color controls are hidden at the start; a button "Filters" shows and hides them, and tells screen readers whether the panel is open.
- While filters are active the button shows how many, for example "Filters (2)".
- Closing the panel keeps the filters applied.
- Task: add the Filters button and the collapsible panel.

### Changes to existing tests (approved)

- One test already on `main`, "works without any stored data" in `App.test.tsx`: its query for all buttons on the Gallery now only looks for the heart buttons, `findAllByRole("button", { name: /^Favorite / })`, because the new "Filters" button is a third button. The assertions stay the same.
- The tests of this branch that use the genre select or the color checkboxes first click the "Filters" button (helper `openFilters`). Their assertions do not change.

### Mutation checks

Each fails tests and passes again when restored: the panel starting open, counting the search text, not counting the genre, closing the panel resetting the filters, `aria-expanded` not following the state, and the panel rendered while closed.

### Out of scope

Remembering whether the panel was open after leaving the Gallery or after a reload, animating the panel, a "clear all filters" button, counting the search text, separate buttons for Genre and Color, showing the active filters as chips.

## Third amendment: "Remove filters" button (added during implementation, approved by the user)

The user asked for a button that removes all filters at once, so the Gallery is back to its default. Until now "a clear all filters button" was out of scope.

### Approach

- `src/components/GalleryPage.tsx`: `removeFilters()` sets the search text to `""`, the genre to `""` and the selected color families to `[]` and moves the focus to the Search field. A button "Remove filters" sits in the top row next to the Search field and the "Filters" button and is rendered only while something is active (a search text after trimming, a chosen genre or a selected color). It does not change whether the Filters panel is open.
- `src/components/SearchField.tsx`: an optional prop `inputRef` that is passed to the `<input>`, so the page can focus the field (behavior and tests of the field unchanged).
- No CSS change.

### New acceptance criteria and task (also added to the body of issue #47)

- A button "Remove filters" is shown while a search text, a genre or a color is active, and not otherwise.
- Clicking it clears the search text, sets the genre to "All genres" and unselects all colors, so all art pieces are shown again.
- It also works while the Filters panel is closed and leaves the panel as it was.
- After the click the focus is in the Search field.
- Task: add the "Remove filters" button and the reset.

### Tests and checks

New tests in `GalleryPage.test.tsx` and `App.test.tsx`; no existing test was changed. Mutation checks, each fails tests and passes again when restored: not resetting the search text, the genre or the colors, the button always shown, a search with only spaces counted as active, the click closing the panel, and the focus not moved.

### Out of scope

A confirmation, an undo, remembering the filters, resetting the panel to closed, a "clear" button inside the Search field, a keyboard shortcut.
