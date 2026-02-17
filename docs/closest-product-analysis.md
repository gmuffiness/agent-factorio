# 컨셉 매칭 분석: "에이전트 Fleet Management with Spatial GUI"

> 작성일: 2026-02-17
> 컨셉: 게더타운 느낌의 Spatial GUI로, 멀티벤더(Claude Code, Gemini, Codex) 에이전트를 부서별로 시각화하고, 비용/스킬을 한눈에 관리하는 도구

---

## 평가 기준 (5가지 축)

| # | 기준 | 설명 |
|---|------|------|
| 1 | **멀티벤더 지원** | Claude, Gemini, Codex 등 다양한 AI 벤더를 단일 플랫폼에서 |
| 2 | **부서별 그룹핑** | 조직 구조(부서/팀) 단위로 에이전트 관리 |
| 3 | **부서별 비용 귀속** | 부서/팀별 AI 사용 비용 추적 및 분석 |
| 4 | **에이전트별 스킬/플러그인 가시성** | 각 에이전트가 어떤 도구/스킬을 사용 가능한지 시각화 |
| 5 | **Spatial/Visual GUI** | 게더타운처럼 공간적이고 인터랙티브한 UI |

---

## Tier 1: 가장 근접한 제품 (3~4개 기준 충족)

### 1. Portkey AI ★ 가장 근접 (종합 ~62%)

> 멀티벤더 AI 게이트웨이 + 비용 관리의 왕

| 기준 | 점수 | 비고 |
|------|------|------|
| 멀티벤더 지원 | 9/10 | 250+ 모델 지원 (OpenAI, Anthropic, Google, Azure, Bedrock 등) |
| 부서별 그룹핑 | 8/10 | "Workspaces"가 부서/팀에 직접 매핑, 격리 경계 제공 |
| 부서별 비용 귀속 | 9/10 | 워크스페이스별 예산, 팀/프로젝트별 메타데이터 태깅, 토큰 단위 비용 추적 |
| 스킬/플러그인 가시성 | 3/10 | 모델 사용량/호출 도구 추적은 하지만, 에이전트별 "스킬 카탈로그" 시각화 없음 |
| Spatial/Visual GUI | 2/10 | 표준 분석 대시보드. 게더타운 느낌 전혀 없음 |

- 사이트: https://portkey.ai/
- **강점:** 멀티벤더 비용 귀속에서는 최고 수준
- **약점:** UI가 일반적인 대시보드, 에이전트 스킬 가시성 부족

---

### 2. Microsoft Agent 365 (종합 ~64%)

> 에이전트 토폴로지 시각화가 있는 유일한 대형 플랫폼

| 기준 | 점수 | 비고 |
|------|------|------|
| 멀티벤더 지원 | 7/10 | 오픈 표준 기반으로 타사 에이전트 지원 (실질적으로 MS 생태계 중심) |
| 부서별 그룹핑 | 8/10 | IT, 보안, 비즈니스 리더별 맞춤 메트릭 |
| 부서별 비용 귀속 | 6/10 | 성과/ROI 추적 있으나 상세 비용 귀속은 아직 발전 중 |
| 스킬/플러그인 가시성 | 6/10 | 에이전트 등록 시스템에 카탈로그화, 상호운용성 레이어에서 연결 표시 |
| Spatial/Visual GUI | 5/10 | **"에이전트, 사용자, 리소스 간 연결의 완전한 맵"** 토폴로지 시각화 존재 |

- **강점:** 시각화 측면에서 대형 플랫폼 중 가장 진보적. 토폴로지/관계 시각화 보유
- **약점:** MS 생태계 종속, 그래프/대시보드이지 Spatial Canvas는 아님

---

### 3. LiteLLM (종합 ~60%)

> 오픈소스 AI 게이트웨이 + 부서별 비용 추적의 최강자

| 기준 | 점수 | 비고 |
|------|------|------|
| 멀티벤더 지원 | 9/10 | 100+ LLM: OpenAI, Anthropic, Google, Azure, Bedrock, Cohere 등 |
| 부서별 그룹핑 | 8/10 | 명시적 "Cost Center Tracking" (엔지니어링, 마케팅 등 부서별 할당) |
| 부서별 비용 귀속 | 9/10 | 태그 기반 부서별 예산, 일/월 단위 예산, 프로바이더별 예산 라우팅 |
| 스킬/플러그인 가시성 | 2/10 | 에이전트 스킬/도구 가시성 개념 없음 |
| Spatial/Visual GUI | 2/10 | 기본적인 Usage Tab 대시보드. 주로 프록시 인프라 |

