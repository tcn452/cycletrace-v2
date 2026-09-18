import { Client, TablesDB } from "node-appwrite";

const required = [
  "APPWRITE_ENDPOINT",
  "APPWRITE_PROJECT_ID",
  "APPWRITE_API_KEY",
  "NEXT_PUBLIC_APPWRITE_DATABASE_ID",
];
for (const key of required)
  if (!process.env[key]) throw new Error(`Missing ${key}`);

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);
const tables = new TablesDB(client);
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

const definitions = [
  {
    tableId: "organization_applications",
    name: "Organization Applications",
    rowSecurity: true,
    columns: [
      ["type", "varchar", 20, true],
      ["applicantUserId", "varchar", 64, true],
      ["applicantEmail", "email", undefined, true],
      ["organizationName", "varchar", 255, true],
      ["registrationNumber", "varchar", 120, true],
      ["contactName", "varchar", 255, true],
      ["phone", "varchar", 40, true],
      ["address", "varchar", 500, false],
      ["intendedRole", "varchar", 40, true],
      ["status", "varchar", 30, true],
      ["reference", "varchar", 80, true],
      ["submittedAt", "datetime", undefined, true],
      ["reviewedAt", "varchar", 40, false],
      ["reviewedBy", "varchar", 64, false],
      ["notes", "text", undefined, false],
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
      ["email", "email", undefined, true],
      ["role", "varchar", 40, true],
      ["status", "varchar", 30, true],
      ["invitedBy", "varchar", 64, true],
      ["createdAt", "datetime", undefined, true],
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
      ["metadata", "text", undefined, false],
      ["createdAt", "datetime", undefined, true],
    ],
    indexes: [{ key: "event_idx", type: "key", attributes: ["event"] }],
  },
];

for (const definition of definitions) {
  try {
    await tables.getTable({ databaseId, tableId: definition.tableId });
    console.log(`${definition.tableId}: already exists`);
  } catch {
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
      indexes: definition.indexes,
    });
    console.log(`${definition.tableId}: created`);
  }
}
