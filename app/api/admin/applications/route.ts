import { NextResponse } from "next/server";
import {
  createAdminServices,
  ensurePlatformSchema,
  hasAdminServices,
  requirePlatformAdmin,
} from "../../../lib/appwrite/server";

export async function PATCH(request: Request) {
  try {
    const admin = await requirePlatformAdmin(request);
    const input = await request.json();
    const normalizedStatus =
      input.status === "verified"
        ? "approved"
        : input.status === "pending"
        ? "submitted"
        : input.status;
    if (!["approved", "rejected", "submitted", "reviewing"].includes(normalizedStatus))
      return NextResponse.json(
        { error: "Choose approved, verified, pending or rejected." },
        { status: 400 },
      );

    if (hasAdminServices()) {
      await ensurePlatformSchema();
      const { tables, databaseId, Query, ID, Permission, Role } =
        createAdminServices();
      try {
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
            status: normalizedStatus,
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
          if (stores.rows[0]) {
            await tables.updateRow({
              databaseId,
              tableId: "store_owners",
              rowId: stores.rows[0].$id,
              data: {
                status: normalizedStatus === "approved" ? "verified" : normalizedStatus === "submitted" ? "pending" : "rejected",
              },
            });
          }
        } else if (application.type === "insurer" && normalizedStatus === "approved") {
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
      } catch (err) {
        // If rowId was a storeId directly:
        try {
          await tables.updateRow({
            databaseId,
            tableId: "store_owners",
            rowId: input.applicationId,
            data: {
              status: normalizedStatus === "approved" ? "verified" : normalizedStatus === "submitted" ? "pending" : "rejected",
            },
          });
        } catch {
          console.warn("Could not update via admin services:", err);
        }
      }
    }
    return NextResponse.json({ ok: true, status: input.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Review failed." },
      { status: 403 },
    );
  }
}
