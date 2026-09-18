"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { FiArrowRight, FiCheck, FiShield, FiUserCheck, FiLock } from "react-icons/fi";
import { DemoShell } from "../../components/DemoShell";
import { OrganizationStatus } from "../../components/OrganizationStatus";
import { useAuth } from "../../lib/appwrite/AuthContext";
import { createOrResumeAppwriteAccount } from "../../lib/appwrite/auth";
import {
  submitOrganizationApplication,
  trackOnboardingEvent,
} from "../../lib/appwrite/platform";

export default function InsurerOnboardingPage() {
  const { user, refresh } = useAuth();
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
    const organizationName = String(form.get("organizationName") || "");
    const registrationNumber = String(form.get("registrationNumber") || "");
    const contactName = String(form.get("contactName") || "");
    const phone = String(form.get("phone") || "");
    const intendedRole = String(form.get("intendedRole") || "admin");

    try {
      if (!user) {
        const email = String(form.get("email") || "");
        const password = String(form.get("password") || "");
        if (!email || !password) {
          throw new Error("Please provide your email and password to create your insurer account.");
        }
        await createOrResumeAppwriteAccount(email, password, contactName || organizationName);
        await refresh();
      }

      const data = await submitOrganizationApplication({
        type: "insurer",
        organizationName,
        registrationNumber,
        contactName,
        phone,
        intendedRole,
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
      <DemoShell active="Onboarding">
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
    <DemoShell active="Onboarding">
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
                CycleTrace.
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

            {user ? (
              <div className="auth-account-badge" style={{ padding: "10px 14px", background: "#f3f5f4", borderRadius: "10px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px", fontSize: "12px" }}>
                <FiUserCheck style={{ color: "#173426", fontSize: "16px" }} />
                <span>Applying as <strong>{user.name || user.email}</strong> ({user.email})</span>
              </div>
            ) : (
              <div style={{ marginBottom: "16px", padding: "12px", background: "#f8faf9", borderRadius: "12px", border: "1px solid #e2e8e4" }}>
                <p style={{ margin: "0 0 10px 0", fontSize: "12px", fontWeight: 600, color: "#173426", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FiLock /> Step 1: Your organisation account credentials
                </p>
                <label style={{ display: "block", marginBottom: "8px" }}>
                  Official work email
                  <input name="email" type="email" required placeholder="claims@underwriter.co.za" autoComplete="email" />
                </label>
                <label style={{ display: "block" }}>
                  Account password
                  <input name="password" type="password" required minLength={8} placeholder="Minimum 8 characters" autoComplete="new-password" />
                </label>
                <p style={{ margin: "8px 0 0 0", fontSize: "11px", color: "#6e7772" }}>
                  Already have an account? <Link href="/login" style={{ textDecoration: "underline", color: "#173426" }}>Log in first</Link>
                </p>
              </div>
            )}

            <label>
              Organisation name
              <input name="organizationName" required placeholder="e.g. Mutual Cycle Insurance" />
            </label>
            <label>
              Registration or FSP number
              <input name="registrationNumber" required placeholder="e.g. FSP 45892" />
            </label>
            <label>
              Contact name
              <input name="contactName" required placeholder="Full name of representative" />
            </label>
            <label>
              Phone number
              <input name="phone" required type="tel" placeholder="+27 11 000 0000" />
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
