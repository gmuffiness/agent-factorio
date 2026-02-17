import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { departments, agents, organizations } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const rows = db.select().from(departments).all();

  const result = rows.map((d) => {
    const agentRows = db.select().from(agents).where(eq(agents.deptId, d.id)).all();
    return {
      ...d,
      agentCount: agentRows.length,
      layout: { x: d.layoutX, y: d.layoutY, width: d.layoutW, height: d.layoutH },
    };
  });

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const id = `dept-${Date.now()}`;
  const now = new Date().toISOString();

  // Get org id
  const orgs = db.select().from(organizations).all();
  const orgId = orgs[0]?.id ?? "org-1";

  // Calculate layout position (stack below existing departments)
  const existing = db.select().from(departments).all();
  const maxY = existing.reduce((max, d) => Math.max(max, d.layoutY + d.layoutH), 0);

  db.insert(departments).values({
    id,
    orgId,
    name: body.name,
    description: body.description ?? "",
    budget: body.budget ?? 0,
    monthlySpend: 0,
    primaryVendor: body.primaryVendor ?? "anthropic",
    layoutX: 50,
    layoutY: maxY + 50,
    layoutW: body.layoutW ?? 300,
    layoutH: body.layoutH ?? 240,
    createdAt: now,
  }).run();

  return NextResponse.json({ id, message: "Department created" }, { status: 201 });
}
