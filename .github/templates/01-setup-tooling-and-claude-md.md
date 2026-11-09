# 1: Setup - Tooling and CLAUDE.md

This is the first setup issue: work on the setup issues 1, 2 and 3 before the user stories. The project gets the scripts that check your code, and Claude gets the instructions for this project.

## Value Proposition

**As a** developer

**I want to** have scripts for tests, coverage, linting and formatting, and a `CLAUDE.md` for this project

**so that** the agent and I check every change in the same way.

## Acceptance Criteria

- [ ] `CLAUDE.md` has the four parts **Stack**, **Commands**, **Conventions** and **Off limits**.
- [ ] Off limits contains at least: never use `npm test` (watch mode), never change a test to make it pass, never lower a threshold or disable a rule to make a check green, and only do what the current issue asks for.
- [ ] `npm run test:run` runs all tests once.
- [ ] `npm run coverage` writes the coverage report `coverage/lcov.info`.
- [ ] `npm run lint` checks the code with ESLint.
- [ ] `npm run format` formats the code and `npm run format:check` checks the formatting with Prettier.
- [ ] `coverage/` is in `.gitignore`.
- [ ] All scripts run without errors.

## Tasks

- [ ] Create `CLAUDE.md` with `/init`, then shorten and adapt it.
- [ ] Add the scripts `test:run` and `coverage` (with `@vitest/coverage-v8` and the `lcov` reporter).
- [ ] Set up ESLint with a flat config (`@eslint/js`, `typescript-eslint` and `eslint-plugin-sonarjs`) and the script `lint`.
- [ ] Add the scripts `format` and `format:check` for Prettier.

<details>
<summary>Hint ✨</summary>

Vitest is already configured in the `test` block of `vite.config.ts`. Add the coverage settings there. Do not create a separate `vitest.config.ts`: it takes priority over `vite.config.ts`, and the existing test setup (jsdom, `setupFiles`) would be lost.

The components and their tests are `.tsx` files. In Vitest, every pattern has to cover `.ts` and `.tsx`, for example `src/**/*.{ts,tsx}`.

</details>
