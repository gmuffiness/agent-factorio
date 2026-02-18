import { Container, Graphics, Text } from "pixi.js";
import type { Agent } from "@/types";
import { getVendorColor } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

const vendorInitials: Record<string, string> = {
  anthropic: "C",
  openai: "G",
  google: "Ge",
};

// Vendor-specific outfit accent colors (darker shade for pants/detail)
const vendorDarkColor: Record<string, string> = {
  anthropic: "#C2410C",
  openai: "#15803D",
  google: "#1D4ED8",
};

// Vendor-specific hat colors
const vendorHatColor: Record<string, string> = {
  anthropic: "#EA580C",
  openai: "#16A34A",
  google: "#2563EB",
};

export function createAgentAvatar(agent: Agent): Container {
  const container = new Container();
  container.x = agent.position.x;
  container.y = agent.position.y;

  const color = getVendorColor(agent.vendor);
  const darkColor = vendorDarkColor[agent.vendor] || "#374151";
  const hatColor = vendorHatColor[agent.vendor] || color;
  const isActive = agent.status === "active";
  const isError = agent.status === "error";
  const isIdle = agent.status === "idle";

  // === Active Aura (soft glow ring) ===
  if (isActive) {
    const aura = new Graphics();
    aura.circle(0, 4, 20);
    aura.fill({ color: 0x22C55E, alpha: 0.18 });
    container.addChild(aura);

    const aura2 = new Graphics();
    aura2.circle(0, 4, 15);
    aura2.fill({ color: 0x22C55E, alpha: 0.1 });
    container.addChild(aura2);
  }

  // === Ground Shadow ===
  const groundShadow = new Graphics();
  groundShadow.ellipse(0, 24, 13, 4);
  groundShadow.fill({ color: 0x000000, alpha: 0.18 });
  container.addChild(groundShadow);

  // === Legs / Feet ===
  // Left leg
  const leftLeg = new Graphics();
  leftLeg.roundRect(-9, 12, 7, 12, 3);
  leftLeg.fill({ color: 0x1E293B });
  container.addChild(leftLeg);

  // Right leg
  const rightLeg = new Graphics();
  rightLeg.roundRect(2, 12, 7, 12, 3);
  rightLeg.fill({ color: 0x1E293B });
  container.addChild(rightLeg);

  // Left shoe
  const leftShoe = new Graphics();
  leftShoe.ellipse(-5.5, 24, 5, 3);
  leftShoe.fill({ color: 0x0F172A });
  container.addChild(leftShoe);

  // Right shoe
  const rightShoe = new Graphics();
  rightShoe.ellipse(5.5, 24, 5, 3);
  rightShoe.fill({ color: 0x0F172A });
  container.addChild(rightShoe);

  // === Body / Clothes ===
  const body = new Graphics();
  body.roundRect(-10, -2, 20, 16, 5);
  body.fill({ color });
  container.addChild(body);

  // Body shading (bottom half darker)
  const bodyShade = new Graphics();
  bodyShade.roundRect(-10, 6, 20, 8, 5);
  bodyShade.fill({ color: darkColor, alpha: 0.3 });
  container.addChild(bodyShade);

  // Collar / neckline
  const collar = new Graphics();
  collar.roundRect(-4, -2, 8, 5, 2);
  collar.fill({ color: 0xFFFFFF, alpha: 0.25 });
  container.addChild(collar);

  // === Arms ===
  // Left arm
  const leftArm = new Graphics();
  leftArm.roundRect(-16, -1, 7, 11, 3);
  leftArm.fill({ color });
  container.addChild(leftArm);

  // Right arm
  const rightArm = new Graphics();
  rightArm.roundRect(9, -1, 7, 11, 3);
  rightArm.fill({ color });
  container.addChild(rightArm);

  // Left hand
  const leftHand = new Graphics();
  leftHand.circle(-12, 11, 3.5);
  leftHand.fill({ color: 0xFDC9A0 });
  container.addChild(leftHand);

  // Right hand
  const rightHand = new Graphics();
  rightHand.circle(12, 11, 3.5);
  rightHand.fill({ color: 0xFDC9A0 });
  container.addChild(rightHand);

  // === Head ===
  const head = new Graphics();
  head.circle(0, -14, 13);
  head.fill({ color: 0xFDC9A0 }); // skin tone
  container.addChild(head);

  // Head shading (subtle bottom of face)
  const headShade = new Graphics();
  headShade.ellipse(0, -8, 9, 5);
  headShade.fill({ color: 0xF0A070, alpha: 0.2 });
  container.addChild(headShade);

  // === Eyes ===
  const leftEye = new Graphics();
  leftEye.circle(-4.5, -15, 2.5);
  leftEye.fill({ color: 0x1E293B });
  container.addChild(leftEye);

  const rightEye = new Graphics();
  rightEye.circle(4.5, -15, 2.5);
  rightEye.fill({ color: 0x1E293B });
  container.addChild(rightEye);

  // Eye whites (shine)
  const leftShine = new Graphics();
  leftShine.circle(-3.5, -16, 1);
  leftShine.fill({ color: 0xFFFFFF });
  container.addChild(leftShine);

  const rightShine = new Graphics();
  rightShine.circle(5.5, -16, 1);
  rightShine.fill({ color: 0xFFFFFF });
  container.addChild(rightShine);

  // === Mouth ===
  if (!isError) {
    const mouthL = new Graphics();
    mouthL.circle(-3, -10, 1.2);
    mouthL.fill({ color: 0xC8845A });
    container.addChild(mouthL);

    const mouthR = new Graphics();
    mouthR.circle(3, -10, 1.2);
    mouthR.fill({ color: 0xC8845A });
    container.addChild(mouthR);

    const mouthLine = new Graphics();
    mouthLine.rect(-3, -10, 6, 1.5);
    mouthLine.fill({ color: 0xC8845A });
    container.addChild(mouthLine);
  } else {
    // Sad/worried mouth for error
    const sadMouth = new Graphics();
    sadMouth.arc(0, -8, 4, Math.PI * 0.1, Math.PI * 0.9);
    sadMouth.stroke({ color: 0xC8845A, width: 1.5 });
    container.addChild(sadMouth);
  }

  // === Hat / Hair ===
  // Hat brim
  const hatBrim = new Graphics();
  hatBrim.ellipse(0, -25, 16, 5);
  hatBrim.fill({ color: hatColor });
  container.addChild(hatBrim);

  // Hat top
  const hatTop = new Graphics();
  hatTop.roundRect(-10, -36, 20, 14, 4);
  hatTop.fill({ color: hatColor });
  container.addChild(hatTop);

  // Hat band
  const hatBand = new Graphics();
  hatBand.rect(-10, -27, 20, 3);
  hatBand.fill({ color: darkColor, alpha: 0.5 });
  container.addChild(hatBand);

  // Vendor initial on hat
  const hatLabel = new Text({
    text: vendorInitials[agent.vendor] || "?",
    style: {
      fontFamily: "Arial, sans-serif",
      fontSize: 7,
      fontWeight: "900",
      fill: "#FFFFFF",
    },
  });
  hatLabel.anchor.set(0.5, 0.5);
  hatLabel.x = 0;
  hatLabel.y = -31;
  container.addChild(hatLabel);

  // === Status indicator (badge above hat) ===
  const statusRing = new Graphics();
  statusRing.circle(10, -38, 5);
  if (isActive) statusRing.fill({ color: 0x22C55E });
  else if (isIdle) statusRing.fill({ color: 0xEAB308 });
  else statusRing.fill({ color: 0xEF4444 });
  statusRing.stroke({ color: 0xFFFFFF, width: 1.5 });
  container.addChild(statusRing);

  // === Error speech bubble (! above head) ===
  if (isError) {
    const bubble = new Graphics();
    bubble.roundRect(-10, -58, 20, 18, 5);
    bubble.fill({ color: 0xEF4444 });
    // Bubble tail
    bubble.poly([-3, -40, 3, -40, 0, -36]);
    bubble.fill({ color: 0xEF4444 });
    container.addChild(bubble);

    const excl = new Text({
      text: "!",
      style: {
        fontFamily: "Arial, sans-serif",
        fontSize: 12,
        fontWeight: "900",
        fill: "#FFFFFF",
      },
    });
    excl.anchor.set(0.5, 0.5);
    excl.x = 0;
    excl.y = -49;
    container.addChild(excl);
  }

  // === Active "working" bubble (dots) ===
  if (isActive) {
    const bubble = new Graphics();
    bubble.roundRect(-14, -58, 28, 16, 5);
    bubble.fill({ color: 0x1E293B, alpha: 0.85 });
    bubble.poly([-3, -42, 3, -42, 0, -38]);
    bubble.fill({ color: 0x1E293B, alpha: 0.85 });
    container.addChild(bubble);

    const dot1 = new Text({ text: "•••", style: { fontFamily: "Arial", fontSize: 10, fill: "#FFFFFF" } });
    dot1.anchor.set(0.5, 0.5);
    dot1.x = 0;
    dot1.y = -50;
    container.addChild(dot1);
  }

  // === Name plate ===
  const shortName = agent.name.length > 12 ? agent.name.slice(0, 11) + "…" : agent.name;
  const nameBg = new Graphics();
  const nameWidth = Math.max(shortName.length * 5.5 + 12, 44);
  nameBg.roundRect(-nameWidth / 2, 30, nameWidth, 14, 4);
  nameBg.fill({ color: 0x1E293B, alpha: 0.8 });
  container.addChild(nameBg);

  const nameLabel = new Text({
    text: shortName,
    style: {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: 8,
      fontWeight: "600",
      fill: "#FFFFFF",
    },
  });
  nameLabel.anchor.set(0.5, 0);
  nameLabel.x = 0;
  nameLabel.y = 32;
  container.addChild(nameLabel);

  // === Tooltip ===
  const tooltipWidth = 150;
  const tooltipContainer = new Container();
  tooltipContainer.visible = false;

  const tooltipBg = new Graphics();
  tooltipBg.roundRect(-tooltipWidth / 2, -80, tooltipWidth, 50, 7);
  tooltipBg.fill({ color: 0x1E293B, alpha: 0.97 });
  tooltipContainer.addChild(tooltipBg);

  const tooltipName = new Text({
    text: agent.name,
    style: { fontFamily: "Inter, Arial, sans-serif", fontSize: 10, fontWeight: "700", fill: "#FFFFFF" },
  });
  tooltipName.anchor.set(0.5, 0);
  tooltipName.x = 0;
  tooltipName.y = -75;
  tooltipContainer.addChild(tooltipName);

  const tooltipMeta = new Text({
    text: `${agent.model}  •  $${agent.monthlyCost}/mo`,
    style: { fontFamily: "Inter, Arial, sans-serif", fontSize: 8, fill: "#94A3B8" },
  });
  tooltipMeta.anchor.set(0.5, 0);
  tooltipMeta.x = 0;
  tooltipMeta.y = -60;
  tooltipContainer.addChild(tooltipMeta);

  const skillIcons = agent.skills.map((s) => s.icon).join(" ");
  const tooltipSkills = new Text({
    text: skillIcons,
    style: { fontFamily: "Arial, sans-serif", fontSize: 10 },
  });
  tooltipSkills.anchor.set(0.5, 0);
  tooltipSkills.x = 0;
  tooltipSkills.y = -45;
  tooltipContainer.addChild(tooltipSkills);

  container.addChild(tooltipContainer);

  // === Idle dimming ===
  if (isIdle) {
    container.alpha = 0.65;
  }

  // === Interaction ===
  container.eventMode = "static";
  container.cursor = "pointer";
  container.hitArea = {
    contains: (hx: number, hy: number) => hx >= -18 && hx <= 18 && hy >= -42 && hy <= 46,
  };

  container.on("pointerover", () => {
    tooltipContainer.visible = true;
    if (!isIdle) container.scale.set(1.08);
  });
  container.on("pointerout", () => {
    tooltipContainer.visible = false;
    container.scale.set(1.0);
    if (isIdle) container.alpha = 0.65;
  });
  container.on("pointerdown", () => {
    useAppStore.getState().selectAgent(agent.id);
  });

  (container as Container & { _baseY: number })._baseY = container.y;
  (container as Container & { _agentStatus: string })._agentStatus = agent.status;

  return container;
}
