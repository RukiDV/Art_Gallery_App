# Plan: Design refresh (no issue)

Branch: `feature/design-refresh`. The user decided: no GitHub issue, one separate branch, all nine suggestions, navigation stays at the bottom.

## Context

All features are done and the app looks basic: default fonts, default browser buttons and fields, plain image grid, a flat nav. Goal: a calm "art gallery" look (warm neutrals, a serif for titles, one deep accent color) that works in light and dark mode. Almost everything is CSS; markup changes are small and keep every accessible name, so the existing tests stay valid.

## Scope (the nine suggestions)

1. **Header** (`App.tsx`): the `h1` sits in a `<header>` (banner landmark) with the serif title and a thin accent rule.
2. **Navigation at the bottom** (`Navigation.tsx`, CSS): a floating, translucent, blurred pill/tab bar. Each link gets an `aria-hidden` icon (Spotlight, Gallery, Favorites) before its label; the link names and texts stay exactly "Spotlight", "Gallery", "Favorites (n)". Clear active state (accent pill). The theme button stays in it.
3. **Typography**: one web font for headings (Fraunces, via a Google Fonts `<link>` with `display=swap` in `index.html`, serif fallback); body stays `system-ui`. A type scale as tokens.
4. **Cards** (`ArtPiecePreview` CSS): surface color, radius, soft shadow, caption padding, image zoom on hover/focus, frosted-glass heart (`backdrop-filter` + translucent token).
5. **Spotlight** (`SpotlightPage.tsx`, CSS): large hero image, gradient with the artist over its bottom, "Show another" (primary) and "Start/Stop slideshow" (secondary) as one button group, crossfade when the piece changes (`key={artPiece.slug}` on the `<img>` plus a CSS fade-in animation).
6. **Buttons and fields**: one button system (secondary by default, `button[type="submit"]` and `.button-primary` filled with the accent, small variant for Edit/Delete/Cancel in comments), consistent `input`/`select` styling, visible `:focus-visible` rings for links, buttons and fields.
7. **Details page** (`ArtPieceDetailsPage.tsx`, CSS): two columns on wide screens (image with heart beside the info), one column on small screens; larger palette swatches; comments as cards; "Back" link styled with an arrow via CSS (text stays "Back").
8. **Gallery filters** (CSS only): the panel as a card; the color filter as pill chips with the swatch (checked = accent outline/fill via `input:checked + …`); the genre `<select>` styled. The genre filter stays a select (turning it into chips would change the interaction and the tests; out of scope).
9. **Polish and states**: tokens for spacing, radius, shadow, motion; `prefers-reduced-motion` turns off transitions and the crossfade; loading, error, not-found, "No favorites yet" and "No art pieces found" get `className="status-message"` and a styled look (error card with the Try again button).

## Tokens

Existing color tokens stay (names, light/dark sets). New: `--surface`, `--surface-raised`, `--accent`, `--accent-contrast`, `--accent-soft`, `--focus-ring`, `--shadow`, `--glass`, radius (`--radius-sm/md/lg`), spacing scale, `--font-heading`, `--ease`/`--duration`. Light: warm off-white page, white-ish cards, burgundy accent (about `#8c2f39`). Dark: dark page, raised dark cards, lighter rose accent with dark text. Final values are set so every text/background pair reaches 4.5:1 (icons/outlines 3:1), verified with the contrast script extended to the new pairs (ratios in the PR text).

## Files to change

- `index.html` (font link) · `src/styles.css` (tokens + all styling; the bulk of the work)
- `src/App.tsx` (`<header>` around the `h1`; `status-message` classes) · `src/components/Navigation.tsx` (icons)
- `src/components/SpotlightPage.tsx` (button group wrapper, `key` on img, primary class) · `src/components/ArtPieceDetailsPage.tsx` (two wrappers + classes, status class) · `src/components/FavoritesPage.tsx`, `GalleryPage.tsx` (status class only)
- Tests (new tests only, written first): `Navigation.test.tsx` (each link has a decorative `aria-hidden` icon; names and texts unchanged), `App.test.tsx` (a banner with the heading "Art Gallery")
- Existing tests: none should change; if one unexpectedly fails, stop and ask.
- `docs/plans/design-refresh.md` (this plan, committed first)

## Order of work (small commits, checks after each)

1. Tokens, fonts, base elements (buttons, fields, focus, motion) → 2. header + nav → 3. cards + Spotlight → 4. details page + comments → 5. filters + status messages → 6. contrast script, full checks, mutation-style sanity checks (e.g. removing the `key` makes the crossfade test-less, so only manual).

## Out of scope

Moving the nav (stays at the bottom), genre chips instead of the select, new features or copy changes, a logo/favicon image, image lazy loading, animation libraries, a theme-color meta tag, re-syncing state.

## Resolved decisions (approved)

1. Mood: calm gallery/museum (my choice, since none was named); accent burgundy, heading font Fraunces.
2. Web font from Google Fonts (no new npm dependency); if offline, the serif fallback shows.
3. No GitHub issue: the PR has no `Closes #…`; I draft it and you open it, or I use `/open-pr`-style steps without an issue number.

## Verification

`npm run test:run`, `lint`, `format:check`, `check`, `build`. Automated tests cannot judge the look, so: contrast script for all pairs in both modes; manual check with `npm run dev` of every page (`/`, `/art-pieces` with the panel open, a details page with comments/edit/history, `/favorites`, error/not-found/empty states) in light and dark, on a wide and a phone-width window, with keyboard focus rings and with reduced motion on.
