import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

type EntityNodeData = {
  name: string;
  icon: string;
  category?: string;
  version?: string;
  server?: string;
};

const categoryColors: Record<string, string> = {
  // Skill categories
  generation: "#8B5CF6",
  review: "#3B82F6",
  testing: "#22C55E",
  documentation: "#F59E0B",
  debugging: "#EF4444",
  deployment: "#06B6D4",
  // MCP tool categories
  filesystem: "#64748B",
  database: "#8B5CF6",
  api: "#3B82F6",
  browser: "#F97316",
  communication: "#EC4899",
  devtools: "#22C55E",
};

function EntityNodeComponent({ data, type }: NodeProps) {
  const { name, icon, category } = data as unknown as EntityNodeData;
  const color = category ? categoryColors[category] ?? "#94A3B8" : "#94A3B8";

  const typeLabel =
    type === "skill" ? "Skill" : type === "mcp_tool" ? "MCP" : "Plugin";

  return (
    <>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div
        className="rounded-full px-3 py-1.5 shadow-sm border flex items-center gap-1.5 bg-white min-w-0"
        style={{ borderColor: color + "60" }}
      >
        <span className="text-sm shrink-0">{icon}</span>
        <span className="text-xs font-medium text-slate-700 truncate max-w-[100px]">
          {name}
        </span>
        <span
          className="text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0"
          style={{ backgroundColor: color + "20", color }}
        >
          {typeLabel}
        </span>
      </div>
    </>
  );
}

export const SkillNode = memo(EntityNodeComponent);
export const McpToolNode = memo(EntityNodeComponent);
export const PluginNode = memo(EntityNodeComponent);
