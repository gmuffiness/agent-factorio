"use client";

import { cn, getVendorLabel } from "@/lib/utils";
import type { Message, Vendor } from "@/types";

interface MessageBubbleProps {
  message: Message;
}

const vendorBadgeClass: Record<string, string> = {
  anthropic: "bg-orange-500/20 text-orange-400",
  openai: "bg-green-500/20 text-green-400",
  google: "bg-blue-500/20 text-blue-400",
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const time = new Date(message.createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-slate-700 text-slate-100"
        }`}
      >
        {!isUser && message.agentName && (
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-200">{message.agentName}</span>
            {message.agentVendor && (
              <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-medium", vendorBadgeClass[message.agentVendor] ?? "bg-slate-600 text-slate-300")}>
                {getVendorLabel(message.agentVendor as Vendor)}
              </span>
            )}
          </div>
        )}
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
        <p
          className={`mt-1 text-[10px] ${
            isUser ? "text-blue-200" : "text-slate-400"
          }`}
        >
          {time}
        </p>
      </div>
    </div>
  );
}
