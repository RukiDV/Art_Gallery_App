export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "art-gallery-theme";

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

function getSystemTheme(): Theme {
  // matchMedia is missing in some environments (for example in tests).
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function loadTheme(): Theme {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (isTheme(savedTheme)) {
      return savedTheme;
    }
  } catch {
    // Blocked storage: use the system setting.
  }

  return getSystemTheme();
}

export function saveTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // The mode still works for this visit when it cannot be saved.
  }
}
