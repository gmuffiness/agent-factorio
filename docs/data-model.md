# Data Model

## Entity Hierarchy

```
Organization (invite code for team access)
  ├── OrgMember[]         (admin/member roles, email-based identification)
  ├── Announcement[]      (org-wide notifications)
  ├── Human[]             (human users linked to agents)
  ├── Conversation[]      (chat conversations with agents)
  └── Department[]        (supports parent hierarchy)
        └── Agent[]
              ├── Skill[]        (many-to-many via agent_skills)
              ├── Plugin[]       (one-to-many)
              ├── McpTool[]      (one-to-many)
              ├── AgentResource[] (git repos, databases, storage)
              └── AgentContext[]  (CLAUDE.md, README, custom docs)
```

## Types (`src/types/index.ts`)

### Enums

| Type | Values |
|---|---|
| `Vendor` | `"anthropic"` \| `"openai"` \| `"google"` |
| `AgentStatus` | `"active"` \| `"idle"` \| `"error"` |
| `SkillCategory` | `"generation"` \| `"review"` \| `"testing"` \| `"documentation"` \| `"debugging"` \| `"deployment"` |
| `ResourceType` | `"git_repo"` \| `"database"` \| `"storage"` |
| `AccessLevel` | `"read"` \| `"write"` \| `"admin"` |
| MCP `category` | `"filesystem"` \| `"database"` \| `"api"` \| `"browser"` \| `"communication"` \| `"devtools"` |
| `OrgMemberRole` | `"admin"` \| `"member"` |
| `OrgMemberStatus` | `"active"` \| `"pending"` |
| `AnnouncementTargetType` | `"all"` \| `"department"` \| `"agent"` |
| `AnnouncementPriority` | `"normal"` \| `"urgent"` |

### Core Entities

- **Organization** — `id`, `name`, `totalBudget`, `inviteCode`, `createdBy`, `departments[]`
- **OrgMember** — `id`, `orgId`, `name`, `email`, `role`, `status`, `joinedAt`
- **Department** — `id`, `name`, `description`, `parentId`, `budget`, `monthlySpend`, `layout{x,y,width,height}`, `primaryVendor`, `agents[]`, `costHistory[]`
- **Agent** — `id`, `name`, `description`, `vendor`, `model`, `status`, `monthlyCost`, `tokensUsed`, `position{x,y}`, `skills[]`, `plugins[]`, `mcpTools[]`, `resources[]`, `usageHistory[]`, `lastActive`, `createdAt`, `humanId`, `human?`, `registeredBy`, `registeredByMember?`, `context?`
- **Skill** — `id`, `name`, `category`, `icon`, `description`
- **Plugin** — `id`, `name`, `icon`, `description`, `version`, `enabled`
- **McpTool** — `id`, `name`, `server`, `icon`, `description`, `category`
- **AgentResource** — `id`, `type`, `name`, `icon`, `description`, `url`, `accessLevel`, `createdAt`
- **AgentContext** — `id`, `agentId`, `type` (`claude_md`/`readme`/`custom`), `content`, `sourceFile`, `updatedAt`
- **Human** — `id`, `orgId`, `name`, `email`, `role`, `avatarUrl`, `createdAt`

### Chat

- **Conversation** — `id`, `orgId`, `agentId`, `title`, `createdAt`, `updatedAt`, `lastMessage?`
- **Message** — `id`, `conversationId`, `role` (`user`/`assistant`/`system`), `content`, `createdAt`

### Announcements

- **Announcement** — `id`, `orgId`, `title`, `content`, `targetType`, `targetId`, `priority`, `createdBy`, `createdAt`, `expiresAt`, `ackCount?`, `targetCount?`

### History

- **DailyUsage** — `date`, `tokens`, `cost`, `requests` (per agent, 7 days)
- **MonthlyCost** — `month`, `amount`, `byVendor: Record<Vendor, number>` (per department, 6 months)

## Database Schema (Supabase PostgreSQL)

Schema defined across 9 migrations in `supabase/migrations/`.

| Table | Notes |
|---|---|
| `organizations` | Root entity, `invite_code` (unique 6-char), `created_by` |
| `org_members` | FK → organizations, `role` (admin/member), `status` (active/pending), `email`, `user_id` |
| `departments` | FK → organizations, layout columns (x, y, w, h), `parent_id` for hierarchy |
| `agents` | FK → departments, position columns (pos_x, pos_y), `registered_by` (FK → org_members), `human_id` |
| `skills` | Standalone skill definitions |
| `agent_skills` | Many-to-many junction (agent_id, skill_id) |
| `plugins` | FK → agents (one-to-many) |
| `mcp_tools` | FK → agents (one-to-many) |
| `agent_resources` | FK → agents, type/url/access_level |
| `agent_contexts` | FK → agents, type/content/source_file |
| `cost_history` | FK → departments, vendor cost columns (anthropic, openai, google) |
| `usage_history` | FK → agents, daily metrics |
| `humans` | FK → organizations, human users linked to agents |
| `conversations` | FK → organizations + agents, chat conversations |
| `messages` | FK → conversations, chat messages |
| `announcements` | FK → organizations, org-wide notifications with target/priority |

All tables have RLS enabled. Server-side access uses the Supabase service role key which bypasses RLS.

## Organization & Agent Registration Flow

1. **Create Organization**: `POST /api/organizations` → generates 6-char invite code
2. **Join Organization**: `POST /api/organizations/join` → use invite code to join
3. **Register Agent**: `POST /api/cli/push` → links agent to org + department, records vendor/model/MCP tools/skills
4. **Session Heartbeat**: On each session start, agent status is set to `active`
