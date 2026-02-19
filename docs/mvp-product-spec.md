# AgentFloor - MVP Product Specification

> AI Agent Fleet Management with Spatial GUI
> Version: 0.1 (MVP) | Last Updated: 2026-02-17

---

## 1. 제품 비전 & 문제 정의

### 비전

**"AI 에이전트의 조감도(Bird's-Eye View)를 게임처럼 직관적으로."**

AgentFloor는 조직 전체의 AI 에이전트 운영 현황을 게더타운(Gather.town) 스타일의 2D Spatial GUI로 시각화하는 Fleet Management 도구다. 부서를 방(Room)으로, 에이전트를 아바타(Avatar)로, 스킬을 장비(Equipment)로 표현하여 CTO/VP of Engineering이 한눈에 AI 에이전트 현황을 파악할 수 있게 한다.

### 문제 정의

기업의 AI 에이전트 도입이 가속화되면서 다음과 같은 문제가 발생하고 있다:

| 문제 | 현재 상황 |
|---|---|
| **가시성 부재** | N개 부서가 Claude Code, Gemini, Codex 등을 혼용하지만, 전사 관점의 통합 뷰가 없음 |
| **비용 블랙박스** | 부서별 AI 지출을 파악하려면 각 벤더 콘솔을 개별 확인해야 함 |
| **역량 파편화** | 어떤 에이전트가 어떤 스킬/도구를 갖추고 있는지 조직 차원에서 알 수 없음 |
| **대시보드 피로** | 기존 도구(Portkey, Helicone 등)는 숫자와 차트 나열에 그쳐 직관적 파악이 어려움 |

### 왜 지금인가

- 자율 AI 에이전트 시장: 2026년 $8.5B → 2030년 $35B 전망
- Gartner: 2028년까지 엔터프라이즈 소프트웨어의 33%에 Agentic AI 포함 예측 (2024년 <1%)
- 동시에 Gartner는 2027년까지 Agentic AI 프로젝트의 40%+ 가 비용, 불명확한 ROI로 취소될 것으로 예측
- **에이전트 관리 도구의 수요는 폭발적이나, "Spatial Fleet Management"는 시장 공백**

---

## 2. 타겟 페르소나

### Primary: CTO / VP of Engineering

```
이름: 김서준 (가상 페르소나)
직책: CTO, 미드마켓 테크 기업 (엔지니어 200명, 15개 팀)
경험: 15년차 엔지니어링 리더
```

**왜 미드마켓(150-500명)인가:**
- 부서별 AI 에이전트 분산 운영이 본격화되는 규모 (5개+ 팀이 독립적으로 에이전트 도입)
- 스타트업 대비 벤더 혼용도가 높아 통합 가시성 니즈가 절실
- 전담 AI 거버넌스 조직이 없어 CTO가 직접 현황을 파악해야 하는 단계
- 엔터프라이즈 대비 도입 의사결정이 빠르고 POC 장벽이 낮음

**일상의 Pain Points:**

1. **"우리 회사 AI 에이전트 현황이 어떻게 되지?"**
   - 백엔드 팀은 Claude Code, 프론트엔드 팀은 Cursor + GPT-4, 데이터 팀은 Gemini
   - 어떤 팀이 어떤 에이전트를 쓰는지 한눈에 볼 수 없음

2. **"이번 달 AI 비용이 왜 이렇게 나왔지?"**
   - 각 벤더 대시보드를 개별 확인하면 30분 소요
   - 부서별 비용 attribution이 불가능

3. **"새 에이전트 도입 시 어떤 스킬이 이미 있고, 뭐가 부족한지?"**
   - 팀별로 중복 도구를 구매하는 비효율
   - 조직 전체의 AI 역량 인벤토리가 없음

4. **"경영진에게 AI 투자 현황을 보고하려면?"**
   - 스프레드시트에 수동으로 데이터를 모아야 함
   - 시각적으로 임팩트 있는 보고 자료 부재

**원하는 것:**
- 한 화면에서 전사 AI 에이전트 현황 파악
- 부서별 비용 실시간 확인
- 직관적이고 시각적으로 강렬한 인터페이스 (경영진 보고에도 활용 가능)

---

## 3. 핵심 기능 (MVP Scope)

### MVP에 포함하는 기능

