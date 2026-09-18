import { NextResponse } from "next/server";
import {
  createAdminServices,
  ensurePlatformSchema,
  hasAdminServices,
  requirePlatformAdmin,
} from "../../../lib/appwrite/server";

export async function GET(request: Request) {
  try {
    const admin = await requirePlatformAdmin(request);
    let applications: Record<string, unknown>[] = [];
    let stores: Record<string, unknown>[] = [];
    let insurers: Record<string, unknown>[] = [];
    let members: Record<string, unknown>[] = [];
    let events: Record<string, unknown>[] = [];

    if (hasAdminServices()) {
      try {
        await ensurePlatformSchema();
        const { tables, databaseId, Query } = createAdminServices();
        const safeList = async (tableId: string) =>
          (
            await tables.listRows({
              databaseId,
              tableId,
              queries: [Query.orderDesc("$createdAt"), Query.limit(100)],
            })
          ).rows as unknown as Record<string, unknown>[];
        [applications, stores, insurers, members, events] = await Promise.all([
          safeList("organization_applications"),
          safeList("store_owners"),
          safeList("insurer_organizations"),
          safeList("organization_members"),
          safeList("onboarding_events"),
        ]);
      } catch (err) {
        console.warn("Could not query platform tables via admin services:", err);
      }
    }

    const eventCounts = events.reduce<Record<string, number>>((counts, row) => {
      const key = String(row.event || "unknown");
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {});
    return NextResponse.json({
      admin: { name: admin.name, email: admin.email },
      applications,
      stores,
      insurers,
      members,
      analytics: { totalEvents: events.length, eventCounts },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Admin data could not be loaded.";
    return NextResponse.json(
      {
        error:
          message === "ADMIN_REQUIRED"
            ? "This account does not have platform-admin access."
            : message,
      },
      { status: message.includes("REQUIRED") ? 403 : 500 },
    );
  }
}
