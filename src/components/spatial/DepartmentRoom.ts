import { Container, Graphics, Text } from "pixi.js";
import type { Department } from "@/types";
import { getVendorBgColor, getVendorColor, getVendorLabel, formatCurrency } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

export function createDepartmentRoom(
  department: Department,
  onDoubleClick?: (dept: Department) => void,
): Container {
  const container = new Container();
  const { x, y, width, height } = department.layout;
  container.x = x;
  container.y = y;

  const overBudget = department.monthlySpend > department.budget;
  const vendorColor = getVendorColor(department.primaryVendor);
  const borderColor = overBudget ? "#EF4444" : vendorColor;
  const borderHex = overBudget ? 0xEF4444 : parseInt(vendorColor.replace("#", ""), 16);

  // === Outer wall (thick border for 3D game effect) ===
  const outerWall = new Graphics();
  outerWall.roundRect(0, 0, width, height, 10);
  outerWall.fill({ color: borderHex, alpha: overBudget ? 0.5 : 0.35 });
  container.addChild(outerWall);

  // Wall shadow (bottom-right 3D effect)
  const wallShadow = new Graphics();
  wallShadow.roundRect(4, 4, width, height, 10);
  wallShadow.fill({ color: 0x000000, alpha: 0.12 });
  container.addChildAt(wallShadow, 0);

  // === Floor (inside room) ===
  const floorInset = 5;
  const floorX = floorInset;
  const floorY = floorInset;
  const floorW = width - floorInset * 2;
  const floorH = height - floorInset * 2;

  const floor = new Graphics();
  floor.roundRect(floorX, floorY, floorW, floorH, 6);
  floor.fill({ color: 0xF8FAFC });
  container.addChild(floor);

  // === Tile grid pattern on floor ===
  const tileSize = 24;
  const tileGraphics = new Graphics();
  for (let tx = floorX; tx < floorX + floorW; tx += tileSize) {
    for (let ty = floorY; ty < floorY + floorH; ty += tileSize) {
      const tw = Math.min(tileSize, floorX + floorW - tx);
      const th = Math.min(tileSize, floorY + floorH - ty);
      tileGraphics.rect(tx, ty, tw, th);
      tileGraphics.stroke({ color: borderHex, width: 0.5, alpha: 0.12 });
    }
  }
  // Vendor-tinted alternate tiles (checkerboard style)
  let altRow = false;
  for (let tx = floorX; tx < floorX + floorW; tx += tileSize) {
    altRow = !altRow;
    let altCol = altRow;
    for (let ty = floorY; ty < floorY + floorH; ty += tileSize) {
      altCol = !altCol;
      if (altCol) {
        const tw = Math.min(tileSize, floorX + floorW - tx);
        const th = Math.min(tileSize, floorY + floorH - ty);
        tileGraphics.roundRect(tx + 1, ty + 1, tw - 2, th - 2, 1);
        tileGraphics.fill({ color: borderHex, alpha: 0.04 });
      }
    }
  }
  container.addChild(tileGraphics);

  // === Room sign / header (like a sign above the room entrance) ===
  const headerH = 32;
  const headerBg = new Graphics();
  headerBg.roundRect(floorX, floorY, floorW, headerH, 6);
  headerBg.fill({ color: borderHex, alpha: overBudget ? 0.2 : 0.12 });
  container.addChild(headerBg);

  // Header divider line
  const divider = new Graphics();
  divider.rect(floorX + 4, floorY + headerH - 1, floorW - 8, 1);
  divider.fill({ color: borderHex, alpha: 0.2 });
  container.addChild(divider);

  // Department name (sign style)
  const nameText = new Text({
    text: `🏢 ${department.name}`,
    style: {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: 12,
      fontWeight: "700",
      fill: "#1E293B",
    },
  });
  nameText.x = floorX + 8;
  nameText.y = floorY + 8;
  container.addChild(nameText);

  // Vendor badge
  const vendorBadge = new Text({
    text: getVendorLabel(department.primaryVendor),
    style: {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: 9,
      fontWeight: "700",
      fill: vendorColor,
    },
  });
  vendorBadge.x = floorX + floorW - vendorBadge.width - 8;
  vendorBadge.y = floorY + 11;
  container.addChild(vendorBadge);

  // === Footer stats area ===
  const footerH = 44;
  const footerY = floorY + floorH - footerH;

  const footerBg = new Graphics();
  footerBg.roundRect(floorX, footerY, floorW, footerH, 6);
  footerBg.fill({ color: 0x000000, alpha: 0.04 });
  container.addChild(footerBg);

  // Footer divider
  const footerDivider = new Graphics();
  footerDivider.rect(floorX + 4, footerY, floorW - 8, 1);
  footerDivider.fill({ color: 0x000000, alpha: 0.08 });
  container.addChild(footerDivider);

  // Agent count
  const agentCount = department.agents.length;
  const countText = new Text({
    text: `👾 ${agentCount} agent${agentCount !== 1 ? "s" : ""}`,
    style: {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: 9,
      fill: "#64748B",
    },
  });
  countText.x = floorX + 8;
  countText.y = footerY + 6;
  container.addChild(countText);

  // Cost
  const costText = new Text({
    text: formatCurrency(department.monthlySpend),
    style: {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: 14,
      fontWeight: "700",
      fill: overBudget ? "#EF4444" : "#1E293B",
    },
  });
  costText.x = floorX + 8;
  costText.y = footerY + 20;
  container.addChild(costText);

  const budgetText = new Text({
    text: `/ ${formatCurrency(department.budget)}`,
    style: {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: 9,
      fill: "#94A3B8",
    },
  });
  budgetText.x = costText.x + costText.width + 4;
  budgetText.y = footerY + 24;
  container.addChild(budgetText);

  // === Budget bar ===
  const barW = floorW - 16;
  const barH = 4;
  const barY = footerY - 8;

  const barBg = new Graphics();
  barBg.roundRect(floorX + 8, barY, barW, barH, 2);
  barBg.fill({ color: 0x000000, alpha: 0.08 });
  container.addChild(barBg);

  const ratio = Math.min(1, department.monthlySpend / department.budget);
  const barFill = new Graphics();
  barFill.roundRect(floorX + 8, barY, barW * ratio, barH, 2);
  barFill.fill({ color: overBudget ? 0xEF4444 : borderHex });
  container.addChild(barFill);

  // === Vendor dots (top right of footer) ===
  const vendorCounts: Record<string, number> = { anthropic: 0, openai: 0, google: 0 };
  for (const agent of department.agents) vendorCounts[agent.vendor]++;
  let dotX = floorX + floorW - 8;
  const dotY = footerY + 28;
  for (const [vendor, count] of Object.entries(vendorCounts).reverse()) {
    if (count === 0) continue;
    for (let i = 0; i < count; i++) {
      dotX -= 10;
      const dot = new Graphics();
      dot.circle(dotX, dotY, 4);
      dot.fill({ color: getVendorColor(vendor as "anthropic" | "openai" | "google") });
      dot.stroke({ color: 0xFFFFFF, width: 1 });
      container.addChild(dot);
    }
  }

  // === Interaction ===
  const hitArea = new Graphics();
  hitArea.rect(0, 0, width, height);
  hitArea.fill({ color: 0x000000, alpha: 0 });
  hitArea.eventMode = "static";
  hitArea.cursor = "pointer";
  container.addChild(hitArea);

  let lastTap = 0;
  let clickTimer: ReturnType<typeof setTimeout> | null = null;

  hitArea.on("pointerdown", () => {
    const now = Date.now();
    if (onDoubleClick && now - lastTap < 350) {
      if (clickTimer) { clearTimeout(clickTimer); clickTimer = null; }
      onDoubleClick(department);
    } else {
      clickTimer = setTimeout(() => {
        useAppStore.getState().selectDepartment(department.id);
        clickTimer = null;
      }, 300);
    }
    lastTap = now;
  });

  return container;
}
