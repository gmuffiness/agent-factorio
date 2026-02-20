import { Graphics, Container, Sprite, Texture, type Renderer } from "pixi.js";
import type { MapThemePalette } from "./MapThemes";

const TILE = 32;

/**
 * Runtime-generated tileset using Pixi Graphics API.
 * All coordinates are integers to ensure pixel-perfect rendering with NEAREST scaling.
 */

export interface Tileset {
  grass1: Texture;    // dark grass
  grass2: Texture;    // medium grass
  grass3: Texture;    // light grass with flower dots
  dirtCenter: Texture;
  dirtEdgeH: Texture; // horizontal edge (top/bottom)
  dirtEdgeV: Texture; // vertical edge (left/right)
  dirtCorner: Texture;
  water1: Texture;    // water frame 1
  water2: Texture;    // water frame 2
  waterEdge: Texture; // pond border
  stone: Texture;     // stone floor
  sand: Texture;      // sandy ground
}

function drawGrassTile(g: Graphics, color: number, addDetail: boolean, palette: MapThemePalette): void {
  g.rect(0, 0, TILE, TILE);
  g.fill(color);

  // Subtle grass blade marks
  const bladeColor = palette.grassBlade;
  g.rect(4, 8, 2, 4);
  g.fill(bladeColor);
  g.rect(18, 4, 2, 4);
  g.fill(bladeColor);
  g.rect(10, 20, 2, 4);
  g.fill(bladeColor);
  g.rect(26, 16, 2, 4);
  g.fill(bladeColor);

  if (addDetail) {
    // Tiny flower dots on the lightest grass
    const flowers = palette.grassFlowers;
    g.rect(8, 6, 2, 2);
    g.fill(flowers[0] ?? 0xe85d75);
    g.rect(22, 22, 2, 2);
    g.fill(flowers[1] ?? 0xf0c040);
    g.rect(14, 14, 2, 2);
    g.fill(flowers[2] ?? 0xd0d0ff);
  }
}

function drawDirtTile(g: Graphics, palette: MapThemePalette): void {
  g.rect(0, 0, TILE, TILE);
  g.fill(palette.dirt);

  // Subtle texture spots
  g.rect(6, 4, 4, 2);
  g.fill(palette.dirtTexture[0]);
  g.rect(20, 14, 4, 2);
  g.fill(palette.dirtTexture[0]);
  g.rect(10, 24, 6, 2);
  g.fill(palette.dirtTexture[1]);
  g.rect(24, 6, 2, 4);
  g.fill(palette.dirtTexture[1]);

  // Tiny pebbles
  g.rect(4, 16, 2, 2);
  g.fill(palette.stoneShadow);
  g.rect(26, 26, 2, 2);
  g.fill(palette.stoneShadow);
}

function drawDirtEdgeH(g: Graphics, palette: MapThemePalette): void {
  // Dirt center
  g.rect(0, 4, TILE, TILE - 8);
  g.fill(palette.dirt);
  // Grass-to-dirt transition (top/bottom)
  g.rect(0, 0, TILE, 4);
  g.fill(palette.dirtEdge);
  g.rect(0, TILE - 4, TILE, 4);
  g.fill(palette.dirtEdge);
  // Rough edge pixels
  g.rect(6, 2, 4, 2);
  g.fill(palette.dirt);
  g.rect(20, 2, 6, 2);
  g.fill(palette.dirt);
  g.rect(10, TILE - 4, 4, 2);
  g.fill(palette.dirt);
}

function drawDirtEdgeV(g: Graphics, palette: MapThemePalette): void {
  g.rect(4, 0, TILE - 8, TILE);
  g.fill(palette.dirt);
  g.rect(0, 0, 4, TILE);
  g.fill(palette.dirtEdge);
  g.rect(TILE - 4, 0, 4, TILE);
  g.fill(palette.dirtEdge);
  // Rough edge pixels
  g.rect(2, 8, 2, 4);
  g.fill(palette.dirt);
  g.rect(TILE - 4, 18, 2, 6);
  g.fill(palette.dirt);
}

