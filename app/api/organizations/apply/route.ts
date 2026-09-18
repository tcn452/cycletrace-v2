import { NextResponse } from "next/server";
import {
  createAdminServices,
  ensurePlatformSchema,
  requireAppwriteUser,
} from "../../../lib/appwrite/server";

export async function POST(request: Request) {
  try {
    const user = await requireAppwriteUser(request);
    await ensurePlatformSchema();
    const input = await request.json();
    const type = input.type === "insurer" ? "insurer" : "store";
    const { tables, databaseId, ID, Permission, Role } = createAdminServices();
    const submittedAt = new Date().toISOString();
    const reference = `CT-${type === "insurer" ? "INS" : "STR"}-${Date.now().toString(36).toUpperCase()}`;
    const application = await tables.createRow({
      databaseId,
      tableId: "organization_applications",
      rowId: ID.unique(),
      data: {
        type,
        applicantUserId: user.$id,
        applicantEmail: user.email,
        organizationName: String(input.organizationName || ""),
        registrationNumber: String(input.registrationNumber || ""),
        contactName: String(input.contactName || user.name || ""),
        phone: String(input.phone || ""),
        address: String(input.address || ""),
        intendedRole: String(input.intendedRole || "admin"),
        status: "submitted",
        reference,
        submittedAt,
        reviewedAt: "",
        reviewedBy: "",
        notes: "",
      },
      permissions: [Permission.read(Role.user(user.$id))],
    });
    if (type === "store") {
      const store = await tables.createRow({
        databaseId,
        tableId: "store_owners",
        rowId: ID.unique(),
        data: {
          userId: user.$id,
          businessName: application.organizationName,
          contactName: application.contactName,
          email: user.email,
          phone: application.phone,
          address: application.address,
          status: "pending",
          createdAt: submittedAt,
        },
        permissions: [
          Permission.read(Role.user(user.$id)),
          Permission.update(Role.user(user.$id)),
        ],
      });
      await tables.createRow({
        databaseId,
        tableId: "organization_members",
        rowId: ID.unique(),
        data: {
          organizationId: store.$id,
          organizationType: "store",
          userId: user.$id,
          email: user.email,
          role: "admin",
          status: "active",
          invitedBy: user.$id,
          createdAt: submittedAt,
        },
        permissions: [Permission.read(Role.user(user.$id))],
      });
    }
    return NextResponse.json({
      applicationId: application.$id,
      reference,
      status: application.status,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Application could not be submitted.";
    return NextResponse.json(
      {
        error:
          message === "AUTH_REQUIRED"
            ? "Sign in before submitting an organisation application."
            : message,
      },
      { status: message === "AUTH_REQUIRED" ? 401 : 400 },
    );
  }
}
