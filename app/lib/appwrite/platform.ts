"use client";

import { appwriteAccount } from "./client";

export type OrganizationType = "store" | "insurer";
export type ApplicationStatus =
  "submitted" | "reviewing" | "approved" | "rejected";

async function authenticatedFetch(path: string, init?: RequestInit) {
  const jwt = await appwriteAccount.createJWT();
  const response = await fetch(path, {
    ...init,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${jwt.jwt}`,
      ...(init?.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}

export async function submitOrganizationApplication(
  input: Record<string, string>,
) {
  return authenticatedFetch("/api/organizations/apply", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function loadAdminOverview() {
  return authenticatedFetch("/api/admin/overview");
}
export async function reviewApplication(
  applicationId: string,
  status: "approved" | "rejected",
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