function drawDirtCorner(g: Graphics, palette: MapThemePalette): void {
  g.rect(0, 0, TILE, TILE);
  g.fill(palette.dirtEdge);
  g.rect(4, 4, TILE - 8, TILE - 8);
  g.fill(palette.dirt);
}

function drawWaterTile(g: Graphics, frame: number, palette: MapThemePalette): void {
  const base = palette.water[frame];
  g.rect(0, 0, TILE, TILE);
  g.fill(base);

  // Wave lines
  const offset = frame * 4;
  g.rect((2 + offset) % TILE, 6, 8, 2);
  g.fill(palette.waterWave);
  g.rect((14 + offset) % TILE, 16, 10, 2);
  g.fill(palette.waterWave);
  g.rect((8 + offset) % TILE, 26, 6, 2);
  g.fill(palette.waterWave);

  // Deeper spots
  g.rect(4, 12, 4, 4);
  g.fill(palette.waterDeep);
  g.rect(22, 20, 4, 4);
  g.fill(palette.waterDeep);
}

function drawWaterEdge(g: Graphics, palette: MapThemePalette): void {
  // Grass base
  g.rect(0, 0, TILE, TILE);
  g.fill(palette.grass[0]);
  // Water inner area
  g.rect(4, 4, TILE - 8, TILE - 8);
  g.fill(palette.water[0]);
  // Muddy transition
  g.rect(2, 2, TILE - 4, 2);
  g.fill(palette.waterEdgeMud);
  g.rect(2, TILE - 4, TILE - 4, 2);
  g.fill(palette.waterEdgeMud);
  g.rect(2, 4, 2, TILE - 8);
  g.fill(palette.waterEdgeMud);
  g.rect(TILE - 4, 4, 2, TILE - 8);
  g.fill(palette.waterEdgeMud);
}

function drawStoneTile(g: Graphics, palette: MapThemePalette): void {
  g.rect(0, 0, TILE, TILE);
  g.fill(palette.stoneColor);
  // Stone block pattern
  g.rect(0, 0, 14, 14);
  g.fill(palette.stoneHighlight);
  g.rect(16, 0, 16, 14);
  g.fill(palette.stoneShadow);
  g.rect(0, 16, 16, 16);
  g.fill(palette.stoneShadow);
  g.rect(18, 16, 14, 16);
  g.fill(palette.stoneHighlight);
  // Mortar lines
  g.rect(14, 0, 2, TILE);
  g.fill(palette.stoneShadow);
  g.rect(0, 14, TILE, 2);
  g.fill(palette.stoneShadow);
  // Highlights
  g.rect(2, 2, 4, 2);
  g.fill(palette.stoneHighlight);
  g.rect(20, 18, 4, 2);
  g.fill(palette.stoneHighlight);
}

function drawSandTile(g: Graphics, palette: MapThemePalette): void {
  g.rect(0, 0, TILE, TILE);
  g.fill(palette.dirtTexture[1]);
  // Sand texture
  g.rect(6, 4, 4, 2);
  g.fill(palette.dirtTexture[0]);
  g.rect(20, 14, 6, 2);
  g.fill(palette.dirtTexture[0]);
  g.rect(8, 24, 4, 2);
  g.fill(palette.dirt);
  g.rect(24, 8, 4, 2);
  g.fill(palette.dirt);
  // Tiny shells
  g.rect(12, 10, 2, 2);
  g.fill(palette.stoneHighlight);
  g.rect(26, 22, 2, 2);
  g.fill(palette.stoneHighlight);
}

function generateTexture(renderer: Renderer, drawFn: (g: Graphics) => void): Texture {
  const g = new Graphics();
  drawFn(g);
  const texture = renderer.generateTexture({ target: g, resolution: 1 });
  g.destroy();
  return texture;
}

