# Plan: Issue #1 – Setup: Tooling and CLAUDE.md

Issue: #1 "Setup - Tooling and CLAUDE.md"
Branch: `feature/1-setup-tooling-and-claude-md`

## Summary

Add the check scripts (`test:run`, `coverage`, `lint`, `format`, `format:check`) and a project `CLAUDE.md` so the agent and the developer verify every change the same way. Pure tooling/docs; no application code changes.

## Findings from exploration

- `package.json` has only `dev`, `build`, `serve`, `check` (tsc), `test` (watch mode). No ESLint, Prettier or `@vitest/coverage-v8` installed. `.prettierrc.json` already exists.
- Vitest config lives in the `test` block of `vite.config.ts` (jsdom, globals, `setupFiles`, `passWithNoTests`). No `vitest.config.ts` – must not create one.
- `.gitignore` has `node_modules`, `/dist`, `.DS_Store`, `.env*`; no `coverage/`.
- No existing tests; source is `src/{App,index}.tsx`, `setupTests.ts`, `styles.css`. TS is strict, `include: ["src"]`.
- No `CLAUDE.md`, no `eslint.config.*`.

## AC coverage

| AC                                                     | Change                                                                                                                                       | Verification                        |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| CLAUDE.md has Stack, Commands, Conventions, Off limits | New `CLAUDE.md` (from `/init`, shortened)                                                                                                    | Read file; four headings present    |
| Off limits has the 4 required rules                    | Written into `CLAUDE.md`                                                                                                                     | Read file                           |
| `npm run test:run` runs all tests once                 | script `vitest run`                                                                                                                          | Run it, exit 0                      |
| `npm run coverage` writes `coverage/lcov.info`         | script `vitest run --coverage`; `coverage` block in `vite.config.ts` (provider v8, reporters incl. `lcov`, `include: ["src/**/*.{ts,tsx}"]`) | Run it; `coverage/lcov.info` exists |
| `npm run lint` runs ESLint                             | `eslint.config.js` flat config (`@eslint/js`, `typescript-eslint`, `eslint-plugin-sonarjs`); script `eslint .`                               | Run it, exit 0                      |
| `format` / `format:check` with Prettier                | scripts `prettier --write .` / `prettier --check .`; `.prettierignore`                                                                       | Run both, exit 0                    |
| `coverage/` in `.gitignore`                            | Add line                                                                                                                                     | `git check-ignore coverage`         |
| All scripts run without errors                         | —                                                                                                                                            | Run every script at the end         |

## Test-first approach

Config/doc work has no unit-testable behavior, so the "red" step is: run each script before adding it (fails: missing script/dependency / no lcov file), add the minimum config, rerun until green.

## Files to change

- `package.json` / `package-lock.json` – new scripts; devDeps `@vitest/coverage-v8` (matching vitest 2.x), `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-sonarjs`, `prettier`.
- `vite.config.ts` – add `coverage` settings inside the existing `test` block.
- `eslint.config.js` (new) – flat config, `ignores` for `dist`, `coverage`, `node_modules`.
- `.prettierignore` (new) – `node_modules`, `dist`, `coverage`, `package-lock.json`, `.claude`, etc.
- `.gitignore` – add `coverage/`.
- `CLAUDE.md` (new) – Stack, Commands (the exact scripts above plus `check`, `build`), Conventions, Off limits.
- Possibly reformat existing files if `format:check` flags them (e.g. `README.md`, `docs/`).

## Out of scope

- CI pipeline (issue #2), SonarQube/branch protection (#3), coverage thresholds.
- Writing app tests or feature code; changing `passWithNoTests`.
- Editing `.claude/settings.json` or the skills/agent files.
- Unrelated untracked files (`.bashrc`, `.idea`, etc.).

## Resolved decisions (open questions, approved with the plan)

1. **Prettier scope**: whole repo minus `.prettierignore`; reformat only what `format:check` flags.
2. **ESLint rules**: recommended presets only (`js.configs.recommended`, `tseslint.configs.recommended`, `sonarjs.configs.recommended`), no custom rules.
3. **Dependency versions**: latest compatible with Vite 5 / Vitest 2 (`@vitest/coverage-v8@^2.1.9`).
4. The plan commit contains only this plan file.

## Verification

Run in order: `npm run test:run`, `npm run coverage` (check `coverage/lcov.info`), `npm run lint`, `npm run format:check`, `npm run check`, `npm run build`. All must exit 0.
