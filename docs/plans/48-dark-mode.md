# Plan: Issue #48 – Bonus: Dark Mode

Issue: #48 "20: Bonus - Dark Mode" (https://github.com/RukiDV/Art_Gallery_App/issues/48). Branch: `feature/48-dark-mode`.

## Summary

The navigation gets a button that switches the app between a light and a dark look. The colors in `src/styles.css` move into CSS custom properties (one set per mode, selected by `data-theme` on `<html>`). The mode starts from the saved choice, otherwise from the system setting (`prefers-color-scheme`), and a click saves the choice in `localStorage` under its own key.

## Approach

- `src/theme.ts` (new): `type Theme = "light" | "dark"`, `THEME_STORAGE_KEY = "art-gallery-theme"`, `loadTheme()` and `saveTheme(theme)`.
  - `loadTheme()`: a saved value counts only if it is exactly `"light"` or `"dark"`; anything else (broken value, empty, other text) is ignored. Without a valid saved value it uses `window.matchMedia("(prefers-color-scheme: dark)")`; if `matchMedia` is missing, the result is `"light"`. Every `localStorage` access is in `try/catch` (same style as `src/storage.ts`), so the app works when storage is blocked.
  - `saveTheme()`: `try/catch`, never throws.
- `src/components/ThemeToggle.tsx` (new): keeps the theme in `useState(loadTheme)`, sets `document.documentElement.dataset.theme` in an effect, and renders a `<button type="button">` labeled by what a click does: "Switch to dark mode" (in light) / "Switch to light mode" (in dark). A click flips the theme and saves it. The choice is saved on click only, so a user who never clicks keeps following the system setting.
- `src/components/Navigation.tsx` (modify): renders `<ThemeToggle />` after the links. The component owns its state, so `App.tsx`, the `Navigation` props and the existing Navigation/App tests stay unchanged.
- `src/styles.css` (modify): all colors become custom properties on `:root` (light values = today's colors, so the light look does not change) and a second set under `:root[data-theme="dark"]`. Also `color-scheme: light` / `dark`, so native fields, buttons and select menus follow the mode. A small style for the toggle button in the nav.
- `src/mockColorScheme.ts` (new, test helper like `mockRandom.ts`): `mockColorScheme("dark" | "light")` stubs `window.matchMedia` (it does not exist in jsdom).
- `src/setupTests.ts` (modify): the existing `afterEach` also removes `data-theme` from `<html>`, so one test cannot leak into the next.

## Colors (my choices; ratios are checked at the end, not guessed)

Tokens: page background/text, muted text (comment meta), borders, nav background/link/active link, favorite button background/icon/pressed, color-filter outline, hover text. Light = today's values. Dark ≈ page `#16161a`, text `#ececec`, muted `#a8a8b3`, nav `#0d0d10`, nav links `#b8b8c2`/active `#fff`, favorite button `#2a2a32` with icon `#d0d0d8`, pressed `#ff6b9a`. Before committing I compute the contrast ratio of every text/background pair with a throwaway script (target at least 4.5:1) and adjust values if needed; the numbers go into the PR.

## AC coverage

| AC                                                            | Change                                       | Test                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Navigation button switches the mode; label tells what happens | `ThemeToggle` in `Navigation`                | `ThemeToggle.test.tsx`: light → "Switch to dark mode", click → "Switch to light mode" and back; `Navigation.test.tsx` (new test): the button is in the navigation; `App.test.tsx`: button on `/`, `/art-pieces`, `/favorites`, a details page                     |
| Start with the system setting                                 | `loadTheme` fallback to `matchMedia`         | `theme.test.ts`: system dark → `"dark"`, system light → `"light"`; `ThemeToggle.test.tsx`: dark system shows "Switch to light mode" and `data-theme="dark"` on `<html>`                                                                                           |
| Switch changes the colors on all pages                        | `data-theme` on `<html>` + tokens everywhere | `App.test.tsx`: after the click, `<html>` has `data-theme="dark"` and keeps it when navigating to the Gallery, Favorites and a details page. The actual colors: manual check (jsdom does not render CSS)                                                          |
| Enough contrast in both modes                                 | token values                                 | not testable by the automated tests: contrast script (ratios in the PR) + manual check of every page in both modes                                                                                                                                                |
| Choice kept after a reload                                    | `saveTheme` on click, `loadTheme` at start   | `ThemeToggle.test.tsx`: click saves under `art-gallery-theme`; a fresh render ("reload") with the saved `"dark"` starts in dark even when the system says light, and the reverse; `App.test.tsx`: switch, unmount, render again → still dark                      |
| Works without a saved choice; broken value ignored            | validation in `loadTheme`, `try/catch`       | `theme.test.ts`: nothing saved → system setting; saved `"blue"`, `""`, `"null"`, `"{}"` → ignored (system setting); `localStorage.getItem` throwing → system setting; `matchMedia` missing → `"light"`; `setItem` throwing → no error and the mode still switches |
| (task) CSS custom properties per mode                         | `styles.css`                                 | manual check + build; no hard-coded colors left in rules (checked by search)                                                                                                                                                                                      |
| (task) mode in state, saved under its own key                 | `ThemeToggle` + `THEME_STORAGE_KEY`          | rows above; the existing `art-pieces-info` data stays untouched (test)                                                                                                                                                                                            |

## Files to change

- `src/theme.ts` + `src/theme.test.ts` (new)
- `src/components/ThemeToggle.tsx` + `src/components/ThemeToggle.test.tsx` (new)
- `src/mockColorScheme.ts` (new test helper)
- `src/components/Navigation.tsx` (modify) + `Navigation.test.tsx` (new tests only)
- `src/styles.css` (modify)
- `src/setupTests.ts` (modify: reset `data-theme` between tests)
- `src/App.test.tsx` (modify: new tests only)
- Existing tests: none should change. If one unexpectedly fails, stop and ask.

## Out of scope

Following later changes of the system setting while the app is open, a "system" third option, avoiding the brief light flash before the page loads (needs an inline script in `index.html`), per-image dimming, animations/transitions, a `theme-color` meta tag, changing layout or any other styling.

## Resolved decisions (approved)

1. The state lives in `ThemeToggle` (not in `App`), so no props and no existing tests change.
2. The choice is saved on click only; the system setting is read once at the start.
3. Without `matchMedia` the app falls back to light.
4. Dark colors are my choice and verified by a contrast script; you check the look in the browser.

## Verification

`npm run test:run`, `lint`, `format:check`, `check`, `build`; mutation checks (each must fail a test): button label not flipping, not saving on click, saved value taking no priority over the system, broken value accepted, `matchMedia` missing crashing, `data-theme` not set, choice saved under the wrong key. Manual (`npm run dev`): click through `/`, `/art-pieces` (open the filters), a details page (comments, edit form, history), `/favorites` and the error/not-found messages in both modes; reload keeps the choice; clear storage and change the system theme to see the fallback.
