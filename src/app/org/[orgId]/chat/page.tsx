"use client";

import { Suspense } from "react";
import { useOrgId } from "@/hooks/useOrgId";
import { useSearchParams } from "next/navigation";
import { ChatPage } from "@/components/chat/ChatPage";

function ChatRouteInner() {
  const orgId = useOrgId();
  const searchParams = useSearchParams();
  const initialAgentId = searchParams.get("agent") ?? undefined;
  return (
    <div className="h-[calc(100vh-5.5rem)]">
      <ChatPage orgId={orgId} initialAgentId={initialAgentId} />
    </div>
  );
}

export default function ChatRoute() {
  return (
    <Suspense>
      <ChatRouteInner />
    </Suspense>
  );
}
