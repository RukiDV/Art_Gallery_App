# Plan: Issue #46 – Bonus: Retry After a Failed Fetch

Issue: #46 "18: Bonus - Retry After a Failed Fetch" (https://github.com/RukiDV/Art_Gallery_App/issues/46)
Branch: `feature/46-retry-after-a-failed-fetch`

## Summary

When the art pieces cannot be loaded, show a "Try again" button next to the error message. Issues #4 to #55 are merged. `App.tsx` loads the art pieces once with `useSWR<ArtPiece[], Error>(ART_PIECES_URL, fetcher)` and reads `data`, `isLoading` and `error`. `withArtPieces(render)` is used by the Spotlight, Gallery, Details and Favorites routes: it shows "Failed to load the art pieces. Please try again later." when `error` is set, "Loading art pieces…" while loading, and otherwise renders the page. The navigation and the "Page not found" route do not use it and do not wait for the fetch. SWR keeps the previous `error` while it revalidates, and `isLoading` is only true on the very first load, so a retry needs an extra rule to show the loading message again. By default SWR also retries failed requests by itself with a growing delay.

## Approach

- `src/App.tsx`: read `isValidating` and `mutate` from `useSWR` too, and pass the option `{ shouldRetryOnError: false }` (the user's button replaces SWR's silent automatic retries, so the screen does not flip between the error and loading on its own).
- `withArtPieces` order of checks:
  1. `isValidating && !artPieces`: show "Loading art pieces…". This covers the first load and a retry (SWR still holds the old `error` then).
  2. `error`: show the existing message plus `<button type="button" onClick={() => mutate()}>Try again</button>`.
  3. `!artPieces`: show "Loading art pieces…" (safety net, as before).
  4. otherwise `render(artPieces)`.
- Because the button lives in `withArtPieces`, it appears on every page that needs the data (Spotlight, Gallery, Details, Favorites) and nowhere else. Navigation and "Page not found" are unchanged.
- No new component, no CSS.

## AC coverage

| AC                                                                                               | Change                                  | Test                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------ | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The error message is shown together with a "Try again" button                                    | error branch                            | `App.test.tsx`: a failing fetch shows the message and a button named "Try again"                                                                                                                                   |
| Clicking "Try again" loads the art pieces again, and the loading message is shown while it loads | `mutate()` + loading check before error | `App.test.tsx`: first fetch fails, second never resolves: after the click the loading message is shown, the error message and the button are gone, and `fetch` was called twice                                    |
| When the second try works, the art pieces are displayed and the message and the button are gone  | data replaces the error                 | `App.test.tsx`: first fetch fails, second works: the pieces are listed, no error message, no button                                                                                                                |
| When the second try fails again, the error message and the button are displayed again            | error branch again                      | `App.test.tsx`: both fetches fail: after the click and the loading state the message and the button are back; a third click can still succeed                                                                      |
| The button is not displayed when loading worked                                                  | button only in the error branch         | `App.test.tsx`: a working fetch shows the pieces and no "Try again" button                                                                                                                                         |
| The button works on every page that shows the error                                              | `withArtPieces` is shared               | `App.test.tsx`: `it.each` over `/`, `/art-pieces`, `/art-pieces/the-harvesters` and `/favorites`: a failing fetch shows message and button; a retry that works shows the page on the Gallery and on a details page |
| (task) add the button to the error state                                                         | `App`                                   | rows above                                                                                                                                                                                                         |
| (task) use `mutate` from `useSWR`                                                                | `App`                                   | rows above                                                                                                                                                                                                         |
| (task) test both outcomes (fails once then works, keeps failing)                                 | tests                                   | rows above                                                                                                                                                                                                         |
| (note) not-found pages and the navigation stay as they are                                       | unchanged                               | `App.test.tsx`: with a failing fetch, an unknown URL shows "Page not found" and no "Try again"; the navigation is still shown                                                                                      |

Existing tests keep their assertions. The existing error tests look for the text `/error|failed/i`, which only the message matches (the button text is "Try again").

## Files to change

- `src/App.tsx` (modify): `isValidating`, `mutate`, the option and the new check order and button.
- `src/App.test.tsx` (modify): the new tests (new tests only).

## Out of scope

A limit on the number of retries, a delay or backoff, automatic retries, details about why the request failed, styling the button, a retry for the not-found page, changing the fetcher or the error message text, a global SWR configuration.

## Resolved decisions

1. SWR's automatic background retries are switched off (`shouldRetryOnError: false`). With them on, the screen would change between the error and the loading message by itself every few seconds, which is confusing next to a manual button. A failed load now waits for the user's click (SWR still revalidates when the browser tab regains focus, which is its default).
2. The loading message wins over the error while a revalidation without data is running, because SWR keeps the old `error` during a retry.

## Notes

- The fetch is mocked per call: `vi.fn().mockResolvedValueOnce({ ok: false, status: 500 })` for a failure, `{ ok: true, json: async () => artPieces }` for success, and a promise that never resolves for "still loading". The tests already use a fresh SWR cache per render (`provider: () => new Map()`).
- Mutation checks at the end, each must make a test fail: a button without a click handler; checking `error` before the loading state (so the error stays while retrying); showing the button when loading worked. Removing `shouldRetryOnError: false` is not testable in jsdom within the test time (the first automatic retry comes after about 5 seconds), so it is only reviewed in the code.

## Verification

`npm run test:run`, `npm run lint`, `npm run format:check`, `npm run check`, `npm run build`; then `npm run dev`: block the network in the browser dev tools (offline) and open the app: the error and "Try again" appear; go back online and click it: "Loading art pieces…" and then the page; check the button on the Spotlight, Gallery, a details page and Favorites.
