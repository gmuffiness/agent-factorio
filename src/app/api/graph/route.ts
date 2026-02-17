import { NextResponse } from "next/server";
import type { Organization, Department, Agent } from "@/types";
import { mockOrganization } from "@/data/mock-data";

interface GraphNode {
  id: string;
  type: "department" | "agent" | "skill" | "mcp_tool" | "plugin";
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  data: { relationship: string };
}

function buildGraph(org: Organization) {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const skillMap = new Map<string, { node: GraphNode; agentIds: string[] }>();
  const mcpMap = new Map<string, { node: GraphNode; agentIds: string[] }>();
  const pluginMap = new Map<string, { node: GraphNode; agentIds: string[] }>();

  const deptSpacing = 320;
  const deptY = 40;

  org.departments.forEach((dept: Department, deptIdx: number) => {
    const deptX = 100 + deptIdx * deptSpacing;

    // Department node
    nodes.push({
      id: `dept-${dept.id}`,
      type: "department",
      position: { x: deptX, y: deptY },
      data: {
        name: dept.name,
        agentCount: dept.agents.length,
        budget: dept.budget,
        monthlySpend: dept.monthlySpend,
        vendor: dept.primaryVendor,
      },
    });

    // Agent nodes
    dept.agents.forEach((agent: Agent, agentIdx: number) => {
      const agentX = deptX - 40 + (agentIdx % 2) * 160;
      const agentY = deptY + 160 + Math.floor(agentIdx / 2) * 140;

      nodes.push({
        id: `agent-${agent.id}`,
        type: "agent",
        position: { x: agentX, y: agentY },
        data: {
          name: agent.name,
          vendor: agent.vendor,
          model: agent.model,
          status: agent.status,
          monthlyCost: agent.monthlyCost,
          agentId: agent.id,
        },
      });

      // Agent → Department edge
      edges.push({
        id: `e-agent-${agent.id}-dept-${dept.id}`,
        source: `agent-${agent.id}`,
        target: `dept-${dept.id}`,
        type: "default",
        data: { relationship: "belongs-to" },
      });

      // Skills
      for (const skill of agent.skills) {
        const key = skill.id;
        if (!skillMap.has(key)) {
          skillMap.set(key, {
            node: {
              id: `skill-${skill.id}`,
              type: "skill",
              position: { x: 0, y: 0 }, // positioned later
              data: {
                name: skill.name,
                icon: skill.icon,
                category: skill.category,
              },
            },
            agentIds: [],
          });
        }
        skillMap.get(key)!.agentIds.push(agent.id);
      }

      // MCP Tools
      for (const tool of agent.mcpTools) {
        const key = tool.id;
        if (!mcpMap.has(key)) {
          mcpMap.set(key, {
            node: {
              id: `mcp-${tool.id}`,
              type: "mcp_tool",
              position: { x: 0, y: 0 },
              data: {
                name: tool.name,
                icon: tool.icon,
                category: tool.category,
                server: tool.server,
              },
            },
            agentIds: [],
          });
        }
        mcpMap.get(key)!.agentIds.push(agent.id);
      }

      // Plugins
      for (const plugin of agent.plugins) {
        const key = plugin.id;
        if (!pluginMap.has(key)) {
          pluginMap.set(key, {
            node: {
              id: `plugin-${plugin.id}`,
              type: "plugin",
              position: { x: 0, y: 0 },
              data: {
                name: plugin.name,
                icon: plugin.icon,
                version: plugin.version,
              },
            },
            agentIds: [],
          });
        }
        pluginMap.get(key)!.agentIds.push(agent.id);
      }
    });
  });

  // Position shared entity nodes below agents
  const maxAgentY = Math.max(
    ...nodes.filter((n) => n.type === "agent").map((n) => n.position.y),
    400,
  );
  const entityBaseY = maxAgentY + 180;

  let entityIdx = 0;
  const entitySpacing = 180;
  const entityCols = Math.max(6, org.departments.length * 2);

  function placeEntity(entry: { node: GraphNode; agentIds: string[] }) {
    const col = entityIdx % entityCols;
    const row = Math.floor(entityIdx / entityCols);
    entry.node.position = {
      x: 60 + col * entitySpacing,
      y: entityBaseY + row * 100,
    };
    nodes.push(entry.node);
    entityIdx++;
  }

  // Place skills and create edges
  for (const [, entry] of skillMap) {
    placeEntity(entry);
    for (const agentId of entry.agentIds) {
      edges.push({
        id: `e-agent-${agentId}-${entry.node.id}`,
        source: `agent-${agentId}`,
        target: entry.node.id,
        type: "default",
        data: { relationship: "has-skill" },
      });
    }
  }

  // Place MCP tools and create edges
  for (const [, entry] of mcpMap) {
    placeEntity(entry);
    for (const agentId of entry.agentIds) {
      edges.push({
        id: `e-agent-${agentId}-${entry.node.id}`,
        source: `agent-${agentId}`,
        target: entry.node.id,
        type: "default",
        data: { relationship: "uses-tool" },
      });
    }
  }

  // Place plugins and create edges
  for (const [, entry] of pluginMap) {
    placeEntity(entry);
    for (const agentId of entry.agentIds) {
      edges.push({
        id: `e-agent-${agentId}-${entry.node.id}`,
        source: `agent-${agentId}`,
        target: entry.node.id,
        type: "default",
        data: { relationship: "uses-plugin" },
      });
    }
  }

  return { nodes, edges };
}

export async function GET() {
  const org = mockOrganization;
  const graph = buildGraph(org);
  return NextResponse.json(graph);
}
