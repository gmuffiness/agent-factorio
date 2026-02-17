"use client";

import React from "react";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitAll: () => void;
}

export default function MapControls({ onZoomIn, onZoomOut, onFitAll }: MapControlsProps) {
  const buttonClass =
    "w-9 h-9 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur border border-gray-200 text-gray-700 hover:bg-white hover:text-gray-900 transition-colors text-lg font-semibold shadow-sm cursor-pointer";

  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-10">
      <button className={buttonClass} onClick={onZoomIn} title="Zoom in">
        +
      </button>
      <button className={buttonClass} onClick={onZoomOut} title="Zoom out">
        &minus;
      </button>
      <button
        className={buttonClass + " text-sm"}
        onClick={onFitAll}
        title="Fit all"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="2" width="12" height="12" rx="1.5" />
          <path d="M2 6h12M6 2v12" />
        </svg>
      </button>
    </div>
  );
}
