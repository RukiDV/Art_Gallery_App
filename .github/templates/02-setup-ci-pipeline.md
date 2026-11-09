# 2: Setup - CI Pipeline

This is the second setup issue. Every pull request is checked automatically on GitHub.

## Value Proposition

**As a** developer

**I want to** have every pull request checked automatically

**so that** broken code does not reach `main`.

## Acceptance Criteria

- [ ] `.github/workflows/ci.yml` runs on every pull request and on every push to `main`.
- [ ] A job `ci` runs `npm ci`, `npm run check`, `npm run lint`, `npm run test:run` and `npm run build`.
- [ ] The check `ci` is green in the pull request of this issue.

## Tasks

- [ ] Create the workflow `.github/workflows/ci.yml` like in the CI/CD Concepts and GitHub Actions session.

<details>
<summary>Hint ✨</summary>

`npm ci` needs the `package-lock.json` of the repository. Use the scripts from issue 1: the workflow runs the same checks as you do locally.

</details>
