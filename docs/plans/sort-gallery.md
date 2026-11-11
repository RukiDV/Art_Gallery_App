# Plan: Sort the gallery (no GitHub issue)

Branch: `feature/sort-gallery` (from `main`). Plan is committed first as `docs/plans/sort-gallery.md`.
The user decided: the "Sort by" dropdown sits next to Search and Filters and is always visible; the choice is not remembered (every visit starts with the default order, like search and filters).

## Context

The gallery shows the paintings in the order the API delivers them. Item 7 of the user's list of ideas: let people sort by name, artist or year. It is the last item of the list.

## What the data looks like

`year` is a string, not a number. The real values include `"1889"`, `"1887–88"`, `"1890–92"`, `"ca. 1704–9"`, `"ca. 1830–32"`, `"1912–13"`, `"2020"`. Sorting by year therefore uses the **first four-digit number** in the text (the start year): `1887–88` → 1887, `ca. 1704–9` → 1704. A value without any four-digit number has no year and goes to the end in both directions.

## Approach

- **New `src/sortArtPieces.ts`** (pure, no React):
  - `type SortOption = "default" | "name" | "artist" | "year-asc" | "year-desc"` and `SORT_OPTIONS` (value + label): `Default order`, `Name (A–Z)`, `Artist (A–Z)`, `Year (oldest first)`, `Year (newest first)`.
  - `getStartYear(year: string): number | undefined` (first match of `/\d{4}/`).
  - `sortArtPieces(artPieces, option): ArtPiece[]` returns a new array, never changes its input. Names and artists use `localeCompare` (handles `Cézanne`, `Kōrin`, upper and lower case); the artist is compared as written (`Vincent van Gogh` under V, not by last name). The sort is stable: equal entries keep their order. `default` keeps the order of the list it is given.
- **New `src/components/SortSelect.tsx`**: label "Sort by" + native `<select>` with the options, built like `GenreFilter` (`useId`, `value`, `onChange`).
- **`src/components/GalleryPage.tsx`** (modify): `sortOption` state (starts as `default`); the select goes into the top `.gallery-filters` row after the Filters button; `shownArtPieces = sortArtPieces(filterArtPieces(...), sortOption)`, so search, genre and colors still apply and the result is sorted. Sorting is **not** a filter: it does not count in the "Filters (n)" label, "Remove filters" does not reset it, and it does not decide whether "Remove filters" is shown.
- **Styles**: the select reuses the existing field styles and the `.gallery-filters` row; at most a tiny rule for spacing. No new design.
- Not touched: the details page Previous/Next (they follow the gallery order from the API), the Favorites page, the Spotlight.

## Tests first (new tests only; existing tests must stay valid)

- `src/sortArtPieces.test.ts` (pure): `getStartYear` for `1889`, `1887–88`, `1890–92`, `ca. 1704–9`, `ca. 1830–32`, `2020`, empty text and text without a four-digit number; name A–Z with diacritics and mixed case; artist A–Z; year oldest first and newest first with ranges and `ca.`; pieces without a year are last in both year directions; equal entries keep their order; `default` keeps the order; the input array is not changed; an empty list works.
- `src/components/SortSelect.test.tsx`: labelled "Sort by", the five options, shows the current value, calls `onChange` with the chosen value.
- `GalleryPage.test.tsx` (new `describe`): the "Sort by" control is visible without opening Filters and starts on "Default order"; each option reorders the shown titles; sorting a searched or genre-filtered list sorts only what is shown; "Remove filters" brings the full list back but keeps the chosen sort; sorting does not change the "Filters" button text; the control works with the keyboard (native select).

If an existing test unexpectedly fails, stop and ask; do not change it.

## Files to change

- New: `src/sortArtPieces.ts`, `src/sortArtPieces.test.ts`, `src/components/SortSelect.tsx`, `src/components/SortSelect.test.tsx`, `docs/plans/sort-gallery.md`
- Modify: `src/components/GalleryPage.tsx`, `src/components/GalleryPage.test.tsx` (new tests only), possibly `src/styles.css` (spacing only)

## Out of scope

Remembering the sort choice, sorting the Favorites page, Z–A name, sort by genre or color, sorting by an artist's last name, details Previous/Next following the sorted order, sort in the URL.

## Resolved decisions

1. The "Sort by" dropdown sits in the top row next to Search and Filters and is always visible.
2. The chosen sort is not remembered; every visit starts with the default order, like search and filters.
3. Sorting is not a filter: it does not count in the Filters label, and Remove filters does not reset it.
4. Years are sorted by the first four-digit number in the text; paintings without a readable year go last in both directions.

## Notes

- The branch is verified with `git branch --show-current` before and after every commit; nothing is committed on `main`.
- Before branching, local `main` is brought up to date with GitHub (the rearrange-favorites PR may be merged by then).

## Verification

`npm run test:run`, `npm run lint`, `npm run format:check`, `npm run check`, `npm run build`. Then in a real browser (Playwright/Chrome here, Firefox by the user): pick each sort option and compare the order of the 11 real paintings with the expected order; combine with a search and a genre; check "Remove filters" keeps the sort; the dropdown at 400px width; light and dark. Delete `.playwright-mcp/` afterwards.
