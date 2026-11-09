# Plan: Issue #2 – Setup: CI Pipeline

Issue: #2 "Setup - CI Pipeline"
Branch: `feature/2-setup-ci-pipeline`

## Summary

Add a GitHub Actions workflow `.github/workflows/ci.yml` that runs on every pull request and every push to `main`, with one job `ci` that installs dependencies with `npm ci` and runs the same checks as local development (`check`, `lint`, `test:run`, `build`). Config only; no application code.

## Findings from exploration

- Only one workflow exists: `.github/workflows/create-issues.yml` (uses `actions/checkout@v6`, `ubuntu-latest`, 2-space YAML). Follow its style.
- Scripts from issue #1 exist in `package.json`: `check`, `lint`, `test:run`, `build` (also `format:check`, `coverage`). `package-lock.json` is committed, so `npm ci` works.
- README requires Node.js 22.22 or newer; there is no `.nvmrc` or `engines` field.
- `CLAUDE.md` Commands section lists the checks to run before finishing a change.
- No tests exist yet (`passWithNoTests: true`), so `test:run` passes with zero tests.

## AC coverage

| AC                                                                                           | Change                                                                                                     | Verification                                                             |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `ci.yml` runs on every PR and every push to `main`                                           | `on: pull_request` (no branch filter) and `on: push: branches: [main]`                                     | Read the YAML; PR run and the push-to-main run appear in the Actions tab |
| Job `ci` runs `npm ci`, `npm run check`, `npm run lint`, `npm run test:run`, `npm run build` | One job named `ci` with those five steps in that order, after checkout and setup-node (Node 22, npm cache) | Read the YAML; all steps visible in the job log                          |
| Check `ci` is green in this issue's PR                                                       | Push the branch and open the PR                                                                            | Check `ci` shows green on the PR (`gh pr checks`)                        |

Test-first note: a workflow has no unit test. "Red" = no workflow, so no `ci` check exists. Before pushing, run each of the five commands locally in order and validate the YAML syntax. The real proof is the green run on the PR.

## Files to change

- `.github/workflows/ci.yml` (new) – the workflow. Contents: `name: ci`; triggers; `permissions: contents: read`; job `ci` on `ubuntu-latest`; steps: `actions/checkout`, `actions/setup-node` (Node 22, `cache: npm`), `npm ci`, `npm run check`, `npm run lint`, `npm run test:run`, `npm run build`.
- `docs/plans/2-setup-ci-pipeline.md` (new) – this plan, committed by the plan skill.

## Out of scope

- SonarQube Cloud, coverage upload and branch protection (issue #3); making `ci` a required check.
- Adding `format:check` or `coverage` to CI (not in the AC).
- Deploy workflow, caching beyond npm, matrix builds, `.nvmrc` / `engines`.
- Fixing the npm audit vulnerabilities.
- Editing `create-issues.yml` or any application code.

## Resolved decisions (open questions, approved with the plan)

1. **Node version**: `node-version: 22`.
2. **Action versions**: `actions/checkout@v6` and the latest major `actions/setup-node`, pinned by major tag.
3. **`format:check`**: not in CI; the job matches the AC exactly.
4. **Green check on the PR**: the branch is pushed and the PR opened by the user if SSH push fails in the agent session.

## Verification

Locally: `npm ci` (needs network; the install itself is not re-run in the sandbox if unnecessary), then `npm run check`, `npm run lint`, `npm run test:run`, `npm run build` all exit 0, and `ci.yml` parses as valid YAML. On GitHub: open the PR, confirm the `ci` check runs and is green with `gh pr checks`; after merge, confirm a run is triggered on `main`.
