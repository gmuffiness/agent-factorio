# AI Agent Orchestration & Management 플랫폼 시장 조사

> 작성일: 2026-02-17
> 목적: 기업 내 다수의 AI 에이전트를 부서별로 관리/오케스트레이션하기 위한 도구 시장 현황 파악

---

## 시장 개요

- 자율형 AI 에이전트 시장 규모: **2025년 $7.6B** → 2033년까지 **CAGR 49.6%** 성장 전망 (Deloitte)
- Gartner 예측: 2028년까지 기업 소프트웨어의 33%가 Agentic AI 포함 (2024년 기준 1% 미만)
- 단, Gartner는 **2027년까지 40% 이상의 Agentic AI 프로젝트가 비용 초과, 불명확한 비즈니스 가치 등으로 취소**될 것으로 경고

### 시장 카테고리 분류

| # | 카테고리 | 설명 |
|---|---------|------|
| 1 | 오픈소스 멀티에이전트 프레임워크 | 개발자가 직접 에이전트 파이프라인 구축 |
| 2 | 엔터프라이즈 에이전트 빌더/오케스트레이션 | 풀스택 SaaS, 에이전트 구축~운영 통합 |
| 3 | 에이전트 옵저버빌리티 & Ops | 모니터링, 디버깅, 비용 추적 |
| 4 | 에이전트 거버넌스 & 보안 | 컴플라이언스, 접근 제어, 감사 |
| 5 | 하이퍼스케일러 에이전트 플랫폼 | AWS, Azure, Google의 관리형 서비스 |
| 6 | MCP 게이트웨이 & 레지스트리 | 에이전트 도구/스킬 관리 인프라 (신흥) |
| 7 | 노코드/로우코드 에이전트 빌더 | 비개발자 대상 |

---

## 1. 오픈소스 멀티에이전트 프레임워크

### CrewAI
- **핵심 특징:** 역할 기반 멀티에이전트 오케스트레이션. 실제 팀 구조를 모방. YAML 기반 설정. CrewAI AMP(Agent Management Platform)로 엔터프라이즈 라이프사이클 지원
- **가격:** Free (50회/월) → Basic $99/월 (100회) → Ultra $120,000/년 (500K회)
- **상태:** GA, 가장 인기 있는 오픈소스 프레임워크 중 하나
- **주목 포인트:** AgentOps, AWS Bedrock AgentCore 등과 통합

### LangGraph (by LangChain)
- **핵심 특징:** 그래프 기반 워크플로 엔진. 에이전트 상호작용을 방향 그래프의 노드로 처리. 조건부 로직, 분기, 병렬 처리 강점
- **가격:** 오픈소스; LangChain 구독 $39/월~. LangSmith(옵저버빌리티) 별도 과금
- **상태:** GA, 매우 활발한 개발. 복잡한 워크플로에 가장 유연한 프레임워크

### AutoGen / AG2 / Microsoft Agent Framework
- **핵심 특징:** 대화형 멀티에이전트 아키텍처
- **주요 변화:**
  - **AutoGen 0.4** (2025.01): 모듈형 아키텍처로 재설계
  - **AG2**: 원작자 Chi Wang(현 Google DeepMind)이 커뮤니티 기반 "AgentOS"로 포크. Meta, IBM 연구자 참여
  - **Microsoft Agent Framework**: Semantic Kernel + AutoGen 통합. **2026 Q1 GA 1.0 목표**. AutoGen/Semantic Kernel은 유지보수 모드(버그 수정만) 진입
- **가격:** 무료 / 오픈소스

### OpenAI Agents SDK (Swarm 후속)
- **핵심 특징:** Swarm의 프로덕션 버전 (2025.03). 3가지 핵심 요소: Agents (LLM + instructions + tools), Handoffs (에이전트 간 위임), Guardrails (입출력 검증). 빌트인 트레이싱
- **가격:** SDK 무료; OpenAI API 사용량 과금
- **상태:** GA. OpenAI는 2026년 중반 Assistants API를 폐기하고 Agents SDK로 전환 예정

### Google Agent Development Kit (ADK)
- **핵심 특징:** 멀티에이전트 AI 시스템의 설계, 오케스트레이션, 테스트, 배포를 위한 오픈소스 프레임워크
- **가격:** 무료 / 오픈소스
- **상태:** GA, 채택 증가 중

---

## 2. 엔터프라이즈 에이전트 빌더 / 오케스트레이션 플랫폼 (상용 SaaS)

