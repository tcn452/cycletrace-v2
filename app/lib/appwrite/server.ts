import {
  Account,
  Client,
  ID,
  Permission,
  Query,
  Role,
  Storage,
  TablesDB,
  Users,
} from "node-appwrite";

const endpoint =
  process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId =
  process.env.APPWRITE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const apiKey = process.env.APPWRITE_API_KEY;

export function hasAdminServices(): boolean {
  return Boolean(
    endpoint &&
    projectId &&
    databaseId &&
    apiKey &&
    apiKey !== "[SENSITIVE]"
  );
}

function requireConfig() {
  if (!endpoint || !projectId || !databaseId || !apiKey || apiKey === "[SENSITIVE]")
    throw new Error("Appwrite server configuration is incomplete.");
}

export function createAdminServices() {
  requireConfig();
  const client = new Client()
    .setEndpoint(endpoint!)
    .setProject(projectId!)
    .setKey(apiKey!);
  return {
    account: new Account(client),
    storage: new Storage(client),
    tables: new TablesDB(client),
    users: new Users(client),
    databaseId: databaseId!,
    ID,
    Query,
    Permission,
    Role,
  };
}

const platformTables = [
  {
    tableId: "organization_applications",
    name: "Organization Applications",
    rowSecurity: true,
    columns: [
      ["type", "varchar", 20, true],
      ["applicantUserId", "varchar", 64, true],
      ["applicantEmail", "email", 0, true],
      ["organizationName", "varchar", 255, true],
      ["registrationNumber", "varchar", 120, true],
      ["contactName", "varchar", 255, true],
      ["phone", "varchar", 40, true],
      ["address", "varchar", 500, false],
      ["intendedRole", "varchar", 40, true],
      ["status", "varchar", 30, true],
      ["reference", "varchar", 80, true],
      ["submittedAt", "datetime", 0, true],
      ["reviewedAt", "varchar", 40, false],
      ["reviewedBy", "varchar", 64, false],
      ["notes", "text", 0, false],
    ],
    indexes: [
      { key: "applicant_idx", type: "key", attributes: ["applicantUserId"] },
      { key: "status_idx", type: "key", attributes: ["status"] },
      { key: "reference_unique", type: "unique", attributes: ["reference"] },
    ],
  },
  {
    tableId: "organization_members",
    name: "Organization Members",
    rowSecurity: true,
    columns: [
      ["organizationId", "varchar", 64, true],
      ["organizationType", "varchar", 20, true],
      ["userId", "varchar", 64, false],
      ["email", "email", 0, true],
      ["role", "varchar", 40, true],
      ["status", "varchar", 30, true],
      ["invitedBy", "varchar", 64, true],
      ["createdAt", "datetime", 0, true],
    ],
    indexes: [
      {
        key: "org_user_role_idx",
        type: "key",
        attributes: ["organizationId", "userId", "role"],
      },
      { key: "email_idx", type: "key", attributes: ["email"] },
    ],
  },
  {
    tableId: "onboarding_events",
    name: "Onboarding Events",
    rowSecurity: false,
    columns: [
      ["event", "varchar", 60, true],
      ["role", "varchar", 30, true],
      ["sessionId", "varchar", 80, true],
      ["path", "varchar", 255, true],
      ["metadata", "text", 0, false],
      ["createdAt", "datetime", 0, true],
    ],
    indexes: [{ key: "event_idx", type: "key", attributes: ["event"] }],
  },
] as const;

export async function ensurePlatformSchema() {
  const { tables, databaseId } = createAdminServices();
  await Promise.all(
    platformTables.map(async (definition) => {
      try {
        await tables.getTable({ databaseId, tableId: definition.tableId });
      } catch {
        try {
          await tables.createTable({
            databaseId,
            tableId: definition.tableId,
            name: definition.name,
            rowSecurity: definition.rowSecurity,
            columns: definition.columns.map(([key, type, size, required]) => ({
              key,
              type,
              ...(size ? { size } : {}),
              required,
            })),
            indexes: definition.indexes.map((index) => ({
              ...index,
              attributes: [...index.attributes],
            })),
          });
        } catch (error) {
          if (!(
            error &&
            typeof error === "object" &&
            "code" in error &&
            error.code === 409
          ))
            throw error;
        }
      }
    }),
  );
}

export async function requireAppwriteUser(request: Request) {
  requireConfig();
  const jwt = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!jwt) throw new Error("AUTH_REQUIRED");
  const client = new Client()
    .setEndpoint(endpoint!)
    .setProject(projectId!)
    .setJWT(jwt);
  return new Account(client).get();
}

export async function requirePlatformAdmin(request: Request) {
  const adminPasscode = request.headers.get("x-admin-passcode");
  const configuredPasscode = process.env.NEXT_PUBLIC_ADMIN_PASSCODE || "cycletrace-admin";
  if (adminPasscode && adminPasscode.trim() === configuredPasscode.trim()) {
    return {
      $id: "admin-system",
      name: "Platform Administrator",
      email: "admin@cycletrace.co.za",
      labels: ["admin"],
      prefs: { role: "admin" },
    };
  }

  const user = await requireAppwriteUser(request);
  const prefs = user.prefs as Record<string, unknown>;
  const allowlist = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  if (
    !user.labels?.includes("admin") &&
    prefs.role !== "admin" &&
    !allowlist.includes(user.email.toLowerCase())
  )
    throw new Error("ADMIN_REQUIRED");
  return user;
}
