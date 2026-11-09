# Plan: Issue #13 – Bonus: Testing Components

Issue: #13 "13: Bonus - Testing Components" (https://github.com/RukiDV/Art_Gallery_App/issues/13)
Branch: `feature/13-testing-components`

## Summary

Issue #13 (bonus) asks that automated tests cover the core components and show that they render and function as expected. Its tasks are tests for the Spotlight component, the art piece preview and list, the navigation links, and the art piece details. Issues #4 to #12 are merged. Because every issue so far was built test-first, these four areas already have tests next to their components (110 tests in 14 files pass): `SpotlightPage.test.tsx` (5), `ArtPiecePreview.test.tsx` (5), `ArtPieceList.test.tsx` (4), `Navigation.test.tsx` (6) and `ArtPieceDetailsPage.test.tsx` (14), plus `FavoriteButton`, `FavoritesPage`, `Comments`, `CommentForm`, `ColorPalette`, `storage`, `randomArtPiece`, `fetcher` and `App`. The project has no coverage threshold (`vite.config.ts`: v8 provider, `text` and `lcov` reporters).

## Approach

This issue is an audit, not new behavior:

1. Run `npm run coverage` and read the text report for the core components (`SpotlightPage`, `ArtPiecePreview`, `ArtPieceList`, `Navigation`, `ArtPieceDetailsPage`, plus the other components for context). The `coverage/` output is generated and not committed.
2. Compare each task of the issue with the existing tests and record the mapping in the plan file and the PR body.
3. Add tests only where the report shows a real untested behavior of those components (a branch or line reachable through a user-visible behavior). Each new test follows the project rules: roles, text and interactions, no implementation details; `MemoryRouter` around anything with `Link` or `NavLink`.
4. If the audit finds no real gap, the branch contains only the plan with the mapping, and no test file is touched. No tests are added just to raise a number.

## AC coverage

| AC / task                                               | Existing tests that cover it                                                                                                                                                            | Action                                                |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Core components render and function as expected (AC)    | all component test files listed above                                                                                                                                                   | Confirm with the coverage report; fill real gaps only |
| Tests for the Spotlight component                       | `SpotlightPage.test.tsx`: image, artist (and no other), same piece on re-render, favorite button, toggle reports slug; `randomArtPiece.test.ts`: selection                              | Audit; add only if a gap shows                        |
| Tests for the art piece preview and the list            | `ArtPiecePreview.test.tsx`: image, title, artist, link to details, button outside the link; `ArtPieceList.test.tsx`: list items, a button per piece, pressed state, toggle reports slug | Audit; add only if a gap shows                        |
| Tests for the navigation (links rendered correctly)     | `Navigation.test.tsx`: Spotlight, Gallery and Favorites links with their hrefs and order, highlight on each route                                                                       | Audit; add only if a gap shows                        |
| Tests for the art piece details (all details displayed) | `ArtPieceDetailsPage.test.tsx`: image, title, artist, year, genre, palette, comments, form, back link, favorite button, not found                                                       | Audit; add only if a gap shows                        |

## Files to change

- `docs/plans/13-testing-components.md` (this file): updated with the audit result (coverage numbers and the task-to-test mapping filled in).
- Test files next to the components (modify, only if the audit finds a gap): the specific `*.test.tsx` of the component with the gap.
- No application code changes.

## Out of scope

A coverage threshold or a coverage gate in CI or Sonar, changing or merging existing tests, refactoring tests or components, end-to-end or browser tests, snapshot tests, tests only to raise a percentage, new features or bug fixes (if the audit uncovers a real bug, stop and ask).

## Resolved decisions

1. Scope: coverage audit, fill real gaps only, record the mapping (chosen over closing without a PR and over writing extra tests regardless of gaps).

## Notes

- New tests for behavior that already works pass on first run, so they cannot be "red" first. To show each new test really checks something, confirm it fails against a deliberately broken version of the code (reverted right after) before keeping it.
- If a new test would need a code change to pass, that is a finding and not part of this issue: stop and ask.

## Audit result

`npm run coverage` before the audit: 110 tests, all files 96.13% statements and 97.53% branches.

- All ten components in `src/components` are at 100% statements, branches, functions and lines, including the five named in the issue (`SpotlightPage`, `ArtPiecePreview`, `ArtPieceList`, `Navigation`, `ArtPieceDetailsPage`).
- Not covered: `src/index.tsx` (the entry file that mounts the app; already excluded from coverage in `sonar-project.properties`), `src/types.ts` (types only) and one branch in `src/App.tsx`.
- The one real gap: `App.tsx` line 47, the `: info` branch of the state update. It is reached only when a piece that already has stored info is changed while another piece also has stored info. No test did that: every test changed one piece at a time, or added a second piece through the "append" path.
- Added a test in `App.test.tsx`: "only changes the art piece whose favorite button is clicked" (favorite A, favorite B, unfavorite A: A is not pressed, B stays pressed).
- Mutation check: replacing the update with one that changes every stored entry makes exactly this test fail and nothing else; the real code passes. The first version of the test passed against the broken code (it only reached the append path), so it was rewritten before being kept.
- A second gap that line coverage cannot show: the "oldest first" order of comments chosen in #10 was only tested for rendering a given list, never for adding two comments through `App`. Added "lists comments oldest first" in `App.test.tsx` (add two comments, they appear first then second). Mutation check: changing `addComment` to prepend makes exactly this test fail; the real code passes.
- After: 112 tests, `App.tsx` at 100% branches, all files 98.78% branches.
- Nothing else needed: the remaining uncovered code is the entry file and a types-only file, and trimming, whitespace, persistence and the not-found states are already tested at both component and `App` level.
- No application code changed, and no coverage threshold was added.

## Verification

`npm run coverage` (report read, `coverage/` not committed), then `npm run test:run`, `npm run lint`, `npm run format:check`, `npm run check`, `npm run build`.
