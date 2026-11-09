---
name: open-pr
description: Finalize a feature branch and open a pull request that closes the given issue. Verifies the branch, runs checks, commits in small steps, has the reviewer agent review the branch, pushes and runs gh pr create.
argument-hint: <issue-number>
disable-model-invocation: true
---

# Open a pull request

Issue number: `$ARGUMENTS`

If no issue number was given, ask for one and stop.

## 1. Pre-flight

1. Run `git branch --show-current`. If the branch is `main` (or `master`), **stop** and tell the user; never commit or push from main.
2. Run `git status` and `git diff` to see what is uncommitted. Run `gh issue view $ARGUMENTS` to get the title and acceptance criteria (AC).

## 2. Run checks

Read the **Commands** section of `CLAUDE.md` and run the checks it lists (tests, lint, type check, build, etc.). Do not guess script names. If anything fails, stop and report; do not open a PR with failing checks unless the user explicitly says so.

## 3. Commit in small steps

Group changes into small, logical commits (e.g. test + implementation for one behaviour, then docs). For each:

- Stage specific files (`git add <paths>`), never blindly `git add -A`; skip unrelated or sensitive files and mention them.
- Use a clear message in the imperative mood and the project's convention (e.g. `feat: add artwork filter (#$ARGUMENTS)`), explaining the why when not obvious.

## 4. Review the branch

Run this after the commits, because the reviewer only sees committed changes (`git diff main...HEAD`).

1. Launch the `reviewer` agent (Agent tool, `subagent_type: "reviewer"`). Tell it the issue number `$ARGUMENTS` and the plan file `docs/plans/$ARGUMENTS-<slug>.md` if one exists. The reviewer is read-only and reports; it never edits files.
2. Show the user its verdict, blocking issues, non-blocking suggestions and AC coverage.
3. If there are blocking issues, **stop**: do not push or open a PR. Fix them (test first, small commits) or ask the user, then run the checks from step 2 again and repeat this review.
4. Non-blocking suggestions: list them and let the user decide which to apply. Do not apply them on your own.
5. Continue to the push only when the verdict is "ready" or "ready with minor fixes" and the user agrees.

## 5. Push

`git push -u origin <current-branch>`

## 6. Open the PR

Run `gh pr create` with a title and a body containing:

- `Closes #$ARGUMENTS`
- **Summary**: what changed and why, in a few bullets.
- **Testing steps**: how a reviewer can verify it (commands from CLAUDE.md, manual steps in the UI).
- **AC checklist**: each acceptance criterion from the issue as a `- [x]` / `- [ ]` item, checked only if actually verified.

Show the user the drafted title and body and get confirmation before running `gh pr create`. Afterwards, print the PR URL.