### Microsoft Copilot Studio + Agent 365 ★ 주목
- **핵심 특징:** 에이전트 구축, 거버넌스, 스케일링을 위한 풀 매니지드 플랫폼
- **Agent 365 주요 기능:**
  - **Registry**: 모든 에이전트의 단일 진실 소스 (Microsoft Entra 기반)
  - **Access Control**: RBAC + 에이전트별 권한 관리
  - **Visualization**: 대시보드 + 분석
  - **Security**: Defender 통합, Purview 감사, 고객 관리 암호화 키
  - 소유자 없는 에이전트 관리, Human-in-the-loop 제어, 테넌트 전체 인벤토리
- **가격:** Microsoft 365 라이선스 포함; 에이전트 액션별 종량제
- **상태:** GA. **가장 완성도 높은 "에이전트 컨트롤 플레인" 솔루션** 중 하나
- **관리 관점 적합도:** ★★★★★ (부서별 에이전트 현황, 비용, 접근권한 관리에 가장 가까운 비전)

### Salesforce Agentforce
- **핵심 특징:** CRM 워크플로를 위한 Predictive + Generative + Agentic AI. Salesforce 생태계 깊은 통합
- **가격:**
  - Flex Credits: $0.10/액션 ($500/100K 크레딧)
  - 사용자 추가: $125-$150/user/월
  - Agentforce 1 Editions: $550/user/월~
  - 대화당: $2/conversation (고객 대면 봇)
  - 2025.08부터 6% 가격 인상
- **상태:** GA. Salesforce의 핵심 전략적 베팅

### Airia ★ Rising
- **설립:** 2024년 (AirWatch 공동 창업자 John Marshall)
- **핵심 특징:** 통합 엔터프라이즈 AI 보안 + 오케스트레이션 + 거버넌스 플랫폼
  - **AI Security**: 데이터 유출 방지
  - **Agent Orchestration**: 크로스 에이전트 워크플로 관리
  - **AI Governance**: 컴플라이언스, 가시성, 제어
- **펀딩:** **$100M** ($50M 투자 + $50M 커밋)
- **트랙션:** 12개월 만에 300+ 기업 고객, 150명 직원 (5개 대륙)
- **상태:** 급성장 중

### Vellum AI ★ Rising
- **설립:** 2023년 (YC)
- **핵심 특징:** AI 제품 개발 플랫폼 - 에이전트 빌더, 평가, 모니터링, 거버넌스 통합. 채팅 기반 에이전트 생성
- **펀딩:** $20M Series A
- **상태:** GA, 성장 중

### Sema4.ai (구 Robocorp)
- **핵심 특징:** 자연어 프롬프트로 AI 에이전트 구축/관리. 문서 추출 자동화. Snowflake 통합
- **펀딩:** $25M Series A extension (2025.06)
- **상태:** GA

### OpenAI Frontier
- **핵심 특징:** 에이전트 구축, 배포, 관리를 위한 엔터프라이즈 플랫폼. 공유 컨텍스트, 온보딩, 권한, 거버넌스
- **상태:** 2025 출시

### Kore.ai
- **핵심 특징:** 엔터프라이즈급 Agentic AI 플랫폼. 직장 생산성, 고객 서비스, 프로세스 오케스트레이션
- **상태:** GA, 기존 강자

---

## 3. 하이퍼스케일러 에이전트 플랫폼

### AWS Amazon Bedrock AgentCore
- **핵심 특징:** 어떤 프레임워크(CrewAI, LangGraph, OpenAI Agents SDK 등)와 어떤 모델이든 사용 가능한 에이전트 빌드/배포/운영 플랫폼
- **주요 기능:** 접근 관리, 옵저버빌리티, 보안 제어, 에이전트 메모리, 평가, 경계 관리
- **가격:** AWS 종량제
- **상태:** **2025.10 GA**

### Google Vertex AI Agent Builder / Gemini Enterprise
- **핵심 특징:** 로우코드 에이전트 생성, Gemini 모델 활용. 중앙 거버넌스 플랫폼. Google Agentspace가 Gemini Enterprise로 흡수
- **가격:** Google Cloud 종량제
- **상태:** GA

### Microsoft Azure AI Foundry Agent Service
- **핵심 특징:** CI/CD 통합, 엔터프라이즈 시나리오를 위한 프로코드 접근
- **가격:** Azure 종량제
- **상태:** GA

---

## 4. 에이전트 옵저버빌리티 & Ops 도구

### AgentOps ★ 주목
- **핵심 특징:** AI 에이전트 전용 옵저버빌리티. 세션 리플레이, 메트릭, 모니터링. LLM 호출/비용/지연시간/실패/멀티에이전트 상호작용/도구 사용 캡처. 코드 2줄로 통합. 400+ LLM/프레임워크 지원
- **가격:** 무료 티어 + 유료 플랜
- **상태:** GA. Google ADK, CrewAI, OpenAI Agents SDK 등과 통합

