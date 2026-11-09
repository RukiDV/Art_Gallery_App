# Agent security baseline

Settings that this project has before I start working with a coding agent.

## Checklist
- [ ] `.env` and other secret files are in `.gitignore`
- [ ] `.claude/settings.json` has deny rules for secret files and for network commands
- [ ] I work in Manual mode or Plan mode (recommended) and check the mode at every start
- [ ] The sandbox is switched on (`/sandbox`). It needs macOS, Linux or WSL2
- [ ] I commit before every task, so `git diff` shows what the agent did
- [ ] I read every command and every diff before I approve
- [ ] I never paste a real secret or token into a prompt
- [ ] I read new MCP servers, skills, hooks and dependencies before I install them
- [ ] I manually code review every PR and understand the code Claude wrote