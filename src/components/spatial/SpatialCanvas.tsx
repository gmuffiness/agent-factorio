"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { Application, Container } from "pixi.js";
import { Viewport } from "pixi-viewport";
import { useAppStore } from "@/stores/app-store";
import { createDepartmentRoom } from "./DepartmentRoom";
import { createAgentAvatar } from "./AgentAvatar";
import MapControls from "./MapControls";

// Shared viewport ref for programmatic access
let sharedViewport: Viewport | null = null;
export function getViewport(): Viewport | null {
  return sharedViewport;
}

export default function SpatialCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const viewportRef = useRef<Viewport | null>(null);
  const organization = useAppStore((s) => s.organization);

  useEffect(() => {
    const div = containerRef.current;
    if (!div) return;

    let destroyed = false;
    const app = new Application();
    appRef.current = app;

    (async () => {
      await app.init({
        background: "#F9FAFB",
        width: div.clientWidth,
        height: div.clientHeight,
        antialias: true,
        autoDensity: true,
        resolution: window.devicePixelRatio || 1,
      });

      if (destroyed) {
        app.destroy(true);
        return;
      }

      div.appendChild(app.canvas as HTMLCanvasElement);

      // Create viewport
      const viewport = new Viewport({
        screenWidth: div.clientWidth,
        screenHeight: div.clientHeight,
        worldWidth: 1200,
        worldHeight: 600,
        events: app.renderer.events,
      });

      viewport
        .drag()
        .pinch()
        .wheel()
        .decelerate()
        .clampZoom({ minScale: 0.3, maxScale: 3 });

      app.stage.addChild(viewport as unknown as Container);
      viewportRef.current = viewport;
      sharedViewport = viewport;

      // Render departments and agents
      const avatarContainers: (Container & { _baseY: number; _agentStatus: string })[] = [];

      for (const dept of organization.departments) {
        const roomContainer = createDepartmentRoom(dept, (d) => {
          // Double-click: zoom to room
          const { x, y, width, height } = d.layout;
          viewport.animate({
            position: { x: x + width / 2, y: y + height / 2 },
            scale: 1.8,
            time: 400,
            ease: "easeInOutSine",
          });
        });
        viewport.addChild(roomContainer);

        for (const agent of dept.agents) {
          const avatar = createAgentAvatar(agent);
          viewport.addChild(avatar);
          avatarContainers.push(avatar as Container & { _baseY: number; _agentStatus: string });
        }
      }

      // Fit all rooms in view initially
      viewport.fit(true, 1200, 600);
      viewport.moveCenter(500, 280);

      // Animate active agents (floating) and error agents (pulsing)
      let elapsed = 0;
      app.ticker.add((ticker) => {
        elapsed += ticker.deltaTime / 60; // seconds
        for (const avatar of avatarContainers) {
          if (avatar._agentStatus === "active") {
            avatar.y = avatar._baseY + Math.sin(elapsed * 2.5 + avatar._baseY) * 3;
          } else if (avatar._agentStatus === "error") {
            // Pulse the error indicator
            const pulse = 0.85 + Math.sin(elapsed * 5) * 0.15;
            avatar.scale.set(pulse);
          }
        }
      });

      // Handle resize
      const onResize = () => {
        if (destroyed) return;
        app.renderer.resize(div.clientWidth, div.clientHeight);
        viewport.resize(div.clientWidth, div.clientHeight);
      };
      window.addEventListener("resize", onResize);

      // Store cleanup reference
      (app as Application & { _cleanup?: () => void })._cleanup = () => {
        window.removeEventListener("resize", onResize);
      };
    })();

    return () => {
      destroyed = true;
      sharedViewport = null;
      const currentApp = appRef.current;
      if (currentApp) {
        const cleanup = (currentApp as Application & { _cleanup?: () => void })._cleanup;
        if (cleanup) cleanup();
        try {
          // Remove canvas from DOM if it exists
          const canvas = currentApp.canvas as HTMLCanvasElement | undefined;
          if (canvas && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
          }
          currentApp.destroy(true, { children: true });
        } catch {
          // Pixi may throw if init hasn't completed yet - safe to ignore
        }
      }
      appRef.current = null;
      viewportRef.current = null;
    };
  }, [organization]);

  const handleZoomIn = useCallback(() => {
    const vp = viewportRef.current;
    if (vp) vp.zoom(-100, true);
  }, []);

  const handleZoomOut = useCallback(() => {
    const vp = viewportRef.current;
    if (vp) vp.zoom(100, true);
  }, []);

  const handleFitAll = useCallback(() => {
    const vp = viewportRef.current;
    if (vp) {
      vp.fit(true, 1200, 600);
      vp.moveCenter(500, 280);
    }
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitAll={handleFitAll}
      />
    </div>
  );
}
