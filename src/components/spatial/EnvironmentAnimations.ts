import { Container, Graphics } from "pixi.js";
import type { PondLocation } from "./TilesetGenerator";
import type { MapThemePalette } from "./MapThemes";

/**
 * Animated environment decorations for the spatial canvas.
 * All objects are purely visual — no collision or interaction.
 */

export interface AnimatedDecoration {
  container: Container;
  update(elapsed: number): void;
}

// ─── Campfire ───────────────────────────────────────────────────────────────

export function createCampfire(x: number, y: number, palette: MapThemePalette): AnimatedDecoration {
  const container = new Container();
  container.x = x;
  container.y = y;

  // Log base (static)
  const logs = new Graphics();
  // Log 1 (diagonal left)
  logs.rect(-6, 4, 12, 3);
  logs.fill(palette.campfireLogs[0]);
  // Log 2 (diagonal right)
  logs.rect(-4, 6, 10, 3);
  logs.fill(palette.campfireLogs[1]);
  // Cross log
  logs.rect(-2, 2, 4, 2);
  logs.fill(palette.campfireLogs[2]);
  container.addChild(logs);

  // Flame particles (3 layers)
  const flames: Graphics[] = [];
  for (let i = 0; i < 3; i++) {
    const flame = new Graphics();
    container.addChild(flame);
    flames.push(flame);
  }

  // Glow circle (ambient light)
  const glow = new Graphics();
  glow.circle(0, 0, 20);
  glow.fill({ color: palette.campfireGlow, alpha: 0.08 });
  container.addChildAt(glow, 0);

  // Ember particles
  const embers: { g: Graphics; baseX: number; phase: number }[] = [];
  for (let i = 0; i < 4; i++) {
    const ember = new Graphics();
    container.addChild(ember);
    embers.push({
      g: ember,
      baseX: (i - 1.5) * 3,
      phase: i * 1.5,
    });
  }

  return {
    container,
    update(elapsed: number) {
      // Animate flames
      for (let i = 0; i < flames.length; i++) {
        const flame = flames[i];
        flame.clear();

        const phaseOffset = i * 2.1;
        const flicker = Math.sin(elapsed * 4 + phaseOffset) * 0.3 + 0.7;
        const sway = Math.sin(elapsed * 3 + phaseOffset) * 2;

        // Flame ellipse
        const colors = palette.campfireFlames;
        const sizes = [5, 4, 3];
        const heights = [8, 6, 4];

        flame.ellipse(sway + (i - 1) * 2, -heights[i] * flicker, sizes[i], heights[i] * flicker);
        flame.fill({ color: colors[i], alpha: 0.7 + flicker * 0.3 });
      }

      // Animate glow
      glow.alpha = 0.05 + Math.sin(elapsed * 3) * 0.04;

      // Animate embers
      for (const ember of embers) {
        ember.g.clear();
        const t = (elapsed * 0.8 + ember.phase) % 3;
        if (t < 2) {
          const emberY = -8 - t * 10;
          const emberX = ember.baseX + Math.sin(elapsed * 2 + ember.phase) * 3;
          const alpha = Math.max(0, 1 - t / 2);
          ember.g.rect(Math.round(emberX), Math.round(emberY), 2, 2);
          ember.g.fill({ color: palette.campfireEmber, alpha: alpha * 0.8 });
        }
      }
    },
  };
}

// ─── Street Lamp Glow ───────────────────────────────────────────────────────

export function createStreetLampGlow(x: number, y: number, palette: MapThemePalette): AnimatedDecoration {
  const container = new Container();
  container.x = x;
  container.y = y;

  // Lamp post (static)
  const post = new Graphics();
  post.rect(-1, -4, 2, 20);
  post.fill(palette.lampPost);
  // Horizontal arm
  post.rect(-4, -6, 8, 2);
  post.fill(palette.lampPost);
  // Lamp head
  post.rect(-3, -8, 6, 2);
  post.fill(palette.lampLight);
  container.addChild(post);

  // Glow circle (animated)
  const glow = new Graphics();
  glow.circle(0, -7, 18);
  glow.fill({ color: palette.lampLight, alpha: 0.06 });
  container.addChildAt(glow, 0);

  // Inner glow
  const innerGlow = new Graphics();
  innerGlow.circle(0, -7, 8);
  innerGlow.fill({ color: palette.lampLight, alpha: 0.1 });
  container.addChild(innerGlow);

  return {
    container,
    update(elapsed: number) {
      // Subtle flicker — much more static than campfire
      const flicker = 0.04 + Math.sin(elapsed * 1.2) * 0.02 + Math.sin(elapsed * 3.7) * 0.01;
      glow.alpha = flicker;
      innerGlow.alpha = 0.08 + Math.sin(elapsed * 2.1) * 0.03;
    },
  };
}

