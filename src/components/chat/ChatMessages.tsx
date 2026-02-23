"use client";

import { useEffect, useRef } from "react";
import { cn, getVendorLabel } from "@/lib/utils";
import type { Message, Vendor } from "@/types";

const vendorBadgeClass: Record<string, string> = {
  anthropic: "bg-orange-500/20 text-orange-300",
  openai: "bg-emerald-500/20 text-emerald-300",
  google: "bg-blue-500/20 text-blue-300",
};
import { MessageBubble, AgentSpriteAvatar } from "./MessageBubble";

interface StreamingAgent {
  agentId: string;
  agentName: string;
  agentVendor?: string;
  runtimeType?: string;
  text: string;
}

interface WaitingForAgent {
  agentId: string;
  agentName: string;
}

interface Participant {
  agentId: string;
  agentName?: string;
  agentVendor?: string;
}

interface ChatMessagesProps {
  messages: Message[];
  streamingText?: string;
  streamingAgent?: StreamingAgent | null;
  waitingForAgent?: WaitingForAgent | null;
  participants?: Participant[];
}

function BouncingDots({ color = "bg-slate-400" }: { color?: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn("h-1.5 w-1.5 rounded-full animate-bounce", color)}
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.9s" }}
        />
      ))}
    </span>
  );
}


export function ChatMessages({ messages, streamingText, streamingAgent, waitingForAgent, participants }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText, streamingAgent, waitingForAgent]);

  if (messages.length === 0 && !streamingText && !streamingAgent) {
    const firstAgent = participants?.[0];
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-slate-500">
        {firstAgent?.agentName ? (
          <>
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-2xl bg-slate-700/40 p-3 ring-1 ring-slate-600/30">
                <AgentSpriteAvatar name={firstAgent.agentName} />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-slate-200">{firstAgent.agentName}</p>
                {participants && participants.length > 1 && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    and {participants.length - 1} other{participants.length > 2 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
            <p className="text-sm text-slate-400">Type a message below to start chatting</p>
          </>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-700/50 ring-1 ring-slate-600/40">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-400">Send a message to start the conversation</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Thinking indicator — cloud agent analyzing */}
        {streamingAgent && !streamingAgent.text && streamingAgent.runtimeType === "cloud" && (
          <div className="flex justify-start gap-2.5">
            <AgentSpriteAvatar name={streamingAgent.agentName} />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 px-1">
                <span className="text-xs font-semibold text-slate-200">{streamingAgent.agentName}</span>
                {streamingAgent.agentVendor && (
                  <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide", vendorBadgeClass[streamingAgent.agentVendor] ?? "bg-slate-600/40 text-slate-300")}>
                    {getVendorLabel(streamingAgent.agentVendor as Vendor)}
                  </span>
                )}
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-slate-700/70 px-4 py-3 ring-1 ring-slate-600/30">
                <div className="flex items-center gap-2.5">
                  <BouncingDots color="bg-purple-400" />
                  <span className="text-xs text-slate-400">Analyzing repository...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active streaming text */}
        {streamingAgent && streamingAgent.text && (
          <div className="flex justify-start gap-2.5">
            <AgentSpriteAvatar name={streamingAgent.agentName} />
            <div className="flex max-w-[75%] flex-col gap-1">
              <div className="flex items-center gap-2 px-1">
                <span className="text-xs font-semibold text-slate-200">{streamingAgent.agentName}</span>
                {streamingAgent.agentVendor && (
                  <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide", vendorBadgeClass[streamingAgent.agentVendor] ?? "bg-slate-600/40 text-slate-300")}>
                    {getVendorLabel(streamingAgent.agentVendor as Vendor)}
                  </span>
                )}
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-slate-700/70 px-4 py-2.5 text-slate-100 ring-1 ring-slate-600/30">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{streamingAgent.text}</p>
                <span className="mt-1 inline-block h-3.5 w-0.5 animate-pulse rounded-full bg-blue-400" />
              </div>
            </div>
          </div>
        )}

        {/* Waiting for async agent (polling relay) */}
        {waitingForAgent && !streamingAgent && (
          <div className="flex justify-start gap-2.5">
            <AgentSpriteAvatar name={waitingForAgent.agentName} />
            <div className="flex flex-col gap-1">
              <span className="px-1 text-xs font-semibold text-slate-200">{waitingForAgent.agentName}</span>
              <div className="rounded-2xl rounded-tl-sm bg-slate-700/70 px-4 py-3 ring-1 ring-slate-600/30">
                <div className="flex items-center gap-2.5">
                  <BouncingDots color="bg-yellow-400" />
                  <span className="text-xs text-slate-400">Waiting for response...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fallback single-agent streaming */}
        {!streamingAgent && streamingText && (
          <div className="flex justify-start gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-600/40 ring-1 ring-slate-500/30 text-[11px] font-bold text-slate-300">
              A
            </div>
            <div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-slate-700/70 px-4 py-2.5 text-slate-100 ring-1 ring-slate-600/30">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{streamingText}</p>
              <span className="mt-1 inline-block h-3.5 w-0.5 animate-pulse rounded-full bg-blue-400" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
