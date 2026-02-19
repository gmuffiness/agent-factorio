# API Reference

All endpoints are Next.js Route Handlers under `src/app/api/`. Data is stored in Supabase (PostgreSQL).

Protected endpoints require Supabase Auth (via `requireAuth()` or `requireOrgMember()`). CLI endpoints are auth-free.

## Organizations

### `GET /api/organizations`
List all organizations for the authenticated user.

**Response:** `Organization[]`

### `POST /api/organizations`
Create a new organization with auto-generated invite code.

**Body:**
```json
{
  "name": "My Org",
  "budget": 10000,
  "createdBy": "admin-name"
}
```

**Response:** `{ "id", "name", "inviteCode" }`

### `POST /api/organizations/join`
Join an organization using an invite code.

**Body:**
```json
{
  "inviteCode": "ABC123",
  "memberName": "developer-name"
}
```

**Response:** `{ "orgId", "orgName", "role" }`

## Organization Tree

### `GET /api/organizations/[orgId]`
Returns the full organization tree with nested departments, agents, skills, tools, plugins, and history.

**Response:** `Organization` (see data model)

### `POST /api/organizations/[orgId]/invite-code`
Generate a new invite code for the organization.

**Response:** `{ "inviteCode" }`

## Agents

### `GET /api/organizations/[orgId]/agents`
List all agents with department info. Supports query filters: `?dept=`, `?vendor=`, `?status=`.

### `POST /api/organizations/[orgId]/agents`
Create a new agent with optional skills, plugins, and MCP tools.

### `PATCH /api/organizations/[orgId]/agents/[id]`
Update an agent (name, status, vendor, model, monthlyCost, deptId, skillIds).

### `DELETE /api/organizations/[orgId]/agents/[id]`
Delete an agent. Cascades to skills, plugins, MCP tools.

### `POST /api/organizations/[orgId]/agents/[id]/push-request`
Webhook endpoint for CLI push updates to a specific agent.

## Departments

### `GET /api/organizations/[orgId]/departments`
List all departments with agent counts.

### `POST /api/organizations/[orgId]/departments`
Create a new department.

**Body:**
```json
{
  "name": "Engineering",
  "description": "...",
  "budget": 5000,
  "primaryVendor": "anthropic"
}
```

### `PATCH /api/organizations/[orgId]/departments/[id]`
Update a department (name, description, budget, primaryVendor).

### `DELETE /api/organizations/[orgId]/departments/[id]`
Delete a department. Fails if department has agents.

## Members

### `GET /api/organizations/[orgId]/members`
List all org members.

### `POST /api/organizations/[orgId]/members`
Invite a new member to the organization.

### `PATCH /api/organizations/[orgId]/members/[memberId]`
Update a member (role, name).

### `DELETE /api/organizations/[orgId]/members/[memberId]`
Remove a member from the organization.

## Announcements

### `GET /api/organizations/[orgId]/announcements`
List all announcements for the organization.

### `POST /api/organizations/[orgId]/announcements`
Create a new announcement.

**Body:**
```json
{
  "title": "Maintenance Notice",
  "content": "...",
  "targetType": "all",
  "priority": "normal",
  "expiresAt": "2026-03-01T00:00:00Z"
}
```

### `DELETE /api/organizations/[orgId]/announcements/[id]`
Delete an announcement.

## Chat & Conversations

### `POST /api/organizations/[orgId]/chat`
Send a chat message to an agent.

### `GET /api/organizations/[orgId]/conversations`
List all conversations for the organization.

### `POST /api/organizations/[orgId]/conversations/[convId]/messages`
Send a message in an existing conversation.

## Graph

### `GET /api/organizations/[orgId]/graph`
Returns pre-computed React Flow nodes and edges from live Supabase data.

**Response:**
```json
{
  "nodes": [
    {
      "id": "dept-{id}",
      "type": "department" | "agent" | "skill" | "mcp_tool" | "plugin",
      "position": { "x": number, "y": number },
      "data": { ... }
    }
  ],
  "edges": [
    {
      "id": "e-...",
      "source": "agent-{id}",
      "target": "dept-{id}" | "skill-{id}" | "mcp-{id}" | "plugin-{id}",
      "data": { "relationship": "belongs-to" | "has-skill" | "uses-tool" | "uses-plugin" }
    }
  ]
}
```

**Node types:**
- `department` — name, agentCount, budget, monthlySpend, vendor
- `agent` — name, vendor, model, status, monthlyCost, agentId
- `skill` — name, icon, category
- `mcp_tool` — name, icon, category, server
- `plugin` — name, icon, version

## Humans

### `GET /api/organizations/[orgId]/humans`
List all human users for the organization.

## Legacy

### `POST /api/register`
Legacy self-registration endpoint for agents. Prefer `POST /api/cli/push` for new integrations.

## CLI Endpoints

Auth-free endpoints for the `npx agentfloor` CLI. Bypasses Supabase Auth middleware.

### `POST /api/cli/login`
CLI login — create or join an organization via invite code.

**Body (join):**
```json
{
  "action": "join",
  "inviteCode": "ABC123",
  "memberName": "developer-name"
}
```

**Body (create):**
```json
{
  "action": "create",
  "orgName": "My Org",
  "memberName": "developer-name"
}
```

**Response:** `{ "orgId", "orgName", "inviteCode" }`

### `POST /api/cli/push`
CLI push — register or update an agent. If `agentId` is provided and exists, updates it; otherwise creates a new one.

**Body:**
```json
{
  "agentId": "agent-123 (optional)",
  "agentName": "my-agent",
  "vendor": "anthropic",
  "model": "claude-opus-4-6",
  "orgId": "org-123",
  "description": "...",
  "mcpTools": [{ "name": "github", "server": "github" }],
  "skills": [{ "name": "code-review", "category": "review" }],
  "context": [{ "type": "claude-md", "content": "...", "sourceFile": ".claude/CLAUDE.md" }]
}
```

**Response:** `{ "id", "updated", "message", "departmentId?" }`

### `POST /api/cli/announcements`
Fetch announcements for the CLI agent.

### `POST /api/cli/announcements/ack`
Acknowledge an announcement from the CLI.
