# Bonus: Retry After a Failed Fetch

This is a bonus story. It builds on story 4 (Gallery Page), which already shows an error state.

## Value Proposition

**As an** art enthusiast

**I want to** try again when the art pieces could not be loaded

**so that** I do not have to reload the whole page after a short network problem.

## Acceptance Criteria

- [ ] When the art pieces could not be loaded, the error message is displayed together with a "Try again" button.
- [ ] Clicking "Try again" loads the art pieces again.
- [ ] While loading again, the loading state is displayed.
- [ ] When the second try works, the art pieces are displayed and the error message is gone.
- [ ] When the second try fails again, the error message and the button are displayed again.
- [ ] The button is not displayed when loading worked.

## Tasks

- [ ] Add the "Try again" button to your error state.
- [ ] Use the function that `useSWR` gives you to load the data again.
- [ ] Test both outcomes: a fetch that fails once and then works, and a fetch that keeps failing.

<details>
<summary>Hint ✨</summary>

`useSWR` returns a `mutate` function. Calling it loads the data again.

For the test, replace `fetch` with a mock that rejects the first time and resolves the second time. Remember that SWR caches data between tests: use a fresh cache for each test, for example with `<SWRConfig value={{ provider: () => new Map() }}>`.

</details>
