# Art Gallery App

Recap Project 6: a gallery app where users browse art pieces, mark favorites and leave comments.

## Stack

- React 19 + TypeScript (strict), Vite 5
- React Router 8 for routing, SWR for data fetching
- Vitest 2 with jsdom, React Testing Library, `@testing-library/user-event`, `@testing-library/jest-dom`
- ESLint (flat config: `@eslint/js`, `typescript-eslint`, `eslint-plugin-sonarjs`) and Prettier
- Source in `src/`; Vitest is configured in the `test` block of `vite.config.ts` (there is no `vitest.config.ts`)

## Commands

| Command                | What it does                                      |
| ---------------------- | ------------------------------------------------- |
| `npm run dev`          | Start the dev server (port 3000)                  |
| `npm run build`        | Production build                                  |
| `npm run check`        | Type check with `tsc --noEmit`                    |
| `npm run test:run`     | Run all tests once                                |
| `npm run coverage`     | Run all tests once and write `coverage/lcov.info` |
| `npm run lint`         | Lint with ESLint                                  |
| `npm run format`       | Format all files with Prettier                    |
| `npm run format:check` | Check formatting with Prettier                    |

Before finishing a change, run: `npm run test:run`, `npm run lint`, `npm run format:check`, `npm run check`, `npm run build`.

## Conventions

- Function components with hooks, written in TypeScript; no `any`.
- Tests live next to the code as `*.test.ts` / `*.test.tsx`; write the test first.
- Test behavior the user sees (roles, text, interactions), not implementation details.
- Follow `.prettierrc.json`; run `npm run format` instead of formatting by hand.
- Small, focused commits with clear messages; one issue per branch and PR.

## Off limits

- Never use `npm test` (it starts watch mode); use `npm run test:run`.
- Never change a test to make it pass; fix the code or ask.
- Never lower a threshold or disable a rule to make a check green.
- Only do what the current issue asks for; no extra features or unrelated refactors.
- Never read, print or commit secrets (`.env`, `.env.*`, `secrets/`).
