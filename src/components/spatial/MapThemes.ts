export type MapThemeId = "forest" | "desert" | "arctic" | "city";

export interface MapThemePalette {
  id: MapThemeId;
  name: string;
  description: string;
  background: string;
  grass: [number, number, number];
  grassBlade: number;
  grassFlowers: number[];
  dirt: number;
  dirtTexture: [number, number];
  dirtEdge: number;
  water: [number, number];
  waterWave: number;
  waterDeep: number;
  waterEdgeMud: number;
  treeTrunk: number;
  treeLeaves: number;
  treeLeavesLight: number;
  bushColor: number;
  bushHighlight: number;
  flowerColors: number[];
  flowerCenter: number;
  stoneColor: number;
  stoneShadow: number;
  stoneHighlight: number;
  campfireLogs: [number, number, number];
  campfireFlames: [number, number, number];
  campfireGlow: number;
  campfireEmber: number;
  sparkleColors: [number, number];
  decorationStyle: "nature" | "urban";
  lampPost: number;
  lampLight: number;
  benchColor: number;
  benchLeg: number;
  vendingBody: number;
  vendingScreen: number;
  hydrantColor: number;
  manholeColor: number;
  pottedPlant: number;
  pottedPot: number;
}

export const FOREST_THEME: MapThemePalette = {
  id: "forest",
  name: "Forest",
  description: "Lush green woodland with ponds and campfires",
  background: "#3D6B33",
  grass: [0x4a7a3d, 0x528a45, 0x5a9a50],
  grassBlade: 0x3d6b33,
  grassFlowers: [0xe85d75, 0xf0c040, 0xd0d0ff],
  dirt: 0xc4a882,
  dirtTexture: [0xb89e78, 0xd4b892],
  dirtEdge: 0xb09870,
  water: [0x3b7dd8, 0x4488dd],
  waterWave: 0x5599ee,
  waterDeep: 0x2a6cc8,
  waterEdgeMud: 0x7a6b4a,
  treeTrunk: 0x6b4226,
  treeLeaves: 0x2d5a1e,
  treeLeavesLight: 0x3d7a2e,
  bushColor: 0x3a6e2a,
  bushHighlight: 0x4a8e3a,
  flowerColors: [0xe85d75, 0xf0c040, 0xd0d0ff, 0xff9944],
  flowerCenter: 0xffee88,
  stoneColor: 0x8a8a8a,
  stoneShadow: 0x6a6a6a,
  stoneHighlight: 0xa0a0a0,
  campfireLogs: [0x6b4226, 0x5a3820, 0x7a5030],
  campfireFlames: [0xff4400, 0xff8800, 0xffcc00],
  campfireGlow: 0xffaa00,
  campfireEmber: 0xff6600,
  sparkleColors: [0xffffff, 0xaaddff],
  decorationStyle: "nature",
  lampPost: 0, lampLight: 0, benchColor: 0, benchLeg: 0,
  vendingBody: 0, vendingScreen: 0, hydrantColor: 0, manholeColor: 0,
  pottedPlant: 0, pottedPot: 0,
};

export const DESERT_THEME: MapThemePalette = {
  id: "desert",
  name: "Desert",
  description: "Arid sands with rocky trails and oases",
  background: "#C2A566",
  grass: [0xc2a566, 0xccb070, 0xd6ba7a],
  grassBlade: 0xb89a5c,
  grassFlowers: [0x8b7355, 0xa08860, 0x9e8c6a],
  dirt: 0xa08050,
  dirtTexture: [0x907040, 0xb09060],
  dirtEdge: 0x8a7040,
  water: [0x2e8b8b, 0x3a9a9a],
  waterWave: 0x4aaaaa,
  waterDeep: 0x1e7a7a,
  waterEdgeMud: 0x8a7a50,
  treeTrunk: 0x5a8a3a,
  treeLeaves: 0x6aaa4a,
  treeLeavesLight: 0x7aba5a,
  bushColor: 0x8a7a40,
  bushHighlight: 0x9a8a50,
  flowerColors: [0xcc4444, 0xe08030, 0xccaa44, 0xaa6633],
  flowerCenter: 0xffdd66,
  stoneColor: 0xa09080,
  stoneShadow: 0x807060,
  stoneHighlight: 0xb0a090,
  campfireLogs: [0x6b4226, 0x5a3820, 0x7a5030],
  campfireFlames: [0xff5500, 0xff9922, 0xffdd44],
  campfireGlow: 0xffbb22,
  campfireEmber: 0xff7722,
  sparkleColors: [0xeeffff, 0x88cccc],
  decorationStyle: "nature",
  lampPost: 0, lampLight: 0, benchColor: 0, benchLeg: 0,
  vendingBody: 0, vendingScreen: 0, hydrantColor: 0, manholeColor: 0,
  pottedPlant: 0, pottedPot: 0,
};

