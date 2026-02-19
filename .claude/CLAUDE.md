<!-- OMC:START -->
<!-- OMC:END -->

# AgentFloor

AI Agent Fleet Management dashboard with spatial GUI visualization.

## Project Overview

A Next.js 16 app that visualizes organizational AI agent fleets as a Gather.town-style spatial map. Departments are rooms, agents are avatars, skills are equipment. Built for CTOs to get a bird's-eye view of their AI operations.

See [docs/architecture.md](../docs/architecture.md) for full tech stack and directory layout.

## Development

```bash
pnpm install
pnpm dev          # Start dev server (http://localhost:3000)
pnpm build        # Production build
pnpm lint         # ESLint
pnpm db:push      # Push Drizzle schema to SQLite
pnpm db:seed      # Seed database with sample data
```

## Key Conventions

### Code Style
- TypeScript strict mode, no `any`
- Tailwind CSS 4 for styling (no CSS modules)
- `cn()` utility from `src/lib/utils.ts` for conditional class names
- Vendor colors: use `getVendorColor()` / `getVendorBgColor()` from utils, never hardcode

### Architecture
- **Pages** go in `src/app/{route}/page.tsx` as `"use client"` components
- **API routes** go in `src/app/api/{resource}/route.ts`
- **Components** organized by domain: `spatial/`, `graph/`, `panels/`, `charts/`, `database/`, `ui/`
- **State** via Zustand store (`src/stores/app-store.ts`) — single store, no providers needed
- **Heavy client libs** (Pixi.js, React Flow) must use `dynamic()` import with `{ ssr: false }`

### Data Model
- Organization → Department[] → Agent[] → Skill[], Plugin[], McpTool[]
- Types defined in `src/types/index.ts`
- DB schema in `src/db/schema.ts` (Drizzle ORM + SQLite)
- Mock data in `src/data/mock-data.ts` for development

See [docs/data-model.md](../docs/data-model.md) for detailed entity reference.

### UI Layout
- TopBar (h-14, z-50, fixed top) → main content (pt-14 pb-10) → BottomBar (h-10, z-50, fixed bottom)
- Drawer panels: fixed right-side, `top-14`, `z-50`, 440px wide
- Selection state: `selectAgent(id)` / `selectDepartment(id)` in store triggers drawers

### API
See [docs/api-reference.md](../docs/api-reference.md) for endpoint reference.

## Pages

| Route | Description |
|---|---|
| `/` | Spatial map (Pixi.js canvas) — departments as rooms, agents as avatars |
| `/graph` | Relationship graph (React Flow) — nodes + edges showing agent/dept/skill connections |
| `/agents` | Agent data table with CRUD |
| `/departments` | Department data table with CRUD |
| `/cost` | Cost analytics with pie/bar/trend charts |
| `/skills` | Skill catalog with category filters |
