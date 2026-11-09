# Plan: Issue #6 – App Navigation Design

Issue: #6 "6: App Navigation Design" (https://github.com/RukiDV/Art_Gallery_App/issues/6)
Branch: `feature/6-app-navigation-design`

## Summary

Users switch between Spotlight (`/`) and Gallery (`/art-pieces`) via a navigation shared by all pages. The current page's link is highlighted, and unknown URLs show "Page not found". Issues #4 and #5 are merged. `App.tsx` currently shows a loading or error message instead of the `Routes` until the art pieces are fetched. `src/styles.css` already has the `nav` (fixed bottom bar) and `nav a.active` styles, and `main` has bottom padding for it, so no CSS changes are needed.

## Approach

- `src/components/Navigation.tsx`: `<nav>` with `NavLink to="/" end` ("Spotlight") and `NavLink to="/art-pieces"` ("Gallery"). `NavLink` sets the `active` class and `aria-current="page"` on the current link.
- `src/App.tsx`: render `<Navigation />` exactly once, always (also while loading or erroring). `<Routes>` are always rendered; only the two data routes wait for data via a small local helper `withArtPieces(render)` that returns the loading message, the error message, or `render(artPieces)`. Add `<Route path="*" element={<p>Page not found</p>} />`, which does not depend on the fetch.
- The `<h1>Art Gallery</h1>` and `<main>` stay as they are.

## AC coverage

| AC                                            | Change                   | Test                                                                                                                                                   |
| --------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Link "Spotlight" displayed                    | `Navigation`             | `Navigation.test.tsx`: role `link` named "Spotlight" (href `/`)                                                                                        |
| Link "Gallery" displayed                      | `Navigation`             | `Navigation.test.tsx`: role `link` named "Gallery" (href `/art-pieces`)                                                                                |
| Clicking "Spotlight" shows the Spotlight page | `App` + `Navigation`     | `App.test.tsx`: start at `/art-pieces`, click "Spotlight" with `userEvent`, spotlight image visible, list gone                                         |
| Clicking "Gallery" shows the Gallery page     | same                     | `App.test.tsx`: start at `/`, click "Gallery", list of pieces visible                                                                                  |
| Current link highlighted                      | `NavLink` (`end` on `/`) | `Navigation.test.tsx` in `MemoryRouter`: at `/` Spotlight has `aria-current="page"` and class `active`, Gallery does not; at `/art-pieces` the reverse |
| Unknown URL shows "Page not found"            | `*` route                | `App.test.tsx`: `/does-not-exist` shows "Page not found"; also with a pending fetch and with a failing fetch (not blocked by loading or error)         |
| (task) Navigation rendered once, on all pages | `App`                    | `App.test.tsx`: exactly one `navigation` landmark on `/`, `/art-pieces` and an unknown URL                                                             |

Existing App tests (loading, error, list, spotlight) must stay green and unchanged.

## Files to change

- `src/components/Navigation.tsx` + `Navigation.test.tsx` (new): nav links and highlighting.
- `src/App.tsx` (modify): render Navigation once, always render Routes, `withArtPieces` helper, `*` route.
- `src/App.test.tsx` (modify): add navigation, not-found and single-nav tests.

## Out of scope

Page-specific titles, links from art pieces to details (#7), favorites link and page (#8/#9), a favorites counter in the nav, any style changes, a separate NotFound component file, retry button, extracting the data gate into its own module.

## Resolved decisions

1. Navigation and "Page not found" do not wait for the fetch; only the Spotlight and Gallery routes show loading or error.

## Verification

`npm run test:run`, `npm run lint`, `npm run format:check`, `npm run check`, `npm run build`; then `npm run dev`: both links visible on every page, clicking switches pages, the current link is highlighted, and `/xyz` shows "Page not found" with the nav still visible.
