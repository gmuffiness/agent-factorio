# agent-factorio

CLI for [AgentFactorio](https://github.com/gmuffiness/agent-factorio) — All your team's agents, one place.

Register and manage your AI agents (Claude Code, Cursor, Codex, etc.) from any project.

## Install

```bash
npm install -g agent-factorio
```

Or use directly with `npx`:

```bash
npx agent-factorio <command>
```

## Commands

### `agent-factorio login`

Connect to an AgentFactorio hub and join an organization.

```bash
npx agent-factorio login
```

Prompts for hub URL and email, then lets you create or join an organization via invite code.

### `agent-factorio push`

Detect and push agent configuration to the hub.

```bash
npx agent-factorio push
```

Auto-detects git repo, CLAUDE.md, MCP servers, skills, and plugins from the current project directory.

### `agent-factorio status`

Show registration status for the current project.

```bash
npx agent-factorio status
```

### `agent-factorio whoami`

Show login info (hub URL, organizations).

```bash
npx agent-factorio whoami
```

### `agent-factorio logout`

Remove global config and log out.

```bash
npx agent-factorio logout
```

## Configuration

- Global config: `~/.agent-factorio/config.json` (hub URL, member ID, organizations)
- Project config: `.agent-factorio/config.json` (agent ID, hub URL — gitignored)

## Requirements

- Node.js >= 18
