---
name: tdd-feature
description: Implement an approved plan file test-first (red, green, refactor), then run the project checks. Implements strictly the approved scope.
argument-hint: <plan-file-path>
disable-model-invocation: true
---

# Implement a plan test-first

Plan file: `$ARGUMENTS`

If no path was given, or the file does not exist, ask for it and stop.

## Setup

1. Read the plan file completely. Its scope is the only scope.
2. Read `CLAUDE.md`. Use its **Commands** section for every check/test command. Never guess or hardcode script names.
3. Confirm you are on the feature branch named in the plan (not `main`). If not, stop and tell the user.

## Loop: for each AC / unit of behaviour in the plan

1. **Red**: write one failing test that expresses the behaviour.
2. Run the relevant test command from the Commands section **once**. Confirm it fails, and that it fails for the *right reason* (missing behaviour, not a typo, import error or broken setup). Fix the test if the reason is wrong.
3. **Green**: write the minimal code that makes the test pass. No extra behaviour.
4. Run the tests again to confirm they pass.
5. **Refactor**: clean up names, duplication and structure in the code and tests you just touched, keeping tests green.

Work in small steps; do not batch many behaviours into one cycle.

## Finish

Run the checks listed in the Commands section of `CLAUDE.md` (e.g. tests, lint, type check, build, whichever it lists) and fix failures caused by your changes. Report the results honestly, including anything failing or skipped.

## Scope rules

- Implement strictly what the plan approves. Do not add features, refactor unrelated code, or touch files outside the plan's "Files to change" without a reason.
- Anything in the plan's "Out of scope" stays out.
- If you find the plan is wrong or incomplete, stop and ask the user instead of expanding scope.
- Do not commit, push, or open a PR; that is for `/open-pr`.

End with a short summary: AC covered by tests, files changed, check results, and any deviations or open concerns.
