# 3: Setup - SonarQube Cloud and Branch Protection

This is the last setup issue. SonarQube Cloud checks the quality of every pull request, and `main` is protected.

## Value Proposition

**As a** developer

**I want to** have an automatic quality check and a protected `main` branch

**so that** only tested and clean code is merged.

## Acceptance Criteria

- [ ] SonarQube Cloud analyzes every pull request, and the quality gate shows up as a check.
- [ ] The coverage of the tests shows up in SonarQube Cloud.
- [ ] Test files are marked as tests, not as source code.
- [ ] `main` is protected: the checks `ci` and the quality gate are required, approvals are not required.

## Tasks

- [ ] In the browser: create the organization and the project in SonarQube Cloud, switch off the automatic analysis and add the token as the GitHub secret `SONAR_TOKEN`. Never paste the token into a prompt.
- [ ] Add `sonar-project.properties` and `.github/workflows/sonar.yml` like in the Code Quality Tooling and Code Review session: the coverage runs before the scan, with `fetch-depth: 0`.
- [ ] After the workflows of issues 2 and 3 ran at least once: set up branch protection for `main` in the settings of your repository.

<details>
<summary>Hint ✨</summary>

The test patterns have to cover `.ts` and `.tsx` files, as a comma-separated list: `src/**/*.test.ts,src/**/*.test.tsx`. Entry files without tests, such as `src/index.tsx`, belong in `sonar.coverage.exclusions`.

Do not require approvals in the branch protection: you work alone, and nobody can approve their own pull request.

</details>
