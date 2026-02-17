# Architecture

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| State | Zustand 5 |
| DB | SQLite via better-sqlite3 |
| ORM | Drizzle ORM |
| Spatial Canvas | Pixi.js 8 + pixi-viewport |
| Graph View | React Flow (@xyflow/react 12) |
| Charts | Recharts 3 |
| Package Manager | pnpm |

## Directory Structure

```
src/
  app/                    # Next.js App Router pages & API routes
    api/
      organization/       # GET full org tree
      agents/             # CRUD agents
      departments/        # CRUD departments
      graph/              # GET pre-computed graph nodes/edges
      register/           # Agent self-registration
    graph/                # /graph page (React Flow)
    agents/               # /agents page (data table)
    departments/          # /departments page (data table)
    cost/                 # /cost page (charts)
    skills/               # /skills page (catalog)
  components/
    ui/                   # AppShell, TopBar, BottomBar, Badge
    spatial/              # Pixi.js canvas (SpatialCanvas, DepartmentRoom, AgentAvatar)
    graph/                # React Flow graph (GraphPage, DepartmentNode, AgentNode, EntityNode)
    panels/               # Right-side drawers (AgentDrawer, DepartmentDrawer)
    charts/               # Recharts wrappers (CostPieChart, CostTrendChart, UsageBarChart)
    database/             # DataTable, forms
  stores/
    app-store.ts          # Zustand store (selection, view mode, org data)
  types/
    index.ts              # Shared TypeScript types
  lib/
    utils.ts              # Formatting, vendor/status colors, cn()
  data/
    mock-data.ts          # Mock organization data for development
  db/
    schema.ts             # Drizzle SQLite schema
    index.ts              # DB connection
    seed.ts               # Database seeder
  cli/
    agent-hub-setup.ts    # CLI tool for agent registration
```

## Data Flow

1. **Mock data** (`src/data/mock-data.ts`) provides a full `Organization` tree during development
2. **API routes** serve data from SQLite (with mock fallback)
3. **Zustand store** (`app-store.ts`) holds the client-side `Organization` state
4. Pages read from the store; actions (`selectAgent`, `selectDepartment`) trigger drawer panels

## Key Patterns

- **Dynamic imports with `ssr: false`**: Pixi.js and React Flow components are client-only
- **Vendor color system**: Consistent color coding via `getVendorColor()` / `getVendorBgColor()` (orange=Anthropic, green=OpenAI, blue=Google)
- **Drawer panels**: Fixed right-side panels at `z-50`, positioned below TopBar (`top-14`)
- **Shared nodes in graph**: Skills/MCP tools/plugins used by multiple agents appear as a single node with converging edges