### LangSmith (by LangChain)
- **핵심 특징:** LangChain 생태계 밀접 통합. 디버깅, 시각화, 파이프라인 모니터링
- **가격:** 무료 티어; 유료 플랜 (대안 대비 ~10x 비싼 것으로 보고)
- **상태:** GA

### Langfuse ★ Rising (오픈소스)
- **핵심 특징:** Apache 2.0 오픈소스 옵저버빌리티. 프레임워크 무관, OTel 호환. 가장 넓은 통합 생태계
- **가격:** 클라우드 무료 (50K observations/월), Pro $59/월, 셀프호스팅 무료
- **상태:** GA, 빠르게 성장 중

### Arize AI / Phoenix
- **핵심 특징:** Phoenix는 오픈소스 LLM 옵저버빌리티 (무료, 기능 제한 없음). Arize AX는 매니지드 엔터프라이즈 제품
- **가격:** Phoenix 무료; Arize AX $50K-$100K/년
- **상태:** GA

---

## 5. 에이전트 거버넌스 & 보안 플랫폼

### Credo AI
- **핵심 특징:** Gen AI, 에이전트, 서드파티 AI 벤더를 위한 AI 거버넌스 플랫폼. 리스크 관리, 컴플라이언스
- **상태:** GA. **Gartner's Market Guide for AI Governance Platforms (2025)** 등재

### Resistant AI
- **핵심 특징:** 데이터 유출 방지, 불필요한 AI 비용 제거, 컴플라이언스 보장
- **펀딩:** $25M Series B
- **타겟:** 금융 서비스, 규제 산업

### Runlayer ★ Emerging
- **핵심 특징:** MCP 보안 및 관리 플랫폼. 에이전트 도구 접근에 대한 거버넌스 레이어
- **상태:** 초기 단계

---

## 6. MCP 게이트웨이 & 레지스트리 (신흥 카테고리, 2025-2026)

> 2025년 말 2개 → 2026년 초 다수의 플레이어로 급격히 확장된 신흥 인프라 카테고리

### 배경: Anthropic MCP 생태계
- Anthropic이 2024.11 MCP(Model Context Protocol) 도입 → **사실상 표준(de facto standard)**
- OpenAI(ChatGPT), Google(Gemini), Microsoft(Copilot, VS Code), Cursor 등 채택
- 10,000+ 활성 공개 MCP 서버, 월 97M+ SDK 다운로드
- Anthropic이 MCP를 Linux Foundation 산하 **Agentic AI Foundation(AAIF)** 에 기부 (Block, OpenAI 공동 설립; Google, Microsoft, AWS 등 지원)

### 주요 플레이어
| 제품 | 특징 |
|------|------|
| **Kong MCP Registry** (2026.02) | Kong Konnect의 일부. API 관리 정책 제어 상속 |
| **MintMCP Gateway** | MCP 전용. 원클릭 배포, OAuth/SSO, SOC 2 Type II 인증 |
| **ContextForge** | 오픈소스. IBM 기여. 다중 서비스 연합 인터페이스 |
| **Composio** ★ | 3,000+ 클라우드 앱 연결. 강화학습 기반 에이전트 학습. **$29M 펀딩** (Series A, Lightspeed) |
| **Strata MCP Gateway** | 엔터프라이즈 MCP 접근 제어 |

---

## 7. 노코드 / 로우코드 에이전트 빌더

### Lindy AI
- **핵심 특징:** 비기술팀을 위한 노코드 에이전트 빌더. 토글, 로직 블록, 비주얼 빌더
- **가격:** Free (40 tasks) + 저렴한 유료 플랜
- **트랙션:** 2025년 ARR **10x 성장** 궤도

### Relevance AI
- **핵심 특징:** 복잡한 프로세스를 위한 멀티에이전트 관리 플랫폼. 벡터 검색, 분석
- **가격:** ~$10,000/년~
- **상태:** GA

### Letta (구 MemGPT) ★ Rising
- **설립:** UC Berkeley 스핀아웃
- **핵심 특징:** 자기 편집 메모리를 가진 AI 에이전트. 사용자 상호작용에서 학습하며 자체 메모리 업데이트
- **펀딩:** $10M
- **상태:** 2024 스텔스 탈출

---

## 8. 한국 / 아시아 시장

