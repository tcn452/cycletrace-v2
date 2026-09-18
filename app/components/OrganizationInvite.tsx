"use client";

import { FormEvent, useState } from "react";
import { FiSend } from "react-icons/fi";
import {
  inviteOrganizationMember,
  OrganizationType,
} from "../lib/appwrite/platform";

export function OrganizationInvite({
  organizationId,
  organizationType,
}: {
  organizationId: string;
  organizationType: OrganizationType;
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await inviteOrganizationMember({
        organizationId,
        organizationType,
        email: String(form.get("email")),
        role: String(form.get("role")),
      });
      setMessage(
        result.status === "active"
          ? "Team member added."
          : "Invitation recorded. They will be linked when their CycleTrace account is available.",
      );
      event.currentTarget.reset();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Invitation could not be created.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="team-invite">
      <div>
        <h2>Invite your team</h2>
        <p>Add colleagues with only the access they need.</p>
      </div>
      <form onSubmit={submit}>
        <input
          aria-label="Team member email"
          name="email"
          type="email"
          placeholder="colleague@company.co.za"
          required
        />
        <select
          aria-label="Team member role"
          name="role"
          defaultValue={
            organizationType === "insurer" ? "reviewer" : "registrar"
          }
        >
          {organizationType === "insurer" ? (
            <>
              <option value="reviewer">Reviewer</option>
              <option value="claims">Claims</option>
              <option value="admin">Administrator</option>
            </>
          ) : (
            <>
              <option value="registrar">Registrar</option>
              <option value="viewer">Read only</option>
              <option value="admin">Administrator</option>
            </>
          )}
        </select>
        <button className="button button-dark" disabled={busy} type="submit">
          {busy ? "Inviting…" : "Invite"} <FiSend />
        </button>
      </form>
      {message && (
        <p className="form-message" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
