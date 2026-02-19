# AgentFloor

AI Agent Fleet Management — centralized monitoring hub for distributed Claude Code agents.

Visualize your organization's AI agent fleet as a **Gather.town-style spatial map**. Departments are rooms, agents are avatars, skills are equipment. Get a bird's-eye view of your entire AI operations from a single dashboard.

## How It Works

```
Developer A (project-a/)       Developer B (project-b/)       Developer C (project-c/)
        │                              │                              │
        │  /agentfloor-setup           │  /agentfloor-setup           │  /agentfloor-setup
        │                              │                              │
        └──────────────┬───────────────┴──────────────┬───────────────┘
                       │                              │
                       ▼                              ▼
                ┌─────────────────────────────────────────┐
                │         AgentFloor Hub (Next.js)         │
                │         Supabase (PostgreSQL)            │
                │                                         │
                │  Spatial Map · Graph · Tables · Charts   │
                └─────────────────────────────────────────┘
```

1. **Deploy the hub** — a Next.js app backed by Supabase
2. **Create an organization** — get a 6-digit invite code
3. **Install the plugin** in any project and run `/agentfloor-setup`
4. Each agent's **git repo, MCP servers, skills, vendor/model** are tracked and visualized

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/gmuffiness/agentfloor.git
cd agentfloor
pnpm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Link and push the schema:
   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-id>
   npx supabase db push
   ```
3. Create `.env` with your credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### 3. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

## Register an Agent

Install the AgentFloor plugin into any Claude Code project:

```bash
node /path/to/agentfloor/scripts/install-to-project.mjs /path/to/your-project
```

Then open Claude Code in that project and run:

```
/agentfloor-setup
```

The wizard will:
- Auto-detect your git repo, skills, and MCP servers
- Let you create or join an organization (via invite code)
- Register the agent to the hub

## Dashboard Pages

| Route | Description |
|---|---|
| `/` | Spatial map — departments as rooms, agents as avatars |
| `/graph` | Relationship graph — agents, skills, MCP tools as connected nodes |
| `/agents` | Agent data table with CRUD |
| `/departments` | Department data table with CRUD |
| `/cost` | Cost analytics with pie/bar/trend charts |
| `/skills` | Skill catalog with category filters |

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
| Deployment | Vercel |

## Project Structure

```
src/
  app/            # Pages & API routes
  components/     # UI components (spatial/, graph/, panels/, charts/)
  db/             # Supabase client (supabase.ts)
  stores/         # Zustand store
  types/          # TypeScript types
supabase/
  migrations/     # PostgreSQL schema migrations
skills/
  setup/          # /agentfloor-setup wizard definition
scripts/          # CLI tools (install, session hook)
.claude-plugin/   # Plugin manifest
```

## Development

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # ESLint
```

### Supabase CLI

```bash
npx supabase migration new <name>   # Create new migration
npx supabase db push                # Apply migrations to remote DB
npx supabase db diff                # Check schema differences
```

## Deploy

Deploy to Vercel and set these environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## License

MIT
