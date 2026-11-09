---
name: create-issue
description: Turn a feature idea into a well-formed GitHub issue (value proposition, acceptance criteria, tasks) and create it with gh after the user approves the draft.
argument-hint: <idea>
disable-model-invocation: true
---

# Create a GitHub issue from an idea

Idea: `$ARGUMENTS`

If no idea was given, ask for one and stop.

## 1. Draft

Skim the relevant code and `README.md` only as much as needed to make the issue accurate. Draft the issue:

- **Title**: short, imperative, specific.
- **Value proposition**: who benefits and why, in 1-3 sentences (e.g. "As a visitor, I want ... so that ...").
- **Acceptance criteria**: a checklist of observable, testable conditions (`- [ ] ...`). Each should be verifiable by a test or a clear manual check.
- **Tasks**: a checklist of concrete implementation steps (`- [ ] ...`).
- Optionally: **Out of scope** and **Notes** if they prevent ambiguity.

Keep it small enough for one pull request; suggest splitting if the idea is bigger.

## 2. Approve

Show the full draft to the user and ask for approval or changes. List any assumptions you made. Do not create anything yet. Iterate until approved.

## 3. Create

After explicit approval, write the body to a temporary file and run:

`gh issue create --title "<title>" --body-file <file>`

Add labels or assignees only if the user asked. Print the resulting issue URL and number, and mention that `/plan-feature <number>` is the next step.
