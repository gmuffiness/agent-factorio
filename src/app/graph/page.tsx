"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useAppStore } from "@/stores/app-store";

const GraphPage = dynamic(
  () => import("@/components/graph/GraphPage").then((m) => ({ default: m.GraphPage })),
  { ssr: false },
);

export default function Graph() {
  const fetchOrganization = useAppStore((s) => s.fetchOrganization);

  useEffect(() => {
    fetchOrganization();
  }, [fetchOrganization]);

  return <GraphPage />;
}
