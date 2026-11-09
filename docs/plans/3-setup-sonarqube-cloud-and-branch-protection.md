# Plan: Issue #3 – Setup: SonarQube Cloud and Branch Protection

Issue: #3 "Setup - SonarQube Cloud and Branch Protection"
Branch: `feature/3-setup-sonarqube-cloud-and-branch-protection`

## Summary

Add a GitHub Actions workflow that runs tests with coverage and then a SonarQube Cloud scan on every pull request and push to `main`, plus `sonar-project.properties` with the project/organization keys, test patterns and coverage exclusions. Then `main` is protected (required checks `ci` and the Sonar quality gate, no required approvals) by the user in GitHub settings.

## Findings from exploration

- Workflows: `ci.yml` (job `ci`, Node 22, `actions/checkout@v6`, `actions/setup-node@v7`) and `create-issues.yml`. No `sonar-project.properties`, no `sonar.yml`.
- `npm run coverage` exists and writes `coverage/lcov.info` (`vite.config.ts`: v8, reporters `text` + `lcov`, `include: src/**/*.{ts,tsx}`).
- No test files exist yet (`passWithNoTests: true`); the coverage report will be empty but valid until feature issues add tests.
- Entry file without tests: `src/index.tsx` (also `src/setupTests.ts`, `src/vite-env.d.ts`).
- `main` is currently not protected (GitHub API 404). Repo is public; user is admin.
- User has already created the SonarQube Cloud project and added the `SONAR_TOKEN` GitHub secret. Keys: organization `rukidv`, project key `RukiDV_Art_Gallery_App`.
- Latest `SonarSource/sonarqube-scan-action` major tag is `v8` (exists).

## AC coverage

| AC                                                                       | Change                                                                                                                                                                                                                          | Verification                                                                                                                       |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| SonarQube Cloud analyzes every PR; the quality gate shows up as a check  | `.github/workflows/sonar.yml` on `pull_request` and `push` to `main`; `fetch-depth: 0`; scan action with `SONAR_TOKEN`                                                                                                          | Open the PR: the Sonar quality gate check appears and the run is green; analysis visible in SonarQube Cloud                        |
| Test coverage shows up in SonarQube Cloud                                | Workflow runs `npm ci` and `npm run coverage` before the scan; `sonar.javascript.lcov.reportPaths=coverage/lcov.info`                                                                                                           | Coverage panel for the PR/`main` in SonarQube Cloud (0% is expected until tests exist, but the report must be read without errors) |
| Test files are marked as tests, not source                               | `sonar.tests=src`, `sonar.test.inclusions=src/**/*.test.ts,src/**/*.test.tsx`, and matching `sonar.exclusions` for tests; `sonar.coverage.exclusions` for `src/index.tsx`, `src/setupTests.ts`, `src/vite-env.d.ts`, test files | Read the properties; check in SonarQube Cloud that a test file counts as test code once one exists                                 |
| `main` protected: `ci` and quality gate required, approvals not required | **Manual (user)** in Settings > Branches: rule for `main`, require status checks `ci` and the Sonar check, no required approvals                                                                                                | Settings page; `gh api repos/RukiDV/Art_Gallery_App/branches/main/protection` shows both contexts and no review requirement        |

Test-first note: no unit test applies. "Red" = the structural Python check (YAML + properties) fails before the files exist; green after. The real proof is the Sonar run on the PR.

## Files to change

- `sonar-project.properties` (new) – organization `rukidv`, project key `RukiDV_Art_Gallery_App`, `sonar.sources=src`, test inclusions, coverage exclusions, lcov path.
- `.github/workflows/sonar.yml` (new) – job: checkout (`fetch-depth: 0`), setup-node 22 with npm cache, `npm ci`, `npm run coverage`, `SonarSource/sonarqube-scan-action@v8` with `SONAR_TOKEN`. Permissions `contents: read`; add `pull-requests: read` if the action needs it.
- `docs/plans/3-setup-sonarqube-cloud-and-branch-protection.md` (new) – this plan, committed by the plan skill.

## Out of scope

- Creating the SonarQube Cloud org/project and the `SONAR_TOKEN` secret (already done by the user in the browser); I never see or handle the token.
- Applying branch protection (user does it manually).
- Quality gate customization, coverage thresholds, writing tests or app code.
- Changing `ci.yml`, `vite.config.ts` or lint config.
- npm audit vulnerabilities.

## Resolved decisions

1. **Branch protection**: done manually by the user after both workflows ran once on the PR/`main`, so the exact check names can be picked from GitHub's list (the Sonar check name is confirmed from that list, not guessed).
2. **Sonar keys**: organization `rukidv`, project key `RukiDV_Art_Gallery_App` (from the user).
3. **Action version**: `SonarSource/sonarqube-scan-action@v8`, major tag, consistent with the other workflows.

## Open concerns

- The quality-gate check only appears after the first successful scan on a PR, so the "required checks" step has to follow the first PR run.
- The Sonar check is produced by the SonarQube Cloud GitHub app or the workflow depending on the project's analysis mode (automatic analysis must stay off, which the user did).

## Verification

Locally: structural check of both files; `npm run coverage` writes `coverage/lcov.info`; `npm run check`, `lint`, `test:run`, `build`, `format:check` exit 0. On GitHub: PR shows `ci` and the Sonar check green; SonarQube Cloud shows the analysis and coverage; after merge, a Sonar run on `main`; then the user sets branch protection and verifies with `gh api .../branches/main/protection`.
