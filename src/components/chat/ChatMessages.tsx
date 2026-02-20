"use client";

import { useEffect, useRef } from "react";
import { cn, getVendorLabel } from "@/lib/utils";
import type { Message, Vendor } from "@/types";
import { MessageBubble } from "./MessageBubble";

interface StreamingAgent {
  agentId: string;
  agentName: string;
  agentVendor?: string;
  text: string;
}

interface ChatMessagesProps {
  messages: Message[];
  streamingText?: string;
  streamingAgent?: StreamingAgent | null;
}

const vendorBadgeClass: Record<string, string> = {
  anthropic: "bg-orange-500/20 text-orange-400",
  openai: "bg-green-500/20 text-green-400",
  google: "bg-blue-500/20 text-blue-400",
};

export function ChatMessages({ messages, streamingText, streamingAgent }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText, streamingAgent]);

  if (messages.length === 0 && !streamingText && !streamingAgent) {
    return (
      <div className="flex flex-1 items-center justify-center text-slate-500">
        <p className="text-sm">Send a message to start the conversation</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {streamingAgent && streamingAgent.text && (
          <div className="flex justify-start">
            <div className="max-w-[70%] rounded-2xl bg-slate-700 px-4 py-2.5 text-slate-100">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-200">{streamingAgent.agentName}</span>
                {streamingAgent.agentVendor && (
                  <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-medium", vendorBadgeClass[streamingAgent.agentVendor] ?? "bg-slate-600 text-slate-300")}>
                    {getVendorLabel(streamingAgent.agentVendor as Vendor)}
                  </span>
                )}
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{streamingAgent.text}</p>
              <span className="inline-block h-4 w-1 animate-pulse bg-slate-400" />
            </div>
          </div>
        )}
        {/* Fallback for single-agent streaming (backward compat) */}
        {!streamingAgent && streamingText && (
          <div className="flex justify-start">
            <div className="max-w-[70%] rounded-2xl bg-slate-700 px-4 py-2.5 text-slate-100">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{streamingText}</p>
              <span className="inline-block h-4 w-1 animate-pulse bg-slate-400" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
