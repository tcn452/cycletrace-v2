"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { FiArrowRight, FiCheck, FiShield } from "react-icons/fi";
import { DemoShell } from "../../components/DemoShell";
import { OrganizationStatus } from "../../components/OrganizationStatus";
import {
  submitOrganizationApplication,
  trackOnboardingEvent,
} from "../../lib/appwrite/platform";

export default function InsurerOnboardingPage() {
  const [result, setResult] = useState<{
    reference: string;
    status: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const data = await submitOrganizationApplication({
        type: "insurer",
        organizationName: String(form.get("organizationName")),
        registrationNumber: String(form.get("registrationNumber")),
        contactName: String(form.get("contactName")),
        phone: String(form.get("phone")),
        intendedRole: String(form.get("intendedRole")),
      });
      setResult(data);
      trackOnboardingEvent("form_submitted", "insurer");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Application could not be submitted.",
      );
      trackOnboardingEvent("form_error", "insurer");
    } finally {
      setBusy(false);
    }
  }
  if (result)
    return (
      <DemoShell active="Onboarding" showSidebar>
        <div className="success-panel">
          <span className="success-icon">
            <FiCheck />
          </span>
          <h1>
            Application
            <br />
            <span>received.</span>
          </h1>
          <p>
            Keep this reference: <strong>{result.reference}</strong>. Our team
            will review your organisation and access requirements.
          </p>
          <OrganizationStatus status={result.status} />
          <Link className="button button-green" href="/insurer">
            Check workspace <FiArrowRight />
          </Link>
        </div>
      </DemoShell>
    );
  return (
    <DemoShell active="Onboarding" showSidebar>
      <div className="role-form-layout">
        <div className="role-form-intro">
          <h1>
            Bring better
            <br />
            <span>context to cover.</span>
          </h1>
          <p>
            Apply for a private insurer workspace. Reviews normally take 1–2
            business days and no sensitive records are available before
            approval.
          </p>
          <div className="role-trust-note">
            <FiShield />
            <span>
              <strong>Responsible access</strong>
              <small>
                Organization records remain private and role-controlled in
                Appwrite.
              </small>
            </span>
          </div>
          <OrganizationStatus status="submitted" />
        </div>
        <div className="form-card role-form-card">
          <form
            onFocus={() => trackOnboardingEvent("form_started", "insurer")}
            onSubmit={submit}
          >
            <h2>Request insurer access</h2>
            <label>
              Organisation name
              <input name="organizationName" required />
            </label>
            <label>
              Registration or FSP number
              <input name="registrationNumber" required />
            </label>
            <label>
              Contact name
              <input name="contactName" required />
            </label>
            <label>
              Phone number
              <input name="phone" required type="tel" />
            </label>
            <label>
              Intended role
              <select name="intendedRole" defaultValue="admin">
                <option value="admin">Workspace administrator</option>
                <option value="reviewer">Policy reviewer</option>
                <option value="claims">Claims specialist</option>
              </select>
            </label>
            <label className="check-label">
              <input type="checkbox" required /> I am authorised to apply for
              this organisation.
            </label>
            {error && (
              <p className="auth-error" role="alert">
                {error}{" "}
                {error.includes("Sign in") && <Link href="/login">Log in</Link>}
              </p>
            )}
            <button
              className="button button-green"
              disabled={busy}
              type="submit"
            >
              {busy ? "Submitting…" : "Submit application"} <FiArrowRight />
            </button>
          </form>
        </div>
      </div>
    </DemoShell>
  );
}