export function generateTileset(renderer: Renderer, palette: MapThemePalette): Tileset {
  return {
    grass1: generateTexture(renderer, (g) => drawGrassTile(g, palette.grass[0], false, palette)),
    grass2: generateTexture(renderer, (g) => drawGrassTile(g, palette.grass[1], false, palette)),
    grass3: generateTexture(renderer, (g) => drawGrassTile(g, palette.grass[2], true, palette)),
    dirtCenter: generateTexture(renderer, (g) => drawDirtTile(g, palette)),
    dirtEdgeH: generateTexture(renderer, (g) => drawDirtEdgeH(g, palette)),
    dirtEdgeV: generateTexture(renderer, (g) => drawDirtEdgeV(g, palette)),
    dirtCorner: generateTexture(renderer, (g) => drawDirtCorner(g, palette)),
    water1: generateTexture(renderer, (g) => drawWaterTile(g, 0, palette)),
    water2: generateTexture(renderer, (g) => drawWaterTile(g, 1, palette)),
    waterEdge: generateTexture(renderer, (g) => drawWaterEdge(g, palette)),
    stone: generateTexture(renderer, (g) => drawStoneTile(g, palette)),
    sand: generateTexture(renderer, (g) => drawSandTile(g, palette)),
  };
}

/** Pond location data for animated sparkle effects */
export interface PondLocation {
  x: number;
  y: number;
  cols: number;
  rows: number;
}

