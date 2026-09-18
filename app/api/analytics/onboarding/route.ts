import { NextResponse } from "next/server";
import {
  createAdminServices,
  ensurePlatformSchema,
} from "../../../lib/appwrite/server";

export async function POST(request: Request) {
  try {
    const input = await request.json();
    await ensurePlatformSchema();
    const allowed = [
      "path_selected",
      "form_started",
      "form_submitted",
      "form_error",
      "approval_viewed",
    ];
    if (!allowed.includes(input.event))
      return NextResponse.json({ ok: false }, { status: 400 });
    const { tables, databaseId, ID } = createAdminServices();
    await tables.createRow({
      databaseId,
      tableId: "onboarding_events",
      rowId: ID.unique(),
      data: {
        event: input.event,
        role: String(input.role || ""),
        sessionId: String(input.sessionId || "").slice(0, 80),
        path: String(input.path || "").slice(0, 255),
        metadata: JSON.stringify(input.metadata || {}).slice(0, 2000),
        createdAt: new Date().toISOString(),
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 202 });
  }
}
