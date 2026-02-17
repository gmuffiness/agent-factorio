import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { departments, agents } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const existing = db.select().from(departments).where(eq(departments.id, id)).all();
  if (existing.length === 0) {
    return NextResponse.json({ error: "Department not found" }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.budget !== undefined) updates.budget = body.budget;
  if (body.primaryVendor !== undefined) updates.primaryVendor = body.primaryVendor;

  if (Object.keys(updates).length > 0) {
    db.update(departments).set(updates).where(eq(departments.id, id)).run();
  }

  return NextResponse.json({ message: "Department updated" });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = db.select().from(departments).where(eq(departments.id, id)).all();
  if (existing.length === 0) {
    return NextResponse.json({ error: "Department not found" }, { status: 404 });
  }

  // Check for agents
  const agentRows = db.select().from(agents).where(eq(agents.deptId, id)).all();
  if (agentRows.length > 0) {
    return NextResponse.json(
      { error: "Cannot delete department with agents. Remove agents first." },
      { status: 400 }
    );
  }

  db.delete(departments).where(eq(departments.id, id)).run();
  return NextResponse.json({ message: "Department deleted" });
}