| # | 기능 | 설명 | 우선순위 |
|---|---|---|---|
| F1 | **Spatial Map** | 게더타운 스타일 2D 맵. 부서 = 방, 에이전트 = 아바타 | P0 |
| F2 | **부서별 비용 대시보드** | 부서(방) 클릭 시 해당 부서의 벤더별 AI 비용 현황 | P0 |
| F3 | **에이전트 상세 패널** | 아바타 클릭 시 에이전트 정보 (벤더, 비용, 상태, 스킬 목록) | P0 |
| F4 | **스킬 카탈로그** | 조직 전체의 에이전트 스킬/도구 인벤토리 | P1 |
| F5 | **전사 비용 Overview** | 상단 바에 전사 총 비용, 벤더별 비용 비율 요약 | P1 |
| F6 | **줌 인/아웃** | 전사 조감도 ↔ 부서 상세 뷰 전환 | P1 |

### MVP에서 제외하는 기능 (Post-MVP)

| 기능 | 제외 사유 |
|---|---|
| 실제 API 연동 (Anthropic, OpenAI, Google) | MVP는 Mock 데이터로 컨셉 증명 |
| 에이전트 실시간 모니터링 | 실시간 데이터 없이 시뮬레이션으로 대체 |
| 스킬 마켓플레이스 | Phase 2 이후 |
| 사용자 인증/권한 관리 | Phase 2 이후 |
| 에이전트 간 통신 시각화 | Phase 3 이후 |
| 알림/경보 시스템 | Phase 2 이후 |

---

## 4. UI/UX 컨셉

### 전체 레이아웃

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] AgentFloor    Total: $12,340/mo   [Zoom] [?]  │  ← Top Bar
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│   │ Backend  │    │ Frontend │    │   Data   │             │
│   │  Team    │    │  Team    │    │  Team    │             │
│   │ 🤖🤖🤖  │    │ 🤖🤖    │    │ 🤖🤖🤖  │             │
│   │ $3,200   │    │ $2,100   │    │ $4,500   │             │  ← Spatial Map
│   └──────────┘    └──────────┘    └──────────┘             │    (Canvas)
│                                                             │
│   ┌──────────┐    ┌──────────┐                              │
│   │ DevOps   │    │ Security │                              │
│   │  Team    │    │  Team    │                              │
│   │ 🤖       │    │ 🤖🤖    │                              │
│   │ $890     │    │ $1,650   │                              │
│   └──────────┘    └──────────┘                              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Anthropic: 42% | OpenAI: 35% | Google: 23%   [Details]    │  ← Bottom Bar
└─────────────────────────────────────────────────────────────┘
```

### Spatial Map 상세

**방(Room) = 부서**
- 각 부서는 벽으로 둘러싸인 직사각형 영역
- 방의 크기는 해당 부서의 에이전트 수에 비례
- 방 상단에 부서명, 하단에 월간 비용 표시
- 방의 배경색은 주요 사용 벤더에 따라 은은하게 변경:
  - Anthropic(Claude) → 연한 주황
  - OpenAI → 연한 초록
  - Google(Gemini) → 연한 파랑
- 비용이 예산 대비 높으면 방 테두리가 붉은색으로 변경 (경고 시각화)

**아바타(Avatar) = 에이전트**
- 각 에이전트는 픽셀 아트 스타일의 작은 캐릭터로 표현
- 벤더별 구분:
  - Claude Code → 주황 캐릭터
  - GPT/Codex → 초록 캐릭터
  - Gemini → 파랑 캐릭터
- 에이전트 상태 표시:
  - Active → 캐릭터가 미세하게 움직이는 idle 애니메이션
  - Idle → 정지 상태
  - Error → 빨간 느낌표 이모티콘 표시
- 아바타 위에 이름 라벨 표시 (hover 시)

**장비(Equipment) = 스킬**
- 아바타를 클릭하면 사이드 패널에 스킬 목록이 아이콘으로 표시
- 스킬 예시: Code Generation, Code Review, Testing, Documentation, Debugging

### 인터랙션 패턴

| 액션 | 결과 |
|---|---|
| **맵 위 드래그** | 맵 패닝(이동) |
| **스크롤 / 핀치** | 줌 인/아웃 |
| **방(부서) 클릭** | 부서 상세 패널 열림 (비용 차트, 에이전트 목록) |
| **아바타(에이전트) 클릭** | 에이전트 상세 패널 열림 (벤더, 모델, 비용, 스킬) |
| **방 더블클릭** | 해당 부서로 줌 인 (부서 내부 확대 뷰) |
| **빈 영역 더블클릭** | 전사 조감도로 줌 아웃 |

### 사이드 패널 (Drawer)

우측에서 슬라이드로 열리는 상세 패널:

**부서 패널 (Department Drawer)**
```
┌──────────────────────────┐
│  Backend Team            │
│  ──────────────────────  │
│  Monthly Cost: $3,200    │
│  Agents: 3               │
│                          │
│  [벤더별 비용 파이 차트]    │
│  Anthropic: $2,400 (75%) │
│  OpenAI:    $800   (25%) │
│                          │
│  ── Agents ──            │
│  🟠 Claude Code #1  $1,200│
│  🟠 Claude Code #2  $1,200│
│  🟢 GPT-4 Codex     $800 │
│                          │
│  ── Trend ──             │
│  [월별 비용 추이 차트]     │
└──────────────────────────┘
```

**에이전트 패널 (Agent Drawer)**
```
┌──────────────────────────┐
│  🟠 Claude Code #1       │
│  Backend Team            │
│  ──────────────────────  │
│  Vendor: Anthropic       │
│  Model: Claude Sonnet 4.5│
│  Status: Active          │
│  Monthly Cost: $1,200    │
│  Tokens Used: 2.4M       │
│                          │
│  ── Skills ──            │
│  🔧 Code Generation      │
│  🔍 Code Review          │
│  🧪 Testing              │
│  📝 Documentation        │
│  🐛 Debugging            │
│                          │
│  ── Usage (7d) ──        │
│  [일별 사용량 바 차트]     │
└──────────────────────────┘
```

---

## 5. 정보 구조 (Data Model)

### Entity Relationship

```
Organization (1)
  └── Department (N)
        ├── name: string
        ├── budget: number
        ├── position: { x, y, width, height }  // Spatial Map 좌표
        ├── color: string
        └── Agent (N)
              ├── name: string
              ├── vendor: "anthropic" | "openai" | "google"
              ├── model: string
              ├── status: "active" | "idle" | "error"
              ├── monthlyCost: number
              ├── tokensUsed: number
              ├── position: { x, y }  // 방 내 상대 좌표
              └── Skill (N)
                    ├── name: string
                    ├── category: string
                    └── icon: string
