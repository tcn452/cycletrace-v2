import { NextResponse } from "next/server";
import {
  createAdminServices,
  ensurePlatformSchema,
  requirePlatformAdmin,
} from "../../../lib/appwrite/server";

export async function PATCH(request: Request) {
  try {
    const admin = await requirePlatformAdmin(request);
    await ensurePlatformSchema();
    const input = await request.json();
    if (!["approved", "rejected"].includes(input.status))
      return NextResponse.json(
        { error: "Choose approved or rejected." },
        { status: 400 },
      );
    const { tables, databaseId, Query, ID, Permission, Role } =
      createAdminServices();
    const application = await tables.getRow({
      databaseId,
      tableId: "organization_applications",
      rowId: input.applicationId,
    });
    await tables.updateRow({
      databaseId,
      tableId: "organization_applications",
      rowId: application.$id,
      data: {
        status: input.status,
        notes: String(input.notes || ""),
        reviewedAt: new Date().toISOString(),
        reviewedBy: admin.$id,
      },
    });
    if (application.type === "store") {
      const stores = await tables.listRows({
        databaseId,
        tableId: "store_owners",
        queries: [
          Query.equal("userId", application.applicantUserId),
          Query.limit(1),
        ],
      });
      if (stores.rows[0])
        await tables.updateRow({
          databaseId,
          tableId: "store_owners",
          rowId: stores.rows[0].$id,
          data: {
            status: input.status === "approved" ? "verified" : "rejected",
          },
        });
    } else if (input.status === "approved") {
      const organizationId = ID.unique();
      await tables.createRow({
        databaseId,
        tableId: "insurer_organizations",
        rowId: organizationId,
        data: { name: application.organizationName, status: "active" },
      });
      await tables.createRow({
        databaseId,
        tableId: "insurer_members",
        rowId: ID.unique(),
        data: {
          organizationId,
          userId: application.applicantUserId,
          email: application.applicantEmail,
          role: "admin",
        },
        permissions: [Permission.read(Role.user(application.applicantUserId))],
      });
      await tables.createRow({
        databaseId,
        tableId: "organization_members",
        rowId: ID.unique(),
        data: {
          organizationId,
          organizationType: "insurer",
          userId: application.applicantUserId,
          email: application.applicantEmail,
          role: "admin",
          status: "active",
          invitedBy: admin.$id,
          createdAt: new Date().toISOString(),
        },
        permissions: [Permission.read(Role.user(application.applicantUserId))],
      });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Review failed." },
      { status: 403 },
    );
  }
}
