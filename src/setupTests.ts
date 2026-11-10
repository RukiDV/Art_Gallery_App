import "@testing-library/jest-dom/vitest";

// Stored data and the theme of one test must never leak into the next one.
afterEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
});
