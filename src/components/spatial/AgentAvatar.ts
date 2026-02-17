import { Container, Graphics, Text } from "pixi.js";
import type { Agent } from "@/types";
import { getVendorColor } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

const vendorInitials: Record<string, string> = {
  anthropic: "C",
  openai: "G",
  google: "Ge",
};

export function createAgentAvatar(agent: Agent): Container {
  const container = new Container();
  container.x = agent.position.x;
  container.y = agent.position.y;

  const color = getVendorColor(agent.vendor);
  const isActive = agent.status === "active";
  const isError = agent.status === "error";
  const isIdle = agent.status === "idle";

  // Card shadow
  const shadow = new Graphics();
  shadow.roundRect(-20, -14, 40, 42, 8);
  shadow.fill({ color: "#000000", alpha: 0.08 });
  container.addChild(shadow);

  // Card background
  const card = new Graphics();
  card.roundRect(-22, -16, 40, 42, 8);
  card.fill("#FFFFFF");
  card.stroke({ color: isError ? "#EF4444" : color, width: isError ? 2 : 1.5, alpha: isError ? 1 : 0.5 });
  container.addChild(card);

  // Avatar circle (vendor-colored)
  const avatarBg = new Graphics();
  avatarBg.circle(-2, 0, 11);
  avatarBg.fill(color);
  container.addChild(avatarBg);

  // Vendor initial letter
  const initial = new Text({
    text: vendorInitials[agent.vendor] || "?",
    style: {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: 10,
      fontWeight: "800",
      fill: "#FFFFFF",
    },
  });
  initial.anchor.set(0.5, 0.5);
  initial.x = -2;
  initial.y = 0;
  container.addChild(initial);

  // Status dot (top-right of card)
  const statusDot = new Graphics();
  statusDot.circle(14, -12, 4);
  if (isActive) statusDot.fill("#22C55E");
  else if (isIdle) statusDot.fill("#EAB308");
  else statusDot.fill("#EF4444");
  // White border around status dot
  statusDot.stroke({ color: "#FFFFFF", width: 1.5 });
  container.addChild(statusDot);

  // Agent name below card
  const shortName = agent.name.length > 12 ? agent.name.slice(0, 11) + "…" : agent.name;
  const nameLabel = new Text({
    text: shortName,
    style: {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: 8,
      fontWeight: "500",
      fill: "#475569",
    },
  });
  nameLabel.anchor.set(0.5, 0);
  nameLabel.x = -2;
  nameLabel.y = 30;
  container.addChild(nameLabel);

  // Error badge
  if (isError) {
    const errorBadge = new Graphics();
    errorBadge.circle(14, -12, 4);
    errorBadge.fill("#EF4444");
    container.addChild(errorBadge);

    const exclamation = new Text({
      text: "!",
      style: {
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: 7,
        fontWeight: "900",
        fill: "#FFFFFF",
      },
    });
    exclamation.anchor.set(0.5, 0.5);
    exclamation.x = 14;
    exclamation.y = -12;
    container.addChild(exclamation);
  }

  // Idle dimming
  if (isIdle) {
    container.alpha = 0.75;
  }

  // Hover tooltip (richer info)
  const tooltipWidth = 140;
  const tooltipContainer = new Container();
  tooltipContainer.visible = false;

  const tooltipBg = new Graphics();
  tooltipBg.roundRect(-tooltipWidth / 2, -52, tooltipWidth, 44, 6);
  tooltipBg.fill({ color: "#1E293B", alpha: 0.95 });
  tooltipContainer.addChild(tooltipBg);

  const tooltipName = new Text({
    text: agent.name,
    style: {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: 10,
      fontWeight: "700",
      fill: "#FFFFFF",
    },
  });
  tooltipName.anchor.set(0.5, 0);
  tooltipName.x = 0;
  tooltipName.y = -48;
  tooltipContainer.addChild(tooltipName);

  const tooltipMeta = new Text({
    text: `${agent.model}  •  $${agent.monthlyCost}/mo`,
    style: {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: 8,
      fill: "#94A3B8",
    },
  });
  tooltipMeta.anchor.set(0.5, 0);
  tooltipMeta.x = 0;
  tooltipMeta.y = -36;
  tooltipContainer.addChild(tooltipMeta);

  const skillIcons = agent.skills.map(s => s.icon).join(" ");
  const tooltipSkills = new Text({
    text: skillIcons,
    style: {
      fontFamily: "Arial, sans-serif",
      fontSize: 10,
    },
  });
  tooltipSkills.anchor.set(0.5, 0);
  tooltipSkills.x = 0;
  tooltipSkills.y = -22;
  tooltipContainer.addChild(tooltipSkills);

  tooltipContainer.x = -2;
  tooltipContainer.y = 0;
  container.addChild(tooltipContainer);

  // Interaction
  container.eventMode = "static";
  container.cursor = "pointer";
  container.hitArea = { contains: (hx: number, hy: number) => hx >= -24 && hx <= 20 && hy >= -18 && hy <= 42 };

  container.on("pointerover", () => {
    tooltipContainer.visible = true;
    if (!isIdle) container.alpha = 0.9;
  });
  container.on("pointerout", () => {
    tooltipContainer.visible = false;
    if (isIdle) container.alpha = 0.75;
    else container.alpha = 1;
  });
  container.on("pointerdown", () => {
    useAppStore.getState().selectAgent(agent.id);
  });

  // Store original Y and status for animation in SpatialCanvas
  (container as Container & { _baseY: number })._baseY = container.y;
  (container as Container & { _agentStatus: string })._agentStatus = agent.status;

  return container;
}