// ─── Water Sparkle ──────────────────────────────────────────────────────────

export function createWaterSparkles(pond: PondLocation, palette: MapThemePalette): AnimatedDecoration {
  const container = new Container();

  const TILE = 32;
  const sparkleCount = 4 + Math.floor(Math.random() * 3); // 4-6 sparkles
  const sparkles: { g: Graphics; x: number; y: number; phase: number; speed: number }[] = [];

  for (let i = 0; i < sparkleCount; i++) {
    const g = new Graphics();
    const sx = pond.x + TILE + Math.random() * (pond.cols - 2) * TILE;
    const sy = pond.y + TILE + Math.random() * (pond.rows - 2) * TILE;
    g.x = sx;
    g.y = sy;
    container.addChild(g);
    sparkles.push({
      g,
      x: sx,
      y: sy,
      phase: i * 1.3,
      speed: 1.5 + Math.random() * 1.5,
    });
  }

  return {
    container,
    update(elapsed: number) {
      for (const sparkle of sparkles) {
        sparkle.g.clear();
        const alpha = Math.max(0, Math.sin(elapsed * sparkle.speed + sparkle.phase)) * 0.8;
        if (alpha > 0.05) {
          // 2x2 white pixel sparkle
          const color = alpha > 0.5 ? palette.sparkleColors[0] : palette.sparkleColors[1];
          sparkle.g.rect(0, 0, 2, 2);
          sparkle.g.fill({ color, alpha });
        }
      }
    },
  };
}

// ─── Flag ───────────────────────────────────────────────────────────────────

export function createFlag(x: number, y: number, color: number): AnimatedDecoration {
  const container = new Container();
  container.x = x;
  container.y = y;

  // Pole (static)
  const pole = new Graphics();
  pole.rect(0, 0, 2, 18);
  pole.fill(0x6b4226);
  // Pole cap
  pole.rect(-1, -2, 4, 3);
  pole.fill(0xdaa520);
  container.addChild(pole);

  // Flag cloth (4 segments for wave animation)
  const SEGMENTS = 4;
  const SEG_W = 4;
  const FLAG_H = 8;
  const segments: Graphics[] = [];

  for (let i = 0; i < SEGMENTS; i++) {
    const seg = new Graphics();
    container.addChild(seg);
    segments.push(seg);
  }

  return {
    container,
    update(elapsed: number) {
      for (let i = 0; i < SEGMENTS; i++) {
        const seg = segments[i];
        seg.clear();

        const waveOffset = Math.sin(elapsed * 3 + i * 0.8) * (i + 1) * 0.5;
        const segX = 3 + i * SEG_W;
        const segY = -1 + waveOffset;

        seg.rect(Math.round(segX), Math.round(segY), SEG_W, FLAG_H);

        // Alternate slightly darker shade for depth
        const shade = i % 2 === 0 ? color : darkenColor(color, 0.85);
        seg.fill(shade);

        // Edge highlight on first segment
        if (i === 0) {
          seg.rect(Math.round(segX), Math.round(segY), 1, FLAG_H);
          seg.fill({ color: 0xffffff, alpha: 0.15 });
        }
      }
    },
  };
}

function darkenColor(color: number, factor: number): number {
  const r = Math.floor(((color >> 16) & 0xff) * factor);
  const g = Math.floor(((color >> 8) & 0xff) * factor);
  const b = Math.floor((color & 0xff) * factor);
  return (r << 16) | (g << 8) | b;
}

// ─── Factory ────────────────────────────────────────────────────────────────

/**
 * Create all animated decorations for the spatial canvas.
 * Call update() on each decoration in the game loop ticker.
 */
export function createEnvironmentAnimations(
  rooms: { x: number; y: number; w: number; h: number; vendorColor: number }[],
  ponds: PondLocation[],
  palette: MapThemePalette,
): AnimatedDecoration[] {
  const decorations: AnimatedDecoration[] = [];

  // Entrance decoration: campfire (nature) or street lamp glow (urban)
  for (const room of rooms) {
    const doorX = room.x + Math.floor(room.w / 2);
    const doorY = room.y + room.h;
    if (palette.decorationStyle === "urban") {
      // Place lamp well to the right of door — potted plants are at doorX±20
      decorations.push(createStreetLampGlow(doorX + 52, doorY + 10, palette));
    } else {
      decorations.push(createCampfire(doorX + 24, doorY + 8, palette));
    }
  }

  // Water sparkles on each pond
  for (const pond of ponds) {
    decorations.push(createWaterSparkles(pond, palette));
  }

  // Flag on each room's roof
  for (const room of rooms) {
    // Place flag on the right side of the roof
    decorations.push(createFlag(room.x + room.w - 12, room.y - 14, room.vendorColor));
  }

  return decorations;
}
