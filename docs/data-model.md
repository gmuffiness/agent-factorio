# Data Model

## Entity Hierarchy

```
Organization
  └── Department[]
        └── Agent[]
              ├── Skill[]        (many-to-many via agentSkills)
              ├── Plugin[]       (one-to-many)
              └── McpTool[]      (one-to-many)
```

## Types (`src/types/index.ts`)

### Enums

| Type | Values |
|---|---|
| `Vendor` | `"anthropic"` \| `"openai"` \| `"google"` |
| `AgentStatus` | `"active"` \| `"idle"` \| `"error"` |
| `SkillCategory` | `"generation"` \| `"review"` \| `"testing"` \| `"documentation"` \| `"debugging"` \| `"deployment"` |
| MCP `category` | `"filesystem"` \| `"database"` \| `"api"` \| `"browser"` \| `"communication"` \| `"devtools"` |

### Core Entities

- **Organization** — `id`, `name`, `totalBudget`, `departments[]`
- **Department** — `id`, `name`, `description`, `budget`, `monthlySpend`, `layout{x,y,width,height}`, `primaryVendor`, `agents[]`, `costHistory[]`
- **Agent** — `id`, `name`, `description`, `vendor`, `model`, `status`, `monthlyCost`, `tokensUsed`, `position{x,y}`, `skills[]`, `plugins[]`, `mcpTools[]`, `usageHistory[]`, `lastActive`, `createdAt`
- **Skill** — `id`, `name`, `category`, `icon`, `description`
- **Plugin** — `id`, `name`, `icon`, `description`, `version`, `enabled`
- **McpTool** — `id`, `name`, `server`, `icon`, `description`, `category`

### History

- **DailyUsage** — `date`, `tokens`, `cost`, `requests` (per agent, 7 days)
- **MonthlyCost** — `month`, `amount`, `byVendor: Record<Vendor, number>` (per department, 6 months)

## Database Schema (`src/db/schema.ts`)

SQLite tables via Drizzle ORM:

| Table | Notes |
|---|---|
| `organizations` | Root entity |
| `departments` | FK → organizations, includes layout columns (x, y, w, h) |
| `agents` | FK → departments, includes position columns (posX, posY) |
| `skills` | Standalone skill definitions |
| `agent_skills` | Many-to-many junction (agent_id, skill_id) |
| `plugins` | FK → agents (one-to-many) |
| `mcp_tools` | FK → agents (one-to-many) |
| `cost_history` | FK → departments, vendor cost columns (anthropic, openai, google) |
| `usage_history` | FK → agents, daily metrics |
