"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useAppStore } from "@/stores/app-store";

const SpatialCanvas = dynamic(
  () => import("@/components/spatial/SpatialCanvas"),
  { ssr: false },
);

export default function Home() {
  const fetchOrganization = useAppStore((s) => s.fetchOrganization);

  useEffect(() => {
    fetchOrganization();
  }, [fetchOrganization]);

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 56px - 40px)" }}>
      <div className="flex-1 relative overflow-hidden">
        <SpatialCanvas />
      </div>
    </div>
  );
}
