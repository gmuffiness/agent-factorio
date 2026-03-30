"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAppStore } from "@/stores/app-store";

const MIN_RECONNECT_DELAY = 1_000;
const MAX_RECONNECT_DELAY = 30_000;

export function useActivityStream(orgId: string | null) {
  const setAgentActivity = useAppStore((s) => s.setAgentActivity);
  const clearAgentActivity = useAppStore((s) => s.clearAgentActivity);
  const esRef = useRef<EventSource | null>(null);
  const reconnectDelayRef = useRef(MIN_RECONNECT_DELAY);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmountedRef = useRef(false);

  const connect = useCallback(() => {
    if (!orgId || unmountedRef.current) return;

    const es = new EventSource(`/api/organizations/${orgId}/activity-stream`);
    esRef.current = es;

    es.addEventListener("activity", (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data) as {
          agentId: string;
          sessionId: string;
          eventType: string;
          toolName?: string;
          taskDescription?: string;
          timestamp: string;
        };

        if (data.eventType === "session_end") {
          clearAgentActivity(data.agentId);
        } else {
          setAgentActivity(data.agentId, {
            sessionId: data.sessionId,
            currentActivity: data.taskDescription ?? data.toolName ?? data.eventType,
            toolName: data.toolName ?? null,
            eventType: data.eventType,
            updatedAt: data.timestamp,
          });
        }

        // Reset backoff on successful message
        reconnectDelayRef.current = MIN_RECONNECT_DELAY;
      } catch {
        console.warn("[useActivityStream] Failed to parse activity event");
      }
    });

    es.addEventListener("ping", () => {
      // Heartbeat — keep-alive, no action needed
      reconnectDelayRef.current = MIN_RECONNECT_DELAY;
    });

    es.onerror = () => {
      es.close();
      esRef.current = null;
      if (unmountedRef.current) return;

      const delay = reconnectDelayRef.current;
      reconnectDelayRef.current = Math.min(delay * 2, MAX_RECONNECT_DELAY);

      reconnectTimerRef.current = setTimeout(() => {
        if (!unmountedRef.current) connect();
      }, delay);
    };
  }, [orgId, setAgentActivity, clearAgentActivity]);

  useEffect(() => {
    unmountedRef.current = false;
    connect();

    return () => {
      unmountedRef.current = true;
      esRef.current?.close();
      esRef.current = null;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };
  }, [connect]);
}
