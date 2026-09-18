"use client";

import { appwriteAccount } from "./client";
import { createStoreOwner } from "./store";

export type OrganizationType = "store" | "insurer";
export type ApplicationStatus =
  "submitted" | "reviewing" | "approved" | "rejected";

async function authenticatedFetch(path: string, init?: RequestInit) {
  let jwtToken = "";
  try {
    const jwt = await appwriteAccount.createJWT();
    jwtToken = jwt.jwt;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const adminPass =
      typeof window !== "undefined"
        ? window.sessionStorage.getItem("cycletrace_admin_passcode") ||
          (window.sessionStorage.getItem("cycletrace_admin_auth") === "true"
            ? process.env.NEXT_PUBLIC_ADMIN_PASSCODE || "cycletrace-admin"
            : "")
        : "";
    if (!adminPass) {
      if (msg.includes("missing scopes") || msg.includes("guests")) {
        throw new Error("AUTH_REQUIRED");
      }
      throw err;
    }
  }

  const adminPasscode =
    typeof window !== "undefined"
      ? window.sessionStorage.getItem("cycletrace_admin_passcode") ||
        (window.sessionStorage.getItem("cycletrace_admin_auth") === "true"
          ? process.env.NEXT_PUBLIC_ADMIN_PASSCODE || "cycletrace-admin"
          : "")
      : "";

  const response = await fetch(path, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(jwtToken ? { authorization: `Bearer ${jwtToken}` } : {}),
      ...(adminPasscode ? { "x-admin-passcode": adminPasscode } : {}),
      ...(init?.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}

export async function submitOrganizationApplication(
  input: Record<string, string>,
): Promise<{ applicationId: string; reference: string; status: string }> {
  let serverResult: { applicationId?: string; reference?: string; status?: string } | null = null;
  try {
    serverResult = await authenticatedFetch("/api/organizations/apply", {
      method: "POST",
      body: JSON.stringify(input),
    });
  } catch (err) {
    console.warn("Server application notice (falling back to direct store creation):", err);
  }

  if (input.type === "store") {
    const user = await appwriteAccount.get();
    const store = await createStoreOwner({
      businessName: input.organizationName,
      contactName: input.contactName || user.name || "Store Owner",
      email: user.email,
      phone: input.phone || "",
      address: input.address || "",
    });
    return {
      applicationId: serverResult?.applicationId || store.$id,
      reference: serverResult?.reference || `CT-STR-${store.$id.slice(-6).toUpperCase()}`,
      status: store.status,
    };
  }

  if (serverResult && serverResult.reference && serverResult.status) {
    return {
      applicationId: serverResult.applicationId || `app_${Date.now()}`,
      reference: serverResult.reference,
      status: serverResult.status,
    };
  }
  throw new Error("Application could not be submitted.");
}

export async function loadAdminOverview() {
  return authenticatedFetch("/api/admin/overview");
}
export async function reviewApplication(
  applicationId: string,
  status: "approved" | "rejected" | "submitted",
  notes = "",
) {
  return authenticatedFetch("/api/admin/applications", {
    method: "PATCH",
    body: JSON.stringify({ applicationId, status, notes }),
  });
}
export async function inviteOrganizationMember(input: {
  organizationId: string;
  organizationType: OrganizationType;
  email: string;
  role: string;
}) {
  return authenticatedFetch("/api/organizations/invitations", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function trackOnboardingEvent(
  event: string,
  role: string,
  metadata: Record<string, unknown> = {},
) {
  const sessionId =
    window.localStorage.getItem("cycletrace-session-id") || crypto.randomUUID();
  window.localStorage.setItem("cycletrace-session-id", sessionId);
  void fetch("/api/analytics/onboarding", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      event,
      role,
      sessionId,
      path: window.location.pathname,
      metadata,
    }),
  });
}
