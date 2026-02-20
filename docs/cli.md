# AgentFactorio CLI

`npx agent-factorio` — 어떤 프로젝트에서든 에이전트를 허브에 등록하고 관리하는 CLI 도구.

## Quick Start

```bash
# 1. 허브에 로그인 (조직 생성 또는 참여)
npx agent-factorio login

# 2. 현재 프로젝트의 에이전트를 허브에 등록
npx agent-factorio push
```

이후 대시보드에서 등록된 에이전트를 확인할 수 있습니다.

---

## Commands

### `agent-factorio login`

허브에 연결하고 조직에 참여하거나 새 조직을 생성합니다.

```
$ npx agent-factorio login
? AgentFactorio Hub URL [http://localhost:3000]: https://agent-factorio.vercel.app
✓ Hub connected.

? Create or join an organization?
  1. Join existing (invite code)
  2. Create new
Choice: 1

? Invite code: C2M2XF
? Your name (displayed in the org) [CLI User]: Alice

✓ Joined "Acme Corp" (org-12345)

Logged in! Run `agent-factorio push` in any project to register an agent.
```

**동작:**
1. Hub URL 입력 (기본값: `http://localhost:3000` 또는 이전 설정값)
2. 허브 연결 확인
3. 조직 생성 또는 초대 코드로 참여
4. 글로벌 config 저장 (`~/.agent-factorio/config.json`)

**조직 생성 시:**
- 조직 이름 입력
- 6자리 초대 코드 자동 생성 → 팀원에게 공유

**여러 조직:**
- `login`을 여러 번 실행하면 `organizations` 배열에 추가
- 첫 번째 조직이 기본 조직으로 사용됨

---

### `agent-factorio push`

현재 프로젝트의 에이전트 설정을 자동 감지하여 허브에 등록합니다.

```
$ npx agent-factorio push

Detecting agent configuration...
  Git repo:     git@github.com:user/my-project.git
  Skills:       code-review, testing (2)
  MCP servers:  github, slack (2)
  CLAUDE.md:    found (.claude/CLAUDE.md)

? Agent name [my-project]: my-project
? Vendor
  1. anthropic
  2. openai
  3. google
Choice: 1
? Model
  1. claude-opus-4-6
  2. claude-sonnet-4-6
  3. claude-haiku-4-5-20251001
Choice: 1

ℹ Pushing to "Acme Corp" at https://agent-factorio.vercel.app...
✓ Agent registered! (agent-17345678)

Dashboard: https://agent-factorio.vercel.app
```

**자동 감지 항목:**

| 항목 | 소스 |
|------|------|
| Git repo URL | `git remote get-url origin` |
| Skills | `.claude/commands/*.md`, `.claude/skills/**/*.md`, `skills/**/*.md` |
| MCP servers | `.claude/settings.local.json`, `.claude/settings.json`의 `mcpServers` |
| CLAUDE.md | `.claude/CLAUDE.md` 또는 루트 `CLAUDE.md` |

**동작:**
1. 글로벌 config 확인 (없으면 `login` 안내)
2. 프로젝트 자동 감지
3. 에이전트 이름, vendor, model 입력
4. 허브에 등록 (`POST /api/cli/push`)
5. 프로젝트 config 저장 (`.agent-factorio/config.json`)

**업데이트:**
- 이미 등록된 에이전트가 있으면 (`.agent-factorio/config.json`에 `agentId` 존재) 자동으로 업데이트
- MCP tools, context(CLAUDE.md) 모두 갱신
- 중복 에이전트 생성 없음

---

### `agent-factorio status`

현재 프로젝트의 등록 상태를 확인합니다.

```
$ npx agent-factorio status

Agent Status
  Agent ID:      agent-17345678
  Agent name:    my-project
  Vendor:        anthropic
  Model:         claude-opus-4-6
  Organization:  Acme Corp
  Hub URL:       https://agent-factorio.vercel.app
  Last pushed:   2026-02-19T11:51:00.000Z

✓ Agent is registered.
```

등록되지 않은 프로젝트에서 실행하면:
```
! No agent registered in this project.
Run `agent-factorio push` to register.
```

---

### `agent-factorio whoami`

