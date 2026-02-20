"use client";

import { useState } from "react";
import { cn, getVendorLabel } from "@/lib/utils";
import type { Vendor } from "@/types";

interface AgentItem {
  id: string;
  name: string;
  vendor: Vendor;
  model: string;
  status: string;
}

interface NewChatModalProps {
  agents: AgentItem[];
  onClose: () => void;
  onCreate: (agentIds: string[], title?: string) => void;
}

const vendorBadgeClass: Record<string, string> = {
  anthropic: "bg-orange-500/20 text-orange-400",
  openai: "bg-green-500/20 text-green-400",
  google: "bg-blue-500/20 text-blue-400",
};

const statusDotClass: Record<string, string> = {
  active: "bg-green-400",
  idle: "bg-yellow-400",
  error: "bg-red-400",
};

export function NewChatModal({ agents, onClose, onCreate }: NewChatModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [title, setTitle] = useState("");

  const toggleAgent = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreate = () => {
    if (selectedIds.size === 0) return;
    onCreate(Array.from(selectedIds), title.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-700 px-5 py-4">
          <h2 className="text-base font-semibold text-white">New Conversation</h2>
          <p className="mt-0.5 text-xs text-slate-400">Select one or more agents to chat with</p>
        </div>

        <div className="px-5 py-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Conversation title (optional)"
            className="mb-4 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />

          <div className="max-h-64 overflow-y-auto">
            <div className="flex flex-col gap-1">
              {agents.map((agent) => {
                const selected = selectedIds.has(agent.id);
                return (
                  <button
                    key={agent.id}
                    onClick={() => toggleAgent(agent.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                      selected
                        ? "bg-blue-600/20 ring-1 ring-blue-500"
                        : "hover:bg-slate-700/50"
                    )}
                  >
                    <div className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                      selected
                        ? "border-blue-500 bg-blue-600"
                        : "border-slate-600 bg-slate-900"
                    )}>
                      {selected && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span className={cn("h-2 w-2 shrink-0 rounded-full", statusDotClass[agent.status] ?? "bg-slate-500")} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-200">{agent.name}</p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", vendorBadgeClass[agent.vendor] ?? "bg-slate-600 text-slate-300")}>
                          {getVendorLabel(agent.vendor)}
                        </span>
                        <span className="truncate text-[10px] text-slate-500">{agent.model}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-700 px-5 py-3">
          <span className="text-xs text-slate-400">
            {selectedIds.size} agent{selectedIds.size !== 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-slate-400 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={selectedIds.size === 0}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-40"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