/** Simple seeded pseudo-random (must match SpatialCanvas version) */
function seededRand(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * Create a tiled ground layer using the generated tileset.
 * Returns the ground Container and pond location data for animations.
 */
export function createTiledGround(
  renderer: Renderer,
  worldW: number,
  worldH: number,
  rooms: { x: number; y: number; w: number; h: number }[],
  tileset: Tileset,
  palette?: MapThemePalette,
): { ground: Container; ponds: PondLocation[] } {
  const ground = new Container();
  ground.label = "ground-layer";

  const pad = TILE * 4;
  const cols = Math.ceil((worldW + pad * 2) / TILE);
  const rows = Math.ceil((worldH + pad * 2) / TILE);

  // Helper to check room overlap
  function overlapsRoom(px: number, py: number, size: number, padDist: number): boolean {
    for (const r of rooms) {
      if (
        px + size > r.x - padDist && px < r.x + r.w + padDist &&
        py + size > r.y - padDist && py < r.y + r.h + padDist
      ) return true;
    }
    return false;
  }

  // --- Generate pond locations (2-3 ponds, not overlapping rooms) ---
  // Skip ponds for urban themes (cities don't have random ponds)
  const ponds: PondLocation[] = [];
  if (!palette || palette.decorationStyle !== "urban") {
    const pondCount = 2 + Math.floor(seededRand(worldW, worldH) * 2); // 2-3 ponds
    let attempts = 0;
    while (ponds.length < pondCount && attempts < 30) {
      const pondCols = 3 + Math.floor(seededRand(attempts * 37, attempts * 53) * 3); // 3-5 tiles wide
      const pondRows = 3 + Math.floor(seededRand(attempts * 71, attempts * 23) * 2); // 3-4 tiles tall
      const px = Math.floor(seededRand(attempts * 13, worldW) * (worldW - pondCols * TILE));
      const py = Math.floor(seededRand(worldH, attempts * 17) * (worldH - pondRows * TILE));

      if (!overlapsRoom(px, py, Math.max(pondCols, pondRows) * TILE, TILE * 2)) {
        // Check no overlap with existing ponds
        let pondOverlap = false;
        for (const existing of ponds) {
          const ex2 = existing.x + existing.cols * TILE;
          const ey2 = existing.y + existing.rows * TILE;
          const nx2 = px + pondCols * TILE;
          const ny2 = py + pondRows * TILE;
          if (px < ex2 + TILE * 2 && nx2 > existing.x - TILE * 2 &&
              py < ey2 + TILE * 2 && ny2 > existing.y - TILE * 2) {
            pondOverlap = true;
            break;
          }
        }
        if (!pondOverlap) {
          ponds.push({ x: px, y: py, cols: pondCols, rows: pondRows });
        }
      }
      attempts++;
    }
  }

  // --- Build a lookup for which tiles are paths ---
  const pathTiles = new Set<string>();
  const sorted = [...rooms].sort((a, b) => a.y === b.y ? a.x - b.x : a.y - b.y);
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i];
      const b = sorted[j];
      const aRight = a.x + a.w;
      const bLeft = b.x;
      const aMid = a.y + a.h / 2;
      const bMid = b.y + b.h / 2;
      // Horizontal path
      if (Math.abs(aMid - bMid) < 100 && bLeft > aRight && bLeft - aRight < 120) {
        const pathY = Math.min(aMid, bMid);
        const startCol = Math.floor((aRight + pad) / TILE);
        const endCol = Math.ceil((bLeft + pad) / TILE);
        const pathRow = Math.floor((pathY + pad) / TILE);
        for (let c = startCol; c < endCol; c++) {
          pathTiles.add(`${c},${pathRow}`);
        }
      }
      // Vertical path
      const aCx = a.x + a.w / 2;
      const bCx = b.x + b.w / 2;
      const aBot = a.y + a.h;
      const bTop = b.y;
      if (Math.abs(aCx - bCx) < 150 && bTop > aBot && bTop - aBot < 150) {
        const pathX = Math.min(aCx, bCx);
        const startRow = Math.floor((aBot + pad) / TILE);
        const endRow = Math.ceil((bTop + pad) / TILE);
        const pathCol = Math.floor((pathX + pad) / TILE);
        for (let r = startRow; r < endRow; r++) {
          pathTiles.add(`${pathCol},${r}`);
        }
      }
    }
  }

  // --- Build pond tile lookup ---
  const pondTiles = new Set<string>();
  const pondEdgeTiles = new Set<string>();
  for (const pond of ponds) {
    const startCol = Math.floor((pond.x + pad) / TILE);
    const startRow = Math.floor((pond.y + pad) / TILE);
    for (let pr = 0; pr < pond.rows; pr++) {
      for (let pc = 0; pc < pond.cols; pc++) {
        const tc = startCol + pc;
        const tr = startRow + pr;
        const isEdge = pr === 0 || pr === pond.rows - 1 || pc === 0 || pc === pond.cols - 1;
        if (isEdge) {
          pondEdgeTiles.add(`${tc},${tr}`);
        } else {
          pondTiles.add(`${tc},${tr}`);
        }
      }
    }
  }

  // --- Place tiles ---
  const tileContainer = new Container();
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const key = `${col},${row}`;
      const tx = col * TILE - pad;
      const ty = row * TILE - pad;

      let texture: Texture;
      if (pondTiles.has(key)) {
        texture = tileset.water1;
      } else if (pondEdgeTiles.has(key)) {
        texture = tileset.waterEdge;
      } else if (pathTiles.has(key)) {
        // Check neighbors for edge detection
        const hasPathAbove = pathTiles.has(`${col},${row - 1}`);
        const hasPathBelow = pathTiles.has(`${col},${row + 1}`);
        const hasPathLeft = pathTiles.has(`${col - 1},${row}`);
        const hasPathRight = pathTiles.has(`${col + 1},${row}`);
        const neighborCount = [hasPathAbove, hasPathBelow, hasPathLeft, hasPathRight].filter(Boolean).length;

        if (neighborCount === 0) {
          texture = tileset.dirtCorner;
        } else if (hasPathAbove || hasPathBelow) {
          if (!hasPathLeft && !hasPathRight) {
            texture = tileset.dirtEdgeV;
          } else {
            texture = tileset.dirtCenter;
          }
        } else {
          texture = tileset.dirtEdgeH;
        }
      } else {
        // Grass variant based on seeded random
        const shade = seededRand(col, row);
        if (shade < 0.4) {
          texture = tileset.grass1;
        } else if (shade < 0.75) {
          texture = tileset.grass2;
        } else {
          texture = tileset.grass3;
        }
      }

      const sprite = new Sprite(texture);
      sprite.x = tx;
      sprite.y = ty;
      tileContainer.addChild(sprite);
    }
  }

  ground.addChild(tileContainer);

  // Cache the entire ground as a single texture for performance
  ground.cacheAsTexture(true);

  return { ground, ponds };
}
