import "@testing-library/jest-dom/vitest";

// Stored data from one test must never leak into the next one.
afterEach(() => {
  localStorage.clear();
});