```

### TypeScript 인터페이스

```typescript
interface Organization {
  id: string;
  name: string;
  totalBudget: number;
  departments: Department[];
}

interface Department {
  id: string;
  name: string;
  budget: number;
  monthlySpend: number;
  // Spatial positioning (방의 위치와 크기)
  layout: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  primaryVendor: Vendor;
  agents: Agent[];
  costHistory: MonthlyCost[];
}

interface Agent {
  id: string;
  name: string;
  vendor: Vendor;
  model: string;
  status: AgentStatus;
  monthlyCost: number;
  tokensUsed: number;
  // 방 내 상대 좌표
  position: { x: number; y: number };
  skills: Skill[];
  usageHistory: DailyUsage[];
}

interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  icon: string;
  description: string;
}

type Vendor = "anthropic" | "openai" | "google";
type AgentStatus = "active" | "idle" | "error";
type SkillCategory = "generation" | "review" | "testing" | "documentation" | "debugging" | "deployment";

interface MonthlyCost {
  month: string; // "2026-01"
  amount: number;
  byVendor: Record<Vendor, number>;
}

interface DailyUsage {
  date: string; // "2026-02-17"
  tokens: number;
  cost: number;
  requests: number;
}
```

### Mock 데이터 구조 (예시)

```
Acme Corp (Organization)
├── Backend Team (Department)
│   ├── Claude Code "backend-claude-1" (Agent, Active, $1,200/mo)
│   │   └── Skills: Code Generation, Code Review, Debugging
│   ├── Claude Code "backend-claude-2" (Agent, Active, $1,200/mo)
│   │   └── Skills: Code Generation, Testing, Documentation
│   └── GPT-4 Codex "backend-codex-1" (Agent, Idle, $800/mo)
│       └── Skills: Code Generation, Code Review
│
├── Frontend Team (Department)
│   ├── Claude Code "frontend-claude-1" (Agent, Active, $1,100/mo)
│   │   └── Skills: Code Generation, Code Review, Testing
│   └── GPT-4 "frontend-gpt-1" (Agent, Active, $1,000/mo)
│       └── Skills: Code Generation, Documentation
│
├── Data Team (Department)
│   ├── Gemini "data-gemini-1" (Agent, Active, $1,800/mo)
│   │   └── Skills: Code Generation, Data Analysis, Documentation
│   ├── Gemini "data-gemini-2" (Agent, Active, $1,500/mo)
│   │   └── Skills: Data Analysis, Testing, Debugging
│   └── Claude Code "data-claude-1" (Agent, Error, $1,200/mo)
│       └── Skills: Code Generation, Code Review
│
├── DevOps Team (Department)
│   └── Claude Code "devops-claude-1" (Agent, Active, $890/mo)
│       └── Skills: Deployment, Debugging, Code Generation
│
└── Security Team (Department)
    ├── GPT-4 "security-gpt-1" (Agent, Active, $950/mo)
    │   └── Skills: Code Review, Security Scan, Debugging
    └── Claude Code "security-claude-1" (Agent, Active, $700/mo)
        └── Skills: Code Review, Security Scan
