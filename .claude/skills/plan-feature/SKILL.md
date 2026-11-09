---
name: plan-feature
description: Plan a feature from a GitHub issue. Reads the issue, explores the code in Plan mode, presents a plan for approval, then creates the feature branch and commits the plan file. Writes no application code.
argument-hint: <issue-number>
disable-model-invocation: true
---

# Plan a feature from an issue

Issue number: `$ARGUMENTS`

If no issue number was given, ask for one and stop.

## 1. Read the issue

Run `gh issue view $ARGUMENTS` (add `--comments` if useful). Extract the title, value proposition, acceptance criteria (AC) and tasks.

## 2. Explore (Plan mode)

Work in Plan mode (use EnterPlanMode if not already in it). Read only. Explore the code relevant to the issue: existing components, data flow, tests, conventions. Read `CLAUDE.md` for project conventions. Do NOT write or edit any application code during this skill.

## 3. Present the plan

Present a plan with these sections:

- **Summary**: what will be built and why, in 2-3 sentences.
- **AC coverage**: a table mapping each acceptance criterion to the change and the test that will cover it. Every AC must appear.
- **Files to change**: files to create or modify, each with a one-line reason.
- **Out of scope**: things deliberately not done (related ideas, refactors, follow-ups).
- **Open questions**: anything ambiguous in the issue that needs the user's decision. Ask them; do not guess silently.

Then wait for the user's approval. If they request changes, revise the plan and present it again.

## 4. After approval only

1. Derive a short kebab-case `<slug>` from the issue title.
2. Make sure the working tree is clean enough to branch (check `git status`; tell the user about unrelated changes rather than committing them).
3. Create the branch from main: `git switch -c feature/$ARGUMENTS-<slug>`.
4. Save the approved plan as `docs/plans/$ARGUMENTS-<slug>.md` (create `docs/plans/` if missing). Include the issue link/number, summary, AC coverage, files to change, out-of-scope and resolved open questions.
5. Commit only that file with a clear message, e.g. `docs: add plan for #$ARGUMENTS <title>`.
6. Tell the user the branch name and plan path, and that `/tdd-feature docs/plans/$ARGUMENTS-<slug>.md` is the next step.

Do not push, open a PR, or implement anything.