- 사이트: https://docs.litellm.ai/
- **강점:** 오픈소스, 부서별 비용 추적에 가장 유연. 셀프호스팅 가능
- **약점:** 인프라 레이어 도구. UI 최소한, Spatial 없음

---

## Tier 2: 부분 매칭 (2~3개 기준 우수)

### 4. ClawHQ (종합 ~46%)

> 에이전트 스킬 마켓플레이스의 원조

| 기준 | 점수 | 비고 |
|------|------|------|
| 멀티벤더 지원 | 3/10 | OpenClaw 프레임워크 한정 |
| 부서별 그룹핑 | 3/10 | Fleet 관리 있으나 부서 구조 없음 |
| 부서별 비용 귀속 | 2/10 | 비용 추적 없음 |
| 스킬/플러그인 가시성 | **9/10** | **스킬 마켓플레이스** - 에이전트 기능 설치/브라우징/퍼블리시. 크리에이터 80% 수익 |
| Spatial/Visual GUI | 6/10 | 칸반 보드 + 드래그앤드롭 + 실시간 플릿 상태 + 통합 채팅 |

- **주목 포인트:** "에이전트별 사용 가능한 스킬" 가시화에서는 가장 근접한 컨셉

### 5. Covasant CAMS (종합 ~56%)

> 멀티클라우드 + 비주얼 에이전트 빌더

| 기준 | 점수 | 비고 |
|------|------|------|
| 멀티벤더 지원 | 8/10 | "하이퍼스케일러 멀티버스 통합" - Azure AI Foundry, Google Vertex AI 등 |
| 부서별 그룹핑 | 5/10 | 멀티에이전트 오케스트레이션, 부서 구조 명시적이진 않음 |
| 부서별 비용 귀속 | 4/10 | 풀스택 옵저버빌리티, 비용 귀속 상세 불명확 |
| 스킬/플러그인 가시성 | 6/10 | 비주얼 Agent Builder, 프리빌트 커넥터 (SAP, Oracle) |
| Spatial/Visual GUI | 5/10 | **드래그앤드롭 비주얼 에이전트 빌더 + 멀티에이전트 토폴로지 시각화** |

- 사이트: https://www.covasant.com/
- **주목 포인트:** 멀티에이전트 토폴로지 시각화가 있는 몇 안 되는 제품

### 6. OpenAI Frontier (종합 ~54%)

> OpenAI가 만든 벤더 중립 에이전트 관리 플랫폼

| 기준 | 점수 | 비고 |
|------|------|------|
| 멀티벤더 지원 | 8/10 | OpenAI, Google, Microsoft, Anthropic, 자체 에이전트 모두 지원 명시 |
| 부서별 그룹핑 | 6/10 | 에이전트별 거버넌스/권한, 부서 구조는 발전 중 |
| 부서별 비용 귀속 | 5/10 | 엔터프라이즈 거버넌스 내장, 상세 비용 귀속은 미비 |
| 스킬/플러그인 가시성 | 5/10 | 에이전트별 ID, 권한, 가드레일, 도구/기능 정의 |
| Spatial/Visual GUI | 3/10 | ChatGPT + Atlas 워크플로 인터페이스 |

- 사이트: https://openai.com/business/frontier/
- **주목 포인트:** OpenAI가 벤더 중립을 명시적으로 지향한다는 점이 주목할 만함 (2026.02 출시)

### 7. Helicone (종합 ~48%)

> 오픈소스 LLM 옵저버빌리티

| 기준 | 점수 | 비고 |
|------|------|------|
| 멀티벤더 지원 | 8/10 | 300+ 모델 (Model Registry v2) |
| 부서별 그룹핑 | 5/10 | 사용자/프로젝트별 분석, 커스텀 메타데이터로 부서 그룹핑 가능 |
| 부서별 비용 귀속 | 7/10 | 사용자/프로젝트/엔드포인트별 비용 분석, 예산 알림, Slack 요약 |
| 스킬/플러그인 가시성 | 2/10 | 요청 레벨 로깅, 에이전트-스킬 가시성 없음 |
| Spatial/Visual GUI | 2/10 | 표준 옵저버빌리티 대시보드 |

