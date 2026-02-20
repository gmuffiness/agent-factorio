# AI-Town vs AgentFactorio: Visual Comparison

## Overview

AI-Town (a16z) provides a rich game-like visual experience for AI agent simulation. This document compares its visual approach with AgentFactorio's spatial canvas to identify improvement opportunities.

## Comparison by Area

### Avatars & Characters
| Aspect | AI-Town | AgentFactorio |
|--------|---------|------------|
| Sprite style | 32x32 pixel-art characters | 32x32 sprite sheet (characters.png) |
| Animation | Walk cycle with directional sprites | Walk cycle for player, static for agents |
| Rendering | Pixel-perfect (nearest-neighbor scaling) | Default bilinear (blurry on zoom) |

### Environment & Background
| Aspect | AI-Town | AgentFactorio |
|--------|---------|------------|
| Ground | Rich tilemap with varied terrain (grass, dirt, water, sand) | 3-shade flat color grass tiles |
| Paths | Tile-based dirt paths with edge transitions | Simple 16px wide single-color paths |
| Water | Animated water tiles with sparkle effects | None |
| Decorations | Trees, bushes, flowers, campfires, furniture | Trees, bushes, flowers, stones (static) |

### Atmosphere & Animation
| Aspect | AI-Town | AgentFactorio |
|--------|---------|------------|
| Ambient animation | Campfire flames, water shimmer, flag waving | Agent bob/pulse only |
| Lighting | Warm glow from campfires, day/night cycle | None |
| Typography | Pixel/retro fonts matching the art style | System monospace font |
| Overall feel | Cozy game world | Functional diagram |

### Interaction
| Aspect | AI-Town | AgentFactorio |
|--------|---------|------------|
| Movement | Autonomous agent pathfinding | Player WASD movement (agents static) |
| Dialogue | Speech bubbles with AI conversations | RPG dialogue overlay with E key |
| Camera | Follow player with zoom | Follow player with zoom |

## Selected Improvements for AgentFactorio

Based on this analysis, three high-impact visual improvements were selected:

1. **Tilemap-based background** — Replace flat-color grass with varied terrain tiles (grass variants, dirt paths with edges, water ponds)
2. **Animated environment objects** — Add campfires near rooms, water sparkle on ponds, waving flags on rooftops
3. **Pixel-perfect rendering + retro font** — Enable NEAREST scaling and use "Press Start 2P" font for authentic retro game feel

These changes focus on environmental richness without adding autonomous agent movement (which is unnecessary for AgentFactorio's use case as an agent management tool).