### Wryton (뤼튼) ★ 주목
- **핵심 특징:** "AI 슈퍼앱" - AI 검색부터 워크플로 자동화까지 다양한 에이전트 솔루션. 사용자 선호도/스케줄 기억 기반 개인화
- **트랙션:** **월 600만 MAU**, **830억원 Series B**. AIIA "2025 Emerging AI+X Top 100" 선정
- **상태:** 한국 시장 주요 플레이어, 급성장

### Carat (캐럿)
- **핵심 특징:** 영상/이미지 생성 AI 에이전트 플랫폼
- **트랙션:** 260만 등록 사용자

### 한국 시장 컨텍스트
- 2025년 한국 AI 스타트업 중 **21%가 AI 에이전트 관련**
- 국내 시장 **1조원 규모**로 빠르게 확대 중

---

## 종합 비교 매트릭스

| 카테고리 | 주요 플레이어 | 성숙도 | 가격대 |
|---------|-------------|--------|--------|
| 오픈소스 프레임워크 | CrewAI, LangGraph, AutoGen/AG2, OpenAI Agents SDK, Google ADK | GA | 무료 + API 비용 |
| 엔터프라이즈 에이전트 플랫폼 | Salesforce Agentforce, MS Copilot Studio, Kore.ai, Airia | GA | $125-$650/user/월 또는 커스텀 |
| 하이퍼스케일러 | AWS Bedrock AgentCore, Google Vertex AI, Azure AI Foundry | GA | 종량제 |
| 에이전트 옵저버빌리티 | AgentOps, LangSmith, Langfuse, Arize | GA | 무료~$100K/년 |
| 에이전트 거버넌스 | Credo AI, Airia, Resistant AI, Runlayer | GA/신흥 | 엔터프라이즈 커스텀 |
| MCP 게이트웨이 | Kong, MintMCP, ContextForge, Composio | 신흥 (2025-2026) | 다양 |
| 노코드 빌더 | Lindy, Relevance AI, Beam AI | GA | 무료~$10K+/년 |
| 메모리/상태 관리 | Letta (MemGPT) | 초기 | 오픈소스 + 엔터프라이즈 |

---

## 핵심 인사이트: "에이전트 Fleet Management" 기회

현재 시장에서 아직 명확한 지배적 제품이 없는 영역:

> **벤더 중립적인 "에이전트 Fleet Management" 플랫폼**

필요한 기능 조합:
1. **에이전트 레지스트리/카탈로그** - 어떤 에이전트가 존재하고, 누가 소유하며, 무엇을 하는지
2. **스킬/플러그인 관리** - 각 에이전트가 어떤 도구에 접근 가능한지
3. **비용 귀속** - 에이전트별, 부서별 비용 추적
4. **사용량 분석** - 어떤 에이전트가 얼마나 자주, 누구에 의해 사용되는지
5. **접근 제어** - 누가 어떤 에이전트를 사용/수정할 수 있는지 RBAC
6. **라이프사이클 관리** - 버전 관리, 폐기, 퇴역

**현재 가장 가까운 제품:**
- **Microsoft Agent 365**: 레지스트리, 접근 제어, 시각화, 보안까지 가장 완성도 높음 (단, MS 생태계 종속)
- **Airia**: 보안/거버넌스 관점에서 접근 (벤더 중립적이지만 오케스트레이션에 초점)
- **독립적이고 벤더 중립적인 "에이전트 Fleet Management" SaaS는 아직 공백 상태** → 기회 영역

---

## 참고 소스

- [Deloitte - AI Agent Orchestration Predictions 2026](https://www.deloitte.com/us/en/insights/industry/technology/technology-media-and-telecom-predictions/2026/ai-agent-orchestration.html)
- [Microsoft Agent 365: The Control Plane for AI Agents](https://www.microsoft.com/en-us/microsoft-365/blog/2025/11/18/microsoft-agent-365-the-control-plane-for-ai-agents/)
- [Airia Enterprise AI Platform ($100M Funding)](https://airia.com/airia-secures-100m-in-funding/)
- [CrewAI Platform](https://www.crewai.com/)
- [AWS Bedrock AgentCore GA](https://aws.amazon.com/about-aws/whats-new/2025/10/amazon-bedrock-agentcore-available/)
- [Composio $29M Funding](https://composio.dev/blog/series-a)
- [Anthropic MCP & Agentic AI Foundation](https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation)
- [MCP Registry & Gateway Comparison 2026](https://www.paperclipped.de/en/blog/mcp-registry-gateway-enterprise-ai-agents/)
- [Korean AI Agent Startups Top 10](https://carat.im/blog/korea-ai-agent-startups-top-10)
- [Redis - Top AI Agent Orchestration Platforms 2026](https://redis.io/blog/ai-agent-orchestration-platforms/)
