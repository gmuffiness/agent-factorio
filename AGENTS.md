# AGENTS.md — Agent Instructions for AgentFloor

This file provides context for AI coding agents working on this codebase.

## Quick Start

```bash
pnpm install && pnpm dev
```

Open http://localhost:3000. The app uses mock data by default — no database setup needed for development.

## What This Project Is

AgentFloor is an AI agent fleet management dashboard. It shows an organization's AI agents (Claude, GPT, Gemini) across departments in a spatial visualization (like Gather.town) and graph view, with cost analytics and skill tracking.

## Architecture Summary

- **Framework:** Next.js 16 App Router with Turbopack
- **State:** Zustand store at `src/stores/app-store.ts`
- **DB:** SQLite + Drizzle ORM (mock data fallback)
- **Styling:** Tailwind CSS 4
- **Visualizations:** Pixi.js (spatial map), React Flow (graph), Recharts (charts)

For detailed architecture, see [docs/architecture.md](docs/architecture.md).

## Key Files to Know

| File | Purpose |
|---|---|
| `src/types/index.ts` | All TypeScript types (Agent, Department, Skill, etc.) |
| `src/stores/app-store.ts` | Zustand store — state + actions + computed helpers |
| `src/lib/utils.ts` | Formatting, vendor/status color helpers, `cn()` |
| `src/data/mock-data.ts` | Mock data used during development |
| `src/db/schema.ts` | Drizzle ORM schema (SQLite) |
| `src/components/ui/AppShell.tsx` | Root layout: TopBar + main + BottomBar + Drawers |
| `src/components/ui/TopBar.tsx` | Navigation bar with route links |

## Common Tasks

### Adding a new page
1. Create `src/app/{route}/page.tsx` with `"use client"` directive
2. Add nav link to `navLinks` array in `src/components/ui/TopBar.tsx`
3. If using heavy client libs, wrap with `dynamic(() => import(...), { ssr: false })`

### Adding a new API route
1. Create `src/app/api/{resource}/route.ts`
2. Export async functions: `GET`, `POST`, `PATCH`, `DELETE`
3. Use `NextResponse.json()` for responses

### Adding a new component
1. Place in the appropriate `src/components/{domain}/` directory
2. Use vendor colors from `getVendorColor()` — never hardcode hex values
3. Use `cn()` for conditional Tailwind classes

### Working with state
```typescript
// Read state
const organization = useAppStore((s) => s.organization);

// Trigger actions
const selectAgent = useAppStore((s) => s.selectAgent);
selectAgent("agent-id"); // Opens AgentDrawer

const selectDepartment = useAppStore((s) => s.selectDepartment);
selectDepartment("dept-id"); // Opens DepartmentDrawer
```

### Working with the database
```bash
pnpm db:push    # Apply schema changes
pnpm db:seed    # Seed with sample data
```

## Data Model

See [docs/data-model.md](docs/data-model.md) for full entity reference.

Core hierarchy: `Organization → Department[] → Agent[] → (Skill[], Plugin[], McpTool[])`

Three vendor types: `anthropic` (orange), `openai` (green), `google` (blue).

## Gotchas

- **SSR:** Pixi.js and React Flow crash on server — always use `dynamic()` with `ssr: false`
- **Z-index:** TopBar is `z-50` fixed. Drawers are also `z-50` but start at `top-14` (below TopBar)
- **Drawer panels:** Opening a drawer clears the other selection (`selectAgent` clears `selectedDepartmentId` and vice versa)
- **Mock data:** The store initializes with `mockOrganization` from `src/data/mock-data.ts`. API calls overlay this on success, fall back silently on failure