로그인 정보를 확인합니다 (허브 URL, 조직 목록).

```
$ npx agent-factorio whoami

Login Info

  Organization:  Acme Corp (default)
  Org ID:        org-12345
  Hub URL:       https://agent-factorio.vercel.app
  Invite code:   C2M2XF
  Member name:   Alice
```

---

### `agent-factorio logout`

글로벌 config를 삭제합니다.

```
$ npx agent-factorio logout
✓ Logged out. Global config removed.
```

---

## Config Files

### 글로벌 config: `~/.agent-factorio/config.json`

`login` 명령어로 생성. 모든 프로젝트에서 공유.

```json
{
  "organizations": [
    {
      "hubUrl": "https://agent-factorio.vercel.app",
      "orgId": "org-12345",
      "orgName": "Acme Corp",
      "inviteCode": "C2M2XF",
      "memberName": "Alice"
    }
  ],
  "defaultOrg": "org-12345"
}
```

### 프로젝트 config: `.agent-factorio/config.json`

`push` 명령어로 생성. 해당 프로젝트에만 적용. **gitignore에 추가 권장.**

```json
{
  "hubUrl": "https://agent-factorio.vercel.app",
  "orgId": "org-12345",
  "agentId": "agent-17345678",
  "agentName": "my-project",
  "vendor": "anthropic",
  "model": "claude-opus-4-6",
  "pushedAt": "2026-02-19T11:51:00.000Z"
}
```

---

## CLI API Endpoints

CLI는 인증 없이 접근 가능한 전용 API를 사용합니다.

### `POST /api/cli/login`

조직 생성 또는 초대 코드로 참여.

**요청 (참여):**
```json
{
  "action": "join",
  "inviteCode": "C2M2XF",
  "memberName": "Alice"
}
```

**요청 (생성):**
```json
{
  "action": "create",
  "orgName": "My Org",
  "memberName": "Alice"
}
```

**응답:**
```json
{
  "orgId": "org-12345",
  "orgName": "My Org",
  "inviteCode": "C2M2XF"
}
```

### `POST /api/cli/push`

에이전트 등록 또는 업데이트. `agentId`가 있으면 업데이트, 없으면 신규 등록.

**요청:**
```json
{
  "agentId": "agent-123 (optional, for update)",
  "agentName": "my-project",
  "vendor": "anthropic",
  "model": "claude-opus-4-6",
  "orgId": "org-12345",
  "description": "...",
  "mcpTools": [{ "name": "github", "server": "github" }],
  "context": [{ "type": "claude-md", "content": "...", "sourceFile": ".claude/CLAUDE.md" }]
}
```

**응답 (생성):**
```json
{
  "id": "agent-17345678",
  "departmentId": "dept-456",
  "updated": false,
  "message": "Agent \"my-project\" registered successfully"
}
```

**응답 (업데이트):**
```json
{
  "id": "agent-17345678",
  "updated": true,
  "message": "Agent \"my-project\" updated successfully"
}
```

---

## File Structure

```
cli/
  bin.mjs                  # Entry point (#!/usr/bin/env node)
  commands/
    login.mjs              # login command
    push.mjs               # push command
    status.mjs             # status command
    whoami.mjs             # whoami command
    logout.mjs             # logout command
  lib/
    config.mjs             # Global/local config read/write
    detect.mjs             # Auto-detect (git, skills, MCP, CLAUDE.md)
    api.mjs                # Hub API call helper
    prompt.mjs             # Interactive prompts (ask, choose, confirm)
    log.mjs                # Colored output utilities
```

---

## Troubleshooting

**`Cannot connect to hub`**
- 허브가 실행 중인지 확인 (`pnpm dev` 또는 배포된 URL)
- Hub URL이 올바른지 확인 (프로토콜 포함: `http://` 또는 `https://`)

**`Not logged in`**
- `agent-factorio login`을 먼저 실행
- `~/.agent-factorio/config.json` 파일이 존재하는지 확인

**`No departments exist`**
- CLI push는 부서가 없으면 자동으로 "Engineering" 부서를 생성

**`Invalid invite code`**
- 초대 코드가 정확한지 확인 (대소문자 무관, 6자리)
- 해당 조직이 허브에 존재하는지 확인
