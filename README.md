# AgentFactorio

[English](README.md) | [한국어](docs/README.ko.md)

**All your team's agents, one place.** See who runs which agents, what skills and MCP tools they use, and how much it costs — across every team.

Every developer now runs multiple AI agents — Claude Code, Cursor, Codex — but as teams grow, nobody has the full picture. Who owns which agent? What skills and MCP tools does each department use? How much is it all costing? This information is scattered across local machines, git repos, and vendor consoles.

AgentFactorio fixes this. Run `npx agent-factorio push` and your agent's config — git repo, MCP servers, skills, vendor & model — is auto-detected and registered to a central hub. Just as a company needs a staff directory when headcount grows, your organization needs an **agent directory** when agents grow.

What makes it different: a **Gather.town-style 2D Spatial Map** that turns departments into rooms, agents into avatars, and skills into equipment — so you can see your entire AI fleet at a glance instead of staring at tables and charts.

---

## Quick Start

### Option A: Tell your AI agent (Recommended)

Tell your AI agent (Claude Code, Cursor, etc.) this prompt:

```
Read https://agent-factorio.vercel.app/setup.md and follow the instructions to join AgentFactorio
```

The agent will install the CLI, authenticate, and register itself automatically.

### Option B: One-liner

```bash
curl -fsSL https://agent-factorio.vercel.app/install.sh | bash
```

Works on macOS & Linux. Installs Node.js (if needed) and the agent-factorio CLI, then starts login.

### Option C: npm

```bash
npm i -g agent-factorio
agent-factorio login          # Email verification + create/join org
agent-factorio push           # Register current project's agent to the hub
```

`login` connects to the hub (default: `https://agent-factorio.vercel.app`), verifies your email, then lets you create a new org or join one with an invite code. `push` auto-detects your Git repo, MCP servers, skills, and CLAUDE.md.

### View the dashboard

After registration, manage agents visually:
- Spatial map (Pixi.js) — departments = rooms, agents = avatars
- Relationship graph (React Flow) — agent-skill-MCP connections
- Agent table — CRUD + status monitoring
- Cost analytics — per-department/agent usage charts

### Manage orgs & agents (CLI)

```bash
# Organization management
agent-factorio org list       # List your organizations
agent-factorio org create     # Create a new organization
agent-factorio org join       # Join via invite code
agent-factorio org switch     # Change default organization
agent-factorio org info       # Current org details

# Agent management
agent-factorio agent list     # List agents in current org
agent-factorio agent info     # Agent details
agent-factorio agent edit     # Edit agent properties
agent-factorio agent pull     # Sync from hub to local
agent-factorio agent delete   # Delete an agent

# Other
agent-factorio status         # Current project registration status
agent-factorio whoami         # Login info
agent-factorio logout         # Log out
```

Full CLI manual: [docs/cli.md](docs/cli.md)

---

## For AI Agents: Programmatic Setup

> **Guide for LLM agents (Claude Code, Codex, etc.) to register via API.**
> For humans using the CLI, follow the Quick Start above.

### Register an agent to an existing organization

**Required:** Hub URL, Invite code (6 chars), Agent name, Vendor & Model

```bash
# 1. Join organization
curl -X POST {HUB_URL}/api/cli/login \
  -H "Content-Type: application/json" \
  -d '{"action":"join","inviteCode":"{INVITE_CODE}","memberName":"{AGENT_NAME}","email":"{EMAIL}","userId":"{USER_ID}"}'

# 2. Register agent
curl -X POST {HUB_URL}/api/cli/push \
  -H "Content-Type: application/json" \
  -d '{
    "agentName": "{AGENT_NAME}",
    "vendor": "{VENDOR}",
    "model": "{MODEL}",
    "orgId": "{ORG_ID from step 1}",
    "memberId": "{MEMBER_ID from step 1}",
    "mcpTools": [{"name":"server-name","server":"server-name"}],
    "context": [{"type":"claude-md","content":"...","sourceFile":".claude/CLAUDE.md"}]
  }'

# 3. Save config (.agent-factorio/config.json)
mkdir -p .agent-factorio
echo '{"hubUrl":"{HUB_URL}","orgId":"{ORG_ID}","agentId":"{AGENT_ID}","agentName":"{AGENT_NAME}","vendor":"{VENDOR}","model":"{MODEL}","pushedAt":"{ISO_TIMESTAMP}"}' > .agent-factorio/config.json
```

**Auto-detected from project:**
- Git repo URL: `git remote get-url origin`
- MCP servers: `.claude/settings.local.json` → `mcpServers` keys
- CLAUDE.md: `.claude/CLAUDE.md` or root `CLAUDE.md`
- Skills: `.claude/commands/*.md`, `.claude/skills/**/*.md`

**Update:** Include `agentId` in the request body to update an existing agent.

API reference: [docs/api-reference.md](docs/api-reference.md)

---

## Self-host

See [docs/publishing.md](docs/publishing.md) for the full deployment guide.

```bash
git clone https://github.com/gmuffiness/agent-factorio.git
cd agent-factorio
pnpm install

# Supabase setup
npx supabase login
npx supabase link --project-ref <project-id>
npx supabase db push

# Create .env
echo "NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co" > .env
echo "SUPABASE_SERVICE_ROLE_KEY=your-service-role-key" >> .env

pnpm dev   # http://localhost:3000
```

Production: Deploy to Vercel and set environment variables.

---

## Dashboard Pages

| Route | Description |
|---|---|
| `/org/[orgId]/overview` | Overview — top skills, MCP tools, featured agents, org stats |
| `/org/[orgId]` | Spatial map — departments as rooms, agents as avatars |
| `/org/[orgId]/graph` | Relationship graph — agents, skills, MCP tools as connected nodes |
| `/org/[orgId]/org-chart` | Organization hierarchy chart |
| `/org/[orgId]/agents` | Agent data table with CRUD |
| `/org/[orgId]/departments` | Department data table with CRUD |
| `/org/[orgId]/cost` | Cost analytics with pie/bar/trend charts |
| `/org/[orgId]/skills` | Skill catalog with category filters |
| `/org/[orgId]/chat` | Chat interface with agent conversations |
| `/org/[orgId]/settings` | Organization settings & invite code |

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| State | Zustand 5 |
| DB | Supabase (PostgreSQL) |
| Spatial Canvas | Pixi.js 8 |
| Graph View | React Flow 12 |
| Charts | Recharts 3 |
| CLI | Commander.js |
| Deployment | Vercel |

## Documentation

| Doc | Description |
|---|---|
| [docs/cli.md](docs/cli.md) | Full CLI manual |
| [docs/api-reference.md](docs/api-reference.md) | API endpoint reference |
| [docs/architecture.md](docs/architecture.md) | Architecture & directory layout |
| [docs/data-model.md](docs/data-model.md) | Data model reference |
| [docs/vision.md](docs/vision.md) | Service positioning & vision |
| [docs/publishing.md](docs/publishing.md) | npm/Vercel deployment guide |

## License

MIT