- 사이트: https://www.helicone.ai/

---

## Tier 3: 기타 참고 제품

| 제품 | 종합 | 강점 |
|------|------|------|
| CrewAI AMP | ~58% | 에이전트-as-엔티티 + 도구/역할 정의에 강함 (CrewAI 한정) |
| Nexos.ai | ~56% | 200+ 모델 통합, 노코드 에이전트 빌더, 비용 최적화 |
| Agent Control Platform | ~50% | 범용 "플릿 대시보드" (agentcontrolplatform.com) |
| Gravitee Agent Mesh | ~48% | A2A 프로토콜 기반 에이전트 카탈로그/디스커버리 |
| Kubiya | ~46% | DevOps 에이전트 관리 특화 |
| Panorad AI | ~54% | AI 비용 분석/ROI에 특화 (에이전트 관리는 아님) |

---

## 핵심 결론

### 완벽한 매치는 없다

5가지 기준 모두를 충족하는 제품은 **존재하지 않는다**. 특히 **Spatial/Visual GUI** 축에서 모든 제품이 약하다.

### 각 축의 Best-in-Class

| 요구사항 | 최고 제품 | 점수 |
|---------|----------|------|
| 멀티벤더 지원 | **Portkey / LiteLLM** | 9/10 |
| 부서별 그룹핑 | **Portkey** (Workspaces) / **LiteLLM** (Cost Centers) | 8/10 |
| 부서별 비용 귀속 | **Portkey / LiteLLM / Panorad** | 9/10 |
| 스킬/플러그인 가시성 | **ClawHQ** (스킬 마켓플레이스) | 9/10 |
| Spatial/Visual GUI | **Microsoft Agent 365** (토폴로지 맵) | 5/10 |

### "이상적인 조합" (만든다면)

```
[백엔드/인프라 레이어]
  LiteLLM 또는 Portkey → 멀티벤더 라우팅 + 부서별 비용 추적

[에이전트 스킬 관리 레이어]
  ClawHQ 스킬 마켓플레이스 컨셉 → 에이전트별 도구/플러그인 카탈로그

[토폴로지/관계 레이어]
  Microsoft Agent 365 스타일 → 에이전트-사용자-리소스 연결 맵

[프론트엔드 UI 레이어]
  Gather.town / SpatialChat 스타일 2D Spatial Canvas
  → 부서를 "방"으로, 에이전트를 "아바타"로, 스킬을 "장비"로 시각화
```

### 시장 기회

> **"Spatial Agent Fleet Management"** 는 현재 시장에서 **명확한 공백(whitespace)** 이다.
>
> 비용 관리(Portkey/LiteLLM)와 에이전트 오케스트레이션(CrewAI/Agent 365)은 각각 존재하지만,
> 이를 **게더타운 같은 Spatial UI**로 통합한 제품은 아직 없다.
> 이것이 바로 이 프로젝트의 차별화 포인트가 될 수 있다.

---

## 참고 소스

- [Portkey AI](https://portkey.ai/) / [Portkey Cost Attribution](https://portkey.ai/for/manage-and-attribute-costs)
- [LiteLLM](https://docs.litellm.ai/) / [LiteLLM Cost Center Tracking](https://docs.litellm.ai/docs/proxy/cost_tracking)
- [Microsoft Agent 365](https://www.microsoft.com/en-us/microsoft-365/blog/2025/11/18/microsoft-agent-365-the-control-plane-for-ai-agents/)
- [ClawHQ](https://news.ycombinator.com/item?id=47024332) / [ClawMarket](https://claw-market.xyz/)
- [OpenAI Frontier](https://openai.com/business/frontier/)
- [Covasant CAMS](https://www.covasant.com/)
- [Helicone](https://www.helicone.ai/)
- [Nexos.ai](https://nexos.ai/)
- [Gravitee Agent Mesh](https://www.gravitee.io/platform/ai-agent-management)
- [Agent Control Platform](https://www.agentcontrolplatform.com/)
