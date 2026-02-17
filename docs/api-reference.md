# API Reference

All endpoints are Next.js Route Handlers under `src/app/api/`.

## Organization

### `GET /api/organization`
Returns the full organization tree with nested departments, agents, skills, tools, plugins, and history.

**Response:** `Organization` (see data model)

## Departments

### `GET /api/departments`
List all departments.

### `POST /api/departments`
Create a new department.

### `PATCH /api/departments/[id]`
Update a department.

### `DELETE /api/departments/[id]`
Delete a department.

## Agents

### `GET /api/agents`
List all agents with department info.

### `POST /api/agents`
Create a new agent.

### `PATCH /api/agents/[id]`
Update an agent (status, name, etc.).

### `DELETE /api/agents/[id]`
Delete an agent.

## Graph

### `GET /api/graph`
Returns pre-computed React Flow nodes and edges.

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

## Agent Registration

### `POST /api/register`
Self-registration endpoint for agents to join the fleet.
