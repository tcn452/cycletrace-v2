import { NextResponse } from "next/server";
import {
  createAdminServices,
  ensurePlatformSchema,
  requireAppwriteUser,
} from "../../../lib/appwrite/server";

export async function POST(request: Request) {
  try {
    const inviter = await requireAppwriteUser(request);
    await ensurePlatformSchema();
    const input = await request.json();
    const { tables, users, databaseId, Query, ID, Permission, Role } =
      createAdminServices();
    const memberships = await tables.listRows({
      databaseId,
      tableId: "organization_members",
      queries: [
        Query.equal("organizationId", input.organizationId),
        Query.equal("userId", inviter.$id),
        Query.equal("role", "admin"),
        Query.limit(1),
      ],
    });
    if (!memberships.rows[0])
      throw new Error("Only organisation administrators can invite members.");
    const matches = await users.list({
      queries: [
        Query.equal("email", String(input.email).toLowerCase()),
        Query.limit(1),
      ],
    });
    const invitedUser = matches.users[0];
    const status = invitedUser ? "active" : "invited";
    const row = await tables.createRow({
      databaseId,
      tableId: "organization_members",
      rowId: ID.unique(),
      data: {
        organizationId: input.organizationId,
        organizationType: input.organizationType,
        userId: invitedUser?.$id || "",
        email: String(input.email).toLowerCase(),
        role: String(input.role || "viewer"),
        status,
        invitedBy: inviter.$id,
        createdAt: new Date().toISOString(),
      },
      permissions: invitedUser
        ? [Permission.read(Role.user(invitedUser.$id))]
        : [],
    });
    if (invitedUser && input.organizationType === "insurer")
      await tables.createRow({
        databaseId,
        tableId: "insurer_members",
        rowId: ID.unique(),
        data: {
          organizationId: input.organizationId,
          userId: invitedUser.$id,
          email: invitedUser.email,
          role: input.role,
        },
        permissions: [Permission.read(Role.user(invitedUser.$id))],
      });
    return NextResponse.json({ invitationId: row.$id, status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invitation failed." },
      { status: 403 },
    );
  }
}
