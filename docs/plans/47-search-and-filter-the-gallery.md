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
