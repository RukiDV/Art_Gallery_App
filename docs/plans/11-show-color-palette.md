# Plan: Issue #11 – Show Color Palette

Issue: #11 "11: Show Color Palette" (https://github.com/RukiDV/Art_Gallery_App/issues/11)
Branch: `feature/11-show-color-palette`

## Summary

The details page shows the color palette of the art piece as a list of visual swatches (circles or squares). Issues #4 to #10 are merged. The API already sends `colors: string[]` (hex strings, see the README example), but `types.ts` does not type it yet. `ArtPieceDetailsPage` renders back link, image, favorite button, title, artist, year, genre, `Comments` and `CommentForm`. `styles.css` already has `.palette` (flex, gap, no list style) and `.palette li` (2.5rem circle with a border), so no CSS change is needed.

## Approach

- `src/types.ts`: add `colors: string[]` to `ArtPiece` (the property now used).
- `src/components/ColorPalette.tsx` (new): props `colors`. `<ul className="palette" aria-label="Color palette">` with one `<li>` per color: `style={{ backgroundColor: color }}` and `title={color}` (so the hex value is available on hover and as a tooltip). Keyed by `color` plus index, because a palette can repeat a color.
- `src/components/ArtPieceDetailsPage.tsx`: render `<ColorPalette colors={artPiece.colors} />` after the genre and before `Comments`. Not rendered in the "not found" state.
- Test fixtures in existing test files get a `colors` array because the type now requires it (fixture-only change).

## AC coverage

| AC                                                           | Change                                                                  | Test                                                                                                                                                                                                                                                        |
| ------------------------------------------------------------ | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Details page displays a list of all colors used in the image | `ColorPalette` in the details page                                      | `ColorPalette.test.tsx`: list named "Color palette" with one `listitem` per color, in order; `ArtPieceDetailsPage.test.tsx`: the palette of the shown piece is present, and not another piece's colors; `App.test.tsx`: the details route shows the palette |
| Colors displayed visually (circles or squares)               | `style.backgroundColor` on each `li`, existing `.palette li` circle CSS | `ColorPalette.test.tsx`: each item has the matching `background-color` (`toHaveStyle`) and `title` = hex value                                                                                                                                              |
| (task) new component for the palette                         | `ColorPalette`                                                          | covered by the rows above                                                                                                                                                                                                                                   |
| (edge) empty `colors`                                        | `ColorPalette`                                                          | `ColorPalette.test.tsx`: no items, no crash                                                                                                                                                                                                                 |

## Files to change

- `src/types.ts` (modify): `colors: string[]`.
- `src/components/ColorPalette.tsx` + `ColorPalette.test.tsx` (new): the palette list.
- `src/components/ArtPieceDetailsPage.tsx` (modify) + `ArtPieceDetailsPage.test.tsx` (modify): render and test the palette.
- `src/App.test.tsx` (modify): `colors` in the fixtures, a palette test, and the two assertion updates below.
- Fixture-only edits (add `colors`): `SpotlightPage.test.tsx`, `FavoritesPage.test.tsx`, `ArtPieceList.test.tsx`, `ArtPiecePreview.test.tsx`, `fetcher.test.ts`, `randomArtPiece.test.ts`.

## Approved test change (existing assertions)

The palette is a semantic `<ul>`, so two existing `App.test.tsx` assertions that used `queryByRole("list")` being absent as a stand-in for "the gallery is not shown" would fail on the details page. With the user's approval they are replaced by a direct check of the same intent:

- "shows the details of an art piece on /art-pieces/:slug" (at `/art-pieces/the-harvesters`): `queryByRole("list")` absent becomes: no link named `/Wheat Field with Cypresses/` (a gallery card) is present.
- "opens the details after clicking an art piece in the gallery" (opened Wheat Field): `queryByRole("list")` absent becomes: no link named `/The Harvesters/` is present.

## Out of scope

Color names or hex text next to the swatches, copy-to-clipboard, palette on the Spotlight, Gallery or Favorites pages, `dimensions` in the type, style changes, accessibility labels beyond the list name and `title`.

## Resolved decisions

1. The palette is a semantic `<ul>`; the two existing "list absent" assertions are updated as described above (approved by the user).

## Verification

`npm run test:run`, `npm run lint`, `npm run format:check`, `npm run check`, `npm run build`; then `npm run dev`: open a details page and see round color swatches matching the painting, hovering shows the hex value, and other pieces show their own palettes.