```

---

## 6. 화면 설계

### Screen 1: Spatial Map (메인 화면)

**목적:** 전사 AI 에이전트 현황을 한눈에 파악하는 조감도

**구성 요소:**
- **Top Bar**: 로고, 조직명, 전사 총 비용, 줌 컨트롤, 설정 버튼
- **Canvas Area**: 2D 공간 맵 (부서 방 + 에이전트 아바타)
- **Bottom Bar**: 벤더별 비용 비율 요약, 전체 에이전트 수, 상세 보기 링크

**동작:**
1. 페이지 로드 시 전사 조감도로 모든 부서 방이 보이는 줌 레벨
2. 각 방 안에 에이전트 아바타가 배치되어 있음
3. Active 에이전트는 미세한 idle 애니메이션
4. 방 위에 비용 라벨, 아바타 위에 이름 라벨 (hover)

### Screen 2: Department Detail (부서 상세)

**진입 방식:** 방 클릭 또는 더블클릭으로 줌 인

**구성 요소:**
- **부서 헤더**: 부서명, 총 비용, 예산 대비 사용률 Progress Bar
- **벤더별 비용 Pie Chart**: Anthropic / OpenAI / Google 비율
- **에이전트 리스트**: 카드 형태로 에이전트 나열 (아이콘, 이름, 모델, 비용, 상태)
- **비용 추이 Line Chart**: 최근 6개월 비용 트렌드
- **스킬 매트릭스**: 부서 내 에이전트별 보유 스킬 매트릭스 테이블

### Screen 3: Agent Detail (에이전트 상세)

**진입 방식:** 아바타 클릭 → 우측 Drawer 패널

**구성 요소:**
- **에이전트 프로필**: 아바타 아이콘, 이름, 벤더, 모델명, 상태 뱃지
- **비용 정보**: 월간 비용, 토큰 사용량, 요청 수
- **스킬 목록**: 아이콘 + 이름으로 보유 스킬 나열
- **사용량 차트**: 최근 7일 일별 사용량 Bar Chart
- **메타데이터**: 생성일, 마지막 활동 시간, 할당 부서

### Screen 4: Skill Catalog (스킬 카탈로그)

**진입 방식:** Top Bar 또는 Bottom Bar의 "Skills" 메뉴

**구성 요소:**
- **스킬 그리드**: 전사에서 사용 중인 모든 스킬을 카드 형태로 나열
- **필터**: 카테고리별 필터 (Generation, Review, Testing, Documentation, Debugging, Deployment)
- **스킬 카드**: 아이콘, 이름, 카테고리, 보유 에이전트 수, 보유 부서 목록
- **스킬 클릭 시**: 해당 스킬을 보유한 에이전트 목록 + Spatial Map에서 해당 에이전트 하이라이트

### Screen 5: Cost Overview (비용 개요)

**진입 방식:** Top Bar의 비용 클릭 또는 Bottom Bar의 "Details"

**구성 요소:**
- **전사 비용 요약**: 이번 달 총 비용, 전월 대비 증감률
- **벤더별 Breakdown**: Donut Chart + 상세 테이블
- **부서별 Breakdown**: Horizontal Bar Chart (비용 순 정렬)
- **비용 추이**: 최근 6개월 전사 비용 Stacked Area Chart (벤더별 색상)
- **Top Agents**: 비용 상위 5개 에이전트 리스트

---

## 7. 기술 아키텍처

### 전체 구조

```
┌─────────────────────────────────────────┐
│              Next.js App                │
│         (TypeScript + App Router)       │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────┐  ┌──────────────────┐    │
│  │  Spatial   │  │   Dashboard      │    │
│  │  Canvas    │  │   Components     │    │
│  │ (Pixi.js) │  │  (React + Charts)│    │
│  └─────┬─────┘  └────────┬─────────┘    │
│        │                  │              │
│  ┌─────┴──────────────────┴─────────┐   │
│  │       State Management           │   │
│  │     (Zustand or Context API)     │   │
│  └──────────────┬───────────────────┘   │
│                 │                        │
│  ┌──────────────┴───────────────────┐   │
│  │       Mock Data Layer            │   │
│  │   (JSON + Factory Functions)     │   │
│  └──────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### 기술 스택

