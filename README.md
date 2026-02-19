# AgentFloor

AI Agent Fleet Management — centralized monitoring hub for distributed AI agents.

Visualize your organization's AI agent fleet as a **Gather.town-style spatial map**. Departments are rooms, agents are avatars, skills are equipment. Get a bird's-eye view of your entire AI operations from a single dashboard.

---

## For AI Agents: Setup Guide

> **This section is written for LLM agents (Claude Code, Codex, etc.) that are asked to "set up AgentFloor" or "register an agent."**
> Read this section first to determine what the user needs, then follow the appropriate path.

### Step 0: Determine what the user wants

Ask the user **one** question before proceeding:

> "AgentFloor를 어떻게 사용하시겠습니까?"
> 1. **기존 조직에 에이전트 등록** — 이미 누군가 AgentFloor 허브를 배포해둔 상태. 이 프로젝트(현재 repo)의 에이전트를 기존 조직에 추가하고 싶다.
> 2. **허브를 직접 배포 (Self-host)** — AgentFloor 허브 자체를 처음부터 세팅하고 싶다.

User's answer determines which path to follow below.

---

### Path A: Register agent to an existing organization

**Prerequisites — ask the user for these:**
1. **Hub URL** — AgentFloor 허브 주소 (예: `https://agentfloor.vercel.app` 또는 `http://localhost:3000`)
2. **Invite code** — 6자리 초대 코드 (예: `C2M2XF`). 조직 관리자에게 받아야 합니다.
3. **Agent name** — 에이전트 이름 (기본값: 현재 디렉토리 이름)
4. **Vendor & Model** — AI 벤더 및 모델 (기본값: `anthropic`, `claude-sonnet-4-6`)

**Execution — run these API calls directly (no interactive CLI needed):**

```bash
# 1. Join organization via invite code
curl -X POST {HUB_URL}/api/cli/login \
  -H "Content-Type: application/json" \
  -d '{"action":"join","inviteCode":"{INVITE_CODE}","memberName":"{AGENT_NAME}"}'
# Response: {"orgId":"org-xxx","orgName":"...","inviteCode":"..."}

# 2. Register agent (auto-detects if department exists, creates "Engineering" if not)
curl -X POST {HUB_URL}/api/cli/push \
  -H "Content-Type: application/json" \
  -d '{
    "agentName": "{AGENT_NAME}",
    "vendor": "{VENDOR}",
    "model": "{MODEL}",
    "orgId": "{ORG_ID from step 1}",
    "mcpTools": [{"name":"server-name","server":"server-name"}],
    "context": [{"type":"claude-md","content":"...CLAUDE.md content...","sourceFile":".claude/CLAUDE.md"}]
  }'
# Response: {"id":"agent-xxx","departmentId":"dept-xxx","updated":false,"message":"..."}
```

**Auto-detection — gather this info from the current project before calling the API:**
- Git repo URL: `git remote get-url origin`
- MCP servers: parse `.claude/settings.local.json` or `.claude/settings.json` → `mcpServers` keys
- CLAUDE.md: read `.claude/CLAUDE.md` or root `CLAUDE.md`
- Skills: list `.claude/commands/*.md` and `.claude/skills/**/*.md` file names

**After registration — save the config:**
```bash
# Save to .agentfloor/config.json (gitignore this file)
mkdir -p .agentfloor
cat > .agentfloor/config.json << EOF
{
  "hubUrl": "{HUB_URL}",
  "orgId": "{ORG_ID}",
  "agentId": "{AGENT_ID from step 2}",
  "agentName": "{AGENT_NAME}",
  "vendor": "{VENDOR}",
  "model": "{MODEL}",
  "pushedAt": "{ISO timestamp}"
}
EOF
```

**To update an existing agent (re-push):**
```bash
# Include agentId in the request body — the API will update instead of creating
curl -X POST {HUB_URL}/api/cli/push \
  -H "Content-Type: application/json" \
  -d '{"agentId":"{EXISTING_AGENT_ID}","agentName":"...","vendor":"...","model":"...","orgId":"..."}'
```

---

### Path B: Self-host the AgentFloor hub

**Prerequisites — ask the user for these:**
1. **Supabase project** — [supabase.com](https://supabase.com)에서 프로젝트를 생성했는지, 또는 생성을 도와줄지
2. **Supabase credentials** — `NEXT_PUBLIC_SUPABASE_URL` 과 `SUPABASE_SERVICE_ROLE_KEY`

**Execution:**

```bash
# 1. Clone & install
git clone https://github.com/gmuffiness/agentfloor.git
cd agentfloor
pnpm install

# 2. Set up Supabase (user must provide credentials)
npx supabase login
npx supabase link --project-ref <project-id>
npx supabase db push

# 3. Create .env
cat > .env << EOF
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
EOF

# 4. Run
pnpm dev
```

**After hub is running:**
- 대시보드: `http://localhost:3000`
- 첫 조직 생성: `POST /api/cli/login` with `{"action":"create","orgName":"My Org","memberName":"Admin"}`
- 응답에 포함된 `inviteCode`를 팀원에게 공유

**Production deployment:**
- Vercel에 배포하고 환경 변수 설정: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

---

### API Reference (for programmatic access)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/cli/login` | POST | None | 조직 생성 (`action:"create"`) 또는 참여 (`action:"join"`) |
| `/api/cli/push` | POST | None | 에이전트 등록 (신규) 또는 업데이트 (`agentId` 포함 시) |
| `/api/register` | POST | None | 에이전트 등록 (레거시, skills/plugins 지원) |

Full API docs: [docs/api-reference.md](docs/api-reference.md)
CLI manual: [docs/cli.md](docs/cli.md)

---

## For Humans: Quick Start

### Register an agent (CLI)

```bash
npx agentfloor login     # Hub 연결 + 조직 참여
npx agentfloor push      # 에이전트 등록 (자동 감지)
npx agentfloor status    # 등록 상태 확인
npx agentfloor whoami    # 로그인 정보 확인
npx agentfloor logout    # 로그아웃
```

### Deploy the hub

```bash
git clone https://github.com/gmuffiness/agentfloor.git
cd agentfloor
pnpm install
# Set up Supabase (see Path B above)
pnpm dev
```

---

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
cli/              # Standalone CLI (npx agentfloor)
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

## License

MIT
