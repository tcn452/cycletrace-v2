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
