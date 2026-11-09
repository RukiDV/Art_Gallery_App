# Bonus: Dark Mode

This is a bonus story. It works on its own, but it is easier when the pages of the app exist.

## Value Proposition

**As an** art enthusiast

**I want to** switch the app between a light and a dark look

**so that** I can look at art comfortably, also in the evening.

## Acceptance Criteria

- [ ] The navigation has a button that switches between light and dark mode. Its label tells what happens on click, for example "Switch to dark mode".
- [ ] At the start, the app uses the setting of the operating system (`prefers-color-scheme`).
- [ ] The switch changes the colors on all pages.
- [ ] Text keeps enough contrast to the background in both modes.
- [ ] The choice of the user is kept after a reload.
- [ ] Without any saved choice, the app still works.

## Tasks

- [ ] Move the colors of your CSS into CSS custom properties, one set for each mode.
- [ ] Keep the current mode in state, and save it in the local storage.
- [ ] Test that the saved choice is used, and that the app works without one.

<details>
<summary>Hint ✨</summary>

Set an attribute on the `<html>` element, for example `data-theme="dark"`, and define the custom properties for `:root[data-theme="dark"]` in CSS.

`window.matchMedia("(prefers-color-scheme: dark)").matches` tells the setting of the operating system. It does not exist in the test environment: replace it with a mock.

</details>