| 레이어 | 기술 | 선택 이유 |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | React 기반, SSR/SSG 지원, 배포 용이 (Vercel) |
| **Language** | TypeScript | 타입 안전성, 데이터 모델 정합성 보장 |
| **Spatial Rendering** | Pixi.js (PixiJS 8) | 2D WebGL 렌더링, 게임급 성능, 줌/패닝 지원 |
| **차트** | Recharts or Nivo | React 친화적, 커스터마이징 용이 |
| **상태 관리** | Zustand | 경량, 간결한 API, React 외부에서도 접근 가능 (Canvas 연동) |
| **스타일링** | Tailwind CSS | 빠른 프로토타이핑, 일관된 디자인 시스템 |
| **Mock Data** | JSON + faker.js | 컨셉 증명에 충분한 현실감 있는 데이터 생성 |

### 디렉토리 구조 (예상)

```
src/
├── app/
│   ├── layout.tsx            # Root layout (Top Bar, Bottom Bar)
│   ├── page.tsx              # Main: Spatial Map
│   ├── cost/
│   │   └── page.tsx          # Cost Overview
│   └── skills/
│       └── page.tsx          # Skill Catalog
│
├── components/
│   ├── spatial/
│   │   ├── SpatialCanvas.tsx     # Pixi.js 캔버스 래퍼
│   │   ├── DepartmentRoom.ts     # 부서 방 렌더링
│   │   ├── AgentAvatar.ts        # 에이전트 아바타 렌더링
│   │   └── MapControls.tsx       # 줌/패닝 컨트롤
│   │
│   ├── panels/
│   │   ├── DepartmentDrawer.tsx  # 부서 상세 사이드 패널
│   │   └── AgentDrawer.tsx       # 에이전트 상세 사이드 패널
│   │
│   ├── charts/
│   │   ├── CostPieChart.tsx      # 벤더별 비용 파이 차트
│   │   ├── CostTrendChart.tsx    # 비용 추이 라인 차트
│   │   └── UsageBarChart.tsx     # 사용량 바 차트
│   │
│   └── ui/
│       ├── TopBar.tsx
│       ├── BottomBar.tsx
│       └── Badge.tsx
│
├── data/
│   ├── mock-organization.ts     # Mock 조직 데이터
│   ├── mock-departments.ts      # Mock 부서 데이터
│   ├── mock-agents.ts           # Mock 에이전트 데이터
│   └── mock-skills.ts           # Mock 스킬 데이터
│
├── stores/
│   └── app-store.ts             # Zustand 글로벌 스토어
│
├── types/
│   └── index.ts                 # 공유 TypeScript 인터페이스
│
└── lib/
    └── utils.ts                 # 유틸리티 함수
```

### Spatial Canvas 아키텍처

```
Pixi.js Application
├── Viewport (pixi-viewport)
│   ├── Background Layer
│   │   └── Grid / Floor texture
│   │
│   ├── Room Layer
│   │   ├── Department Room 1 (Graphics + Text)
│   │   ├── Department Room 2
│   │   └── ...
│   │
│   ├── Avatar Layer
│   │   ├── Agent Avatar 1 (Sprite + AnimatedSprite)
│   │   ├── Agent Avatar 2
│   │   └── ...
│   │
│   └── UI Layer (labels, tooltips)
│
└── Event System
    ├── Click → Open Drawer
    ├── Hover → Show Tooltip
    └── Wheel/Pinch → Zoom
```

