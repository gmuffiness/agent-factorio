export type Vendor = "anthropic" | "openai" | "google";
export type AgentStatus = "active" | "idle" | "error";
export type ResourceType = "git_repo" | "database" | "storage";
export type AccessLevel = "read" | "write" | "admin";
export type SkillCategory = "generation" | "review" | "testing" | "documentation" | "debugging" | "deployment";

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  icon: string;
  description: string;
}

export interface Plugin {
  id: string;
  name: string;
  icon: string;
  description: string;
  version: string;
  enabled: boolean;
}

export interface McpTool {
  id: string;
  name: string;
  server: string;
  icon: string;
  description: string;
  category: "filesystem" | "database" | "api" | "browser" | "communication" | "devtools";
}

export interface AgentResource {
  id: string;
  type: ResourceType;
  name: string;
  icon: string;
  description: string;
  url: string;
  accessLevel: AccessLevel;
  createdAt: string;
}

export interface DailyUsage {
  date: string;
  tokens: number;
  cost: number;
  requests: number;
}

export interface MonthlyCost {
  month: string;
  amount: number;
  byVendor: Record<Vendor, number>;
}

export interface Human {
  id: string;
  orgId: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  vendor: Vendor;
  model: string;
  status: AgentStatus;
  monthlyCost: number;
  tokensUsed: number;
  position: { x: number; y: number };
  skills: Skill[];
  plugins: Plugin[];
  mcpTools: McpTool[];
  resources: AgentResource[];
  usageHistory: DailyUsage[];
  lastActive: string;
  createdAt: string;
  humanId: string | null;
  human?: Human | null;
  registeredBy: string | null;
  registeredByMember?: OrgMember | null;
  context?: AgentContext[];
}

export interface Department {
  id: string;
  name: string;
  description: string;
  parentId: string | null;
  budget: number;
  monthlySpend: number;
  layout: { x: number; y: number; width: number; height: number };
  primaryVendor: Vendor;
  agents: Agent[];
  costHistory: MonthlyCost[];
}

export interface Organization {
  id: string;
  name: string;
  totalBudget: number;
  inviteCode?: string;
  createdBy?: string;
  departments: Department[];
}

export interface AgentContext {
  id: string;
  agentId: string;
  type: "claude_md" | "readme" | "custom";
  content: string;
  sourceFile: string | null;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  orgId: string;
  agentId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export type AnnouncementTargetType = "all" | "department" | "agent";
export type AnnouncementPriority = "normal" | "urgent";

export interface Announcement {
  id: string;
  orgId: string;
  title: string;
  content: string;
  targetType: AnnouncementTargetType;
  targetId: string | null;
  priority: AnnouncementPriority;
  createdBy: string | null;
  createdAt: string;
  expiresAt: string | null;
  ackCount?: number;
  targetCount?: number;
}

export type OrgMemberRole = "admin" | "member";
export type OrgMemberStatus = "active" | "pending";

export interface OrgMember {
  id: string;
  orgId: string;
  name: string;
  email: string | null;
  role: OrgMemberRole;
  status: OrgMemberStatus;
  joinedAt: string;
}
