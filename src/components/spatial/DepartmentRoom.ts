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
  const bgColor = getVendorBgColor(department.primaryVendor);
  const borderColor = overBudget ? "#EF4444" : vendorColor;

  // Room shadow
  const shadow = new Graphics();
  shadow.roundRect(3, 3, width, height, 12);
  shadow.fill({ color: "#000000", alpha: 0.06 });
  container.addChild(shadow);

  // Room background
  const bg = new Graphics();
  bg.roundRect(0, 0, width, height, 12);
  bg.fill(bgColor);
  bg.stroke({ color: borderColor, width: overBudget ? 3 : 2, alpha: overBudget ? 1 : 0.6 });
  container.addChild(bg);

  // Header bar
  const headerHeight = 36;
  const header = new Graphics();
  header.roundRect(0, 0, width, headerHeight, 12);
  header.fill({ color: vendorColor, alpha: 0.15 });
  // Flat bottom edge for header
  header.rect(0, headerHeight - 12, width, 12);
  header.fill({ color: vendorColor, alpha: 0.15 });
  container.addChild(header);

  // Divider line under header
  const divider = new Graphics();
  divider.moveTo(8, headerHeight);
  divider.lineTo(width - 8, headerHeight);
  divider.stroke({ color: vendorColor, width: 1, alpha: 0.2 });
  container.addChild(divider);

  // Department name
  const nameText = new Text({
    text: department.name,
    style: {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: 13,
      fontWeight: "700",
      fill: "#1E293B",
    },
  });
  nameText.x = 12;
  nameText.y = 10;
  container.addChild(nameText);

  // Vendor badge in header
  const vendorBadge = new Text({
    text: getVendorLabel(department.primaryVendor),
    style: {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: 9,
      fontWeight: "600",
      fill: vendorColor,
    },
  });
  vendorBadge.x = width - 12 - vendorBadge.width;
  vendorBadge.y = 13;
  container.addChild(vendorBadge);

  // Agent count badge
  const agentCount = department.agents.length;
  const countText = new Text({
    text: `${agentCount} agent${agentCount !== 1 ? "s" : ""}`,
    style: {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: 10,
      fill: "#64748B",
    },
  });
  countText.x = 12;
  countText.y = height - 42;
  container.addChild(countText);

  // Cost display in footer
  const costText = new Text({
    text: formatCurrency(department.monthlySpend),
    style: {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: 14,
      fontWeight: "700",
      fill: overBudget ? "#EF4444" : "#1E293B",
    },
  });
  costText.x = 12;
  costText.y = height - 26;
  container.addChild(costText);

  // Budget text
  const budgetText = new Text({
    text: `/ ${formatCurrency(department.budget)}`,
    style: {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: 10,
      fill: "#94A3B8",
    },
  });
  budgetText.x = costText.x + costText.width + 4;
  budgetText.y = height - 22;
  container.addChild(budgetText);

  // Budget progress bar
  const barWidth = width - 24;
  const barHeight = 3;
  const barY = height - 48;
  const barBg = new Graphics();
  barBg.roundRect(12, barY, barWidth, barHeight, 2);
  barBg.fill({ color: "#000000", alpha: 0.06 });
  container.addChild(barBg);

  const usageRatio = Math.min(1, department.monthlySpend / department.budget);
  const barFill = new Graphics();
  barFill.roundRect(12, barY, barWidth * usageRatio, barHeight, 2);
  barFill.fill(overBudget ? "#EF4444" : vendorColor);
  container.addChild(barFill);

  // Vendor distribution dots (small colored dots showing agent vendor mix)
  const vendorCounts = { anthropic: 0, openai: 0, google: 0 };
  for (const agent of department.agents) {
    vendorCounts[agent.vendor]++;
  }
  let dotX = width - 12;
  const dotY = height - 22;
  for (const [vendor, count] of Object.entries(vendorCounts).reverse()) {
    if (count === 0) continue;
    for (let i = 0; i < count; i++) {
      dotX -= 10;
      const dot = new Graphics();
      dot.circle(dotX, dotY, 3.5);
      dot.fill(getVendorColor(vendor as "anthropic" | "openai" | "google"));
      container.addChild(dot);
    }
  }

  // Make interactive
  bg.eventMode = "static";
  bg.cursor = "pointer";

  // Distinguish single-click (open drawer) from double-click (zoom)
  let clickTimer: ReturnType<typeof setTimeout> | null = null;
  let lastTap = 0;

  bg.on("pointerdown", () => {
    const now = Date.now();
    if (onDoubleClick && now - lastTap < 350) {
      if (clickTimer) {
        clearTimeout(clickTimer);
        clickTimer = null;
      }
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
