"use client";

import { useRef, useEffect } from "react";
import { cn, getVendorLabel } from "@/lib/utils";
import type { Message, Vendor } from "@/types";

const vendorBadgeClass: Record<string, string> = {
  anthropic: "bg-orange-500/20 text-orange-300",
  openai: "bg-emerald-500/20 text-emerald-300",
  google: "bg-blue-500/20 text-blue-300",
};

interface MessageBubbleProps {
  message: Message;
}

function renderMarkdownLike(text: string) {
  // Simple inline markdown: **bold**, `code`, newlines
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="rounded bg-slate-600/60 px-1 py-0.5 font-mono text-[12px] text-slate-200">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

/** Sprite sheet constants — must match spatial/AgentAvatar.ts */
const SPRITE_SIZE = 32;
const CHARS_PER_ROW = 4;
const FRAMES_PER_CHAR = 3;
const TOTAL_ROWS = 21;
const CHARACTER_POOL = Array.from({ length: TOTAL_ROWS - 1 }, (_, i) => (i + 1) * CHARS_PER_ROW);

function nameHash(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function AgentSpriteAvatar({ name }: { name: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = "/assets/characters.png";
    img.onload = () => {
      const hash = nameHash(name);
      const charIndex = CHARACTER_POOL[hash % CHARACTER_POOL.length];
      const charCol = charIndex % CHARS_PER_ROW;
      const charRow = Math.floor(charIndex / CHARS_PER_ROW);
      const srcX = charCol * FRAMES_PER_CHAR * SPRITE_SIZE;
      const srcY = charRow * SPRITE_SIZE;

      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, srcX, srcY, SPRITE_SIZE, SPRITE_SIZE, 0, 0, canvas.width, canvas.height);
    };
  }, [name]);

  return (
    <canvas
      ref={canvasRef}
      width={32}
      height={32}
      className="h-8 w-8 shrink-0 rounded-full"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const time = new Date(message.createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isUser) {
    return (
      <div className="flex justify-end gap-2.5">
        <div className="flex max-w-[75%] flex-col items-end gap-1">
          <div className="rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-2.5 text-white shadow-sm">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
          </div>
          <span className="px-1 text-[10px] text-slate-500">{time}</span>
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-600/40 ring-1 ring-slate-500/30 text-[11px] font-bold text-slate-300">
          G
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start gap-2.5">
      <AgentSpriteAvatar name={message.agentName ?? "Agent"} />
      <div className="flex max-w-[75%] flex-col gap-1">
        {message.agentName && (
          <div className="flex items-center gap-2 px-1">
            <span className="text-xs font-semibold text-slate-200">{message.agentName}</span>
            {message.agentVendor && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
                  vendorBadgeClass[message.agentVendor] ?? "bg-slate-600/40 text-slate-300"
                )}
              >
                {getVendorLabel(message.agentVendor as Vendor)}
              </span>
            )}
          </div>
        )}
        <div className="rounded-2xl rounded-tl-sm bg-slate-700/70 px-4 py-2.5 text-slate-100 shadow-sm ring-1 ring-slate-600/30">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {renderMarkdownLike(message.content)}
          </p>
        </div>
        <span className="px-1 text-[10px] text-slate-500">{time}</span>
      </div>
    </div>
  );
}