**핵심 기술 결정:**
- `pixi-viewport` 라이브러리로 줌/패닝/바운드 처리
- Pixi.js의 이벤트 시스템으로 클릭/호버 감지
- React ↔ Pixi 연동: `@pixi/react` 또는 imperative ref 패턴
- 아바타 스프라이트는 스프라이트시트로 관리 (벤더별 색상 변형)

---

## 8. MVP 로드맵

### Phase 1: Core Spatial Map

**목표:** 정적 Spatial Map에서 부서와 에이전트를 시각화

| # | Task | 설명 |
|---|---|---|
| 1-1 | 프로젝트 셋업 | Next.js + TypeScript + Tailwind + Pixi.js 초기 구성 |
| 1-2 | Mock 데이터 | Organization/Department/Agent/Skill mock 데이터 생성 |
| 1-3 | Spatial Canvas | Pixi.js 캔버스 + pixi-viewport 줌/패닝 구현 |
| 1-4 | Department Room | 부서 방 렌더링 (벽, 이름, 비용 라벨, 배경색) |
| 1-5 | Agent Avatar | 에이전트 아바타 렌더링 (벤더별 색상, 상태 표시) |
| 1-6 | Top/Bottom Bar | 전사 비용 요약, 벤더 비율 표시 |

**Phase 1 산출물:** 맵에서 부서와 에이전트를 볼 수 있고, 줌/패닝이 되는 인터랙티브 맵

### Phase 2: Detail Panels & Charts

**목표:** 부서/에이전트 클릭 시 상세 정보 확인 가능

| # | Task | 설명 |
|---|---|---|
| 2-1 | Department Drawer | 부서 클릭 → 우측 패널 (비용 차트, 에이전트 목록) |
| 2-2 | Agent Drawer | 에이전트 클릭 → 우측 패널 (프로필, 스킬, 사용량) |
| 2-3 | Cost Charts | 파이 차트, 라인 차트, 바 차트 구현 |
| 2-4 | Avatar Animation | Active 에이전트 idle 애니메이션, Error 상태 표시 |
| 2-5 | Cost Overview Page | 별도 페이지: 전사 비용 분석 대시보드 |

**Phase 2 산출물:** 클릭하면 상세 정보가 나오는 완전한 인터랙티브 경험

### Phase 3: Polish & Skill Catalog

**목표:** 스킬 카탈로그 추가 및 전반적 폴리시

| # | Task | 설명 |
|---|---|---|
| 3-1 | Skill Catalog Page | 스킬 그리드, 필터, 에이전트 연결 |
| 3-2 | Spatial Highlight | 스킬 선택 시 해당 에이전트 맵에서 하이라이트 |
| 3-3 | Responsive | 데스크톱 최적화 (1280px+), 기본 반응형 |
| 3-4 | Polish | 애니메이션 정교화, 색상 통일, 에지 케이스 처리 |

**Phase 3 산출물:** 데모 가능한 MVP 완성본

### 순서 의존성

```
Phase 1 ──→ Phase 2 ──→ Phase 3
(기반)       (인터랙션)    (완성도)
```

---

## 9. 성공 지표

### MVP 검증 기준

MVP는 **컨셉 증명(Proof of Concept)** 단계이므로, 제품-시장 적합성(PMF) 보다는 **컨셉 반응** 을 검증한다.

**Primary: 온라인 데모 공개**

| 지표 | 측정 방법 | 목표 |
|---|---|---|
| **트래픽** | 데모 사이트 방문자 수 (Product Hunt, Hacker News, X 등에 공유) | 첫 주 1,000+ 방문 |
| **체류 시간** | 평균 세션 시간 | 2분 이상 (맵 탐색에 충분한 시간) |
| **인터랙션 깊이** | 에이전트/부서 클릭 비율 | 방문자의 50%+ 가 1개 이상 클릭 |
| **공유/바이럴** | SNS 공유, GitHub Star 수 | 자발적 공유 발생 여부 확인 |
| **연락 전환** | "우리 회사에 적용해보고 싶다" 문의 수 | 10건 이상 |

