import { mockColorScheme } from "./mockColorScheme";
import { loadTheme, saveTheme, THEME_STORAGE_KEY } from "./theme";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("loadTheme", () => {
  it.each(["light", "dark"] as const)(
    "uses the system setting %s when nothing is saved",
    (scheme) => {
      mockColorScheme(scheme);

      expect(loadTheme()).toBe(scheme);
    }
  );

  it.each([
    ["light", "dark"],
    ["dark", "light"],
  ] as const)(
    "prefers the saved %s over the system setting %s",
    (saved, scheme) => {
      mockColorScheme(scheme);
      localStorage.setItem(THEME_STORAGE_KEY, saved);

      expect(loadTheme()).toBe(saved);
    }
  );

  it.each(["blue", "", "null", "{}", '"dark"', "DARK", "dark "])(
    "ignores the broken saved value %j and uses the system setting",
    (broken) => {
      mockColorScheme("dark");
      localStorage.setItem(THEME_STORAGE_KEY, broken);

      expect(loadTheme()).toBe("dark");
    }
  );

  it("is light when nothing is saved and matchMedia does not exist", () => {
    expect(window.matchMedia).toBeUndefined();

    expect(loadTheme()).toBe("light");
  });

  it("uses the system setting when reading the storage throws", () => {
    mockColorScheme("dark");
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });

    expect(loadTheme()).toBe("dark");
  });
});

describe("saveTheme", () => {
  it.each(["light", "dark"] as const)("saves %s under its own key", (theme) => {
    saveTheme(theme);

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(theme);
    expect(THEME_STORAGE_KEY).toBe("art-gallery-theme");
  });

  it("does not touch the saved art pieces", () => {
    localStorage.setItem("art-pieces-info", "[]");

    saveTheme("dark");

    expect(localStorage.getItem("art-pieces-info")).toBe("[]");
  });

  it("does not throw when saving fails", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });

    expect(() => saveTheme("dark")).not.toThrow();
  });
});