export const ARCTIC_THEME: MapThemePalette = {
  id: "arctic",
  name: "Arctic",
  description: "Frozen tundra with ice paths and snow-covered pines",
  background: "#B8C8D8",
  grass: [0xc8d8e8, 0xd0e0f0, 0xd8e8f8],
  grassBlade: 0xb8c8d8,
  grassFlowers: [0x88aacc, 0x99bbdd, 0xaaccee],
  dirt: 0x90a8c0,
  dirtTexture: [0x8098b0, 0xa0b8d0],
  dirtEdge: 0x7888a0,
  water: [0x5588bb, 0x6699cc],
  waterWave: 0x77aadd,
  waterDeep: 0x4477aa,
  waterEdgeMud: 0x8899aa,
  treeTrunk: 0x5a4a3a,
  treeLeaves: 0x2a5a4a,
  treeLeavesLight: 0x3a7a5a,
  bushColor: 0x4a6a5a,
  bushHighlight: 0x5a8a6a,
  flowerColors: [0x88bbee, 0x99ccff, 0xaaddff, 0x77aadd],
  flowerCenter: 0xddeeff,
  stoneColor: 0x9aaabc,
  stoneShadow: 0x7a8a9c,
  stoneHighlight: 0xbacadc,
  campfireLogs: [0x6b4226, 0x5a3820, 0x7a5030],
  campfireFlames: [0xff5522, 0xff9944, 0xffcc66],
  campfireGlow: 0xffaa33,
  campfireEmber: 0xff7744,
  sparkleColors: [0xeeffff, 0xaaddee],
  decorationStyle: "nature",
  lampPost: 0, lampLight: 0, benchColor: 0, benchLeg: 0,
  vendingBody: 0, vendingScreen: 0, hydrantColor: 0, manholeColor: 0,
  pottedPlant: 0, pottedPot: 0,
};

export const CITY_THEME: MapThemePalette = {
  id: "city",
  name: "City",
  description: "Urban streets with lamp posts, benches, and vending machines",
  background: "#5a5a6a",
  grass: [0x808890, 0x888e96, 0x90969e],
  grassBlade: 0x70767e,
  grassFlowers: [0x909090, 0xa0a0a0, 0xb0b0b0],
  dirt: 0x4a4a52,
  dirtTexture: [0x424248, 0x52525a],
  dirtEdge: 0x3a3a42,
  water: [0x4488cc, 0x5599dd],
  waterWave: 0x66aaee,
  waterDeep: 0x3377bb,
  waterEdgeMud: 0x606068,
  treeTrunk: 0x5a4a3a,
  treeLeaves: 0x3a6a3a,
  treeLeavesLight: 0x4a7a4a,
  bushColor: 0x4a6a4a,
  bushHighlight: 0x5a7a5a,
  flowerColors: [0xcc5555, 0xddaa33, 0x55aa55, 0x5588cc],
  flowerCenter: 0xffee88,
  stoneColor: 0x7a7a82,
  stoneShadow: 0x5a5a62,
  stoneHighlight: 0x9a9aa2,
  campfireLogs: [0x5a5a5a, 0x4a4a4a, 0x6a6a6a],
  campfireFlames: [0xff4400, 0xff8800, 0xffcc00],
  campfireGlow: 0xffaa44,
  campfireEmber: 0xff6600,
  sparkleColors: [0xffffff, 0xccddee],
  decorationStyle: "urban",
  lampPost: 0x3a3a3a,
  lampLight: 0xffe88a,
  benchColor: 0x8b6b4a,
  benchLeg: 0x4a4a4a,
  vendingBody: 0x3355aa,
  vendingScreen: 0x88ffaa,
  hydrantColor: 0xcc3333,
  manholeColor: 0x555560,
  pottedPlant: 0x44884a,
  pottedPot: 0xb87a4a,
};

export const MAP_THEMES: MapThemePalette[] = [FOREST_THEME, DESERT_THEME, ARCTIC_THEME, CITY_THEME];

export function getThemePalette(id: MapThemeId): MapThemePalette {
  return MAP_THEMES.find((t) => t.id === id) ?? FOREST_THEME;
}