**Secondary: 추가 검증 (선택)**

| 지표 | 측정 방법 | 목표 |
|---|---|---|
| **CTO 인터뷰** | 관심 표명한 CTO/VP 대상 1:1 피드백 | 인터뷰 대상 중 60%+ "도입 검토" 반응 |
| **직관성** | 설명 없이 30초 내 핵심 정보 파악 가능 여부 | 80% 이상이 부서별 비용을 30초 내 파악 |

### Post-MVP 확장 시 추적할 지표

| 지표 | 설명 |
|---|---|
| WAU (Weekly Active Users) | 주간 활성 사용자 수 |
| Time to Insight | 첫 로드 → 원하는 정보 확인까지 소요 시간 |
| Feature Adoption | Spatial Map vs Dashboard 뷰 사용 비율 |
| Cost Savings Attributed | 사용 후 실제 AI 비용 절감 사례 |
| NPS | Net Promoter Score |

---

## 10. 경쟁 포지셔닝

### 시장 맵

```
           높은 Spatial/Visual 수준
                    ▲
                    │
                    │    ★ AgentFloor
                    │       (Target Position)
                    │
                    │
     MS Agent 365 ● │
      (topology)    │
                    │
 ───────────────────┼──────────────────────► 높은 Multi-vendor 지원
                    │
         ClawHQ ●   │          ● Portkey
    (skill market)  │          ● LiteLLM
                    │
        CrewAI ●    │   ● Helicone
     AgentOps ●     │
                    │
```

### 경쟁 제품 대비 차별화

| 차원 | Portkey / LiteLLM | MS Agent 365 | ClawHQ | **AgentFloor** |
|---|---|---|---|---|
| Multi-vendor 비용 추적 | 9/10 | 6/10 | 4/10 | **7/10** (mock) |
| 부서별 그룹핑 | 8/10 | 5/10 | 3/10 | **9/10** |
| 스킬/도구 가시성 | 3/10 | 4/10 | 9/10 | **7/10** |
| **Spatial GUI** | **2/10** | **5/10** | **3/10** | **9/10** |
| 직관성/First Impression | 4/10 | 5/10 | 6/10 | **9/10** |

### 핵심 차별화 요약

1. **유일한 Spatial GUI**: 시장의 어떤 제품도 게더타운 스타일의 공간적 에이전트 관리를 제공하지 않음
2. **부서 = 방 메타포**: 조직 구조를 공간적으로 매핑하는 직관적 비유
3. **한눈에 보이는 Fleet**: 숫자 테이블이 아닌, 시각적 공간에서 에이전트 현황 파악
4. **경영진 보고 도구로서의 가치**: 시각적으로 인상적이어서 보드 미팅이나 경영진 보고에 바로 활용 가능

### 포지셔닝 스테이트먼트

> **"For CTOs and VP of Engineering** who need to manage AI agent fleets across departments,
> **AgentFloor** is a spatial fleet management tool
> **that provides** a Gather.town-style visual map of all AI agents, their costs, and capabilities,
> **unlike** traditional dashboards (Portkey, Helicone) or vendor-locked platforms (MS Agent 365),
> **our product** makes AI agent management as intuitive as walking through a virtual office."

---

## Appendix A: 용어 정의

| 용어 | 정의 |
|---|---|
| **Spatial Map** | 2D 공간 맵에 부서와 에이전트를 배치하여 시각화하는 메인 인터페이스 |
| **Room (방)** | Spatial Map에서 부서를 나타내는 직사각형 영역 |
| **Avatar (아바타)** | Spatial Map에서 개별 AI 에이전트를 나타내는 픽셀 캐릭터 |
| **Equipment (장비)** | 에이전트가 보유한 스킬/도구를 게임 아이템처럼 표현한 것 |
| **Fleet** | 조직 전체에서 운영 중인 AI 에이전트 집합 |
| **Vendor** | AI 에이전트 제공사 (Anthropic, OpenAI, Google) |

## Appendix B: 참고 리서치

- [시장 조사 보고서](./ai-agent-orchestration-market-research.md) - AI Agent Orchestration/Management 시장 조사
- [경쟁 제품 분석](./closest-product-analysis.md) - 기존 제품 대비 컨셉 매칭 분석
