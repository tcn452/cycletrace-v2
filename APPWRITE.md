# Appwrite Setup

The CycleTrace Appwrite project is configured in region `fra`.

## Project

- Project: `CycleTrace`
- Project ID: `6aa80c46003e754665f6`
- Endpoint: `https://fra.cloud.appwrite.io/v1`

## Provisioned Resources

- Database: `cycletrace`
- Table: `bikes`
- Storage bucket: `bikephotos`

The `bikes` table stores ownership, bike details, status, and the linked `photoFileId`. The `bikephotos` bucket is private per file, encrypted, antivirus-enabled, and accepts image uploads up to 10 MB.

## Local Setup

Copy `.env.example` to `.env.local` and keep the Appwrite public values there. The frontend SDK uses the public project ID and endpoint; server API keys must never be placed in `NEXT_PUBLIC_*` variables.

When the Appwrite variables are absent, the client preview keeps its local demo behavior. When they are present, the login flow uses Appwrite Account sessions.

## Insurer Workspace Plan

The live insurer workspace should use organization-scoped Appwrite records rather than public bike rows for sensitive insurance data:

- `insurerOrganizations`: insurer name, contact details, plan and status.
- `insurerMembers`: Appwrite user ID, organization ID and role (`admin`, `reviewer`, `claims`).
- `policies`: insurer organization, bike row ID, policy number, insured value, coverage status and dates.
- `verificationChecks`: policy, bike, requester, match confidence, theft status and timestamp.
- `claims`: policy, bike, claimant, claim status, serial match result and supporting file IDs.
- `insurerAuditEvents`: organization, member, action, target record and timestamp.

Sensitive tables should use row-level permissions for the insurer organization. Verification and claims aggregation should run through an Appwrite Function so API keys and cross-organization queries never reach the browser.

## Route Modes

- `/onboarding`: live registration entry point.
- `/dashboard`, `/settings`, `/settings/billing`: live Appwrite-backed owner workspace.
- `/insurer`: live insurer workspace once insurer tables and permissions are connected.
- `/demo`, `/demo/dashboard`, `/demo/insurer`: permanent local demo and onboarding-preview workspaces.
