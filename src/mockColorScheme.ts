/**
 * Test helper: `window.matchMedia` does not exist in jsdom. This stubs it so
 * that `(prefers-color-scheme: dark)` matches only for the "dark" system
 * setting. Undo it with `vi.unstubAllGlobals()`.
 */
export function mockColorScheme(scheme: "light" | "dark") {
  vi.stubGlobal(
    "matchMedia",
    (query: string): MediaQueryList =>
      ({
        matches: scheme === "dark" && query === "(prefers-color-scheme: dark)",
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList
  );
}
