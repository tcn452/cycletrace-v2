"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { FiArrowRight, FiCheck, FiShoppingBag, FiUserCheck, FiLock } from "react-icons/fi";
import { DemoShell } from "../../components/DemoShell";
import { OrganizationStatus } from "../../components/OrganizationStatus";
import { useAuth } from "../../lib/appwrite/AuthContext";
import { createOrResumeAppwriteAccount } from "../../lib/appwrite/auth";
import {
  submitOrganizationApplication,
  trackOnboardingEvent,
} from "../../lib/appwrite/platform";

export default function StoreOwnerOnboardingPage() {
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
    const businessName = String(form.get("businessName") || "");
    const registrationNumber = String(form.get("registrationNumber") || "");
    const contactName = String(form.get("contactName") || "");
    const phone = String(form.get("phone") || "");
    const address = String(form.get("address") || "");

    try {
      // If user is a guest, create or resume account first so scopes exist
      if (!user) {
        const email = String(form.get("email") || "");
        const password = String(form.get("password") || "");
        if (!email || !password) {
          throw new Error("Please provide your email and password to create your shop account.");
        }
        await createOrResumeAppwriteAccount(email, password, contactName || businessName);
        await refresh();
      }

      const data = await submitOrganizationApplication({
        type: "store",
        organizationName: businessName,
        registrationNumber,
        contactName,
        phone,
        address,
        intendedRole: "admin",
      });
      await refresh();
      setResult(data);
      trackOnboardingEvent("form_submitted", "store");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "The store application could not be submitted.",
      );
      trackOnboardingEvent("form_error", "store");
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
            Store application
            <br />
            <span>received.</span>
          </h1>
          <p>
            Reference <strong>{result.reference}</strong>. Verification normally
            takes 1–2 business days.
          </p>
          <OrganizationStatus status={result.status} />
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "16px" }}>
            <Link className="button button-green" href="/store-owner">
              Open store workspace <FiArrowRight />
            </Link>
          </div>
        </div>
      </DemoShell>
    );

  return (
    <DemoShell active="Onboarding">
      <div className="role-form-layout">
        <div className="role-form-intro">
          <h1>
            Turn every
            <br />
            <span>sale into trust.</span>
          </h1>
          <p>
            Submit your shop details, and we will verify the business
            before customer registration tools are activated. Have your company or
            sole-proprietor registration details ready.
          </p>
          <div className="role-trust-note">
            <FiShoppingBag />
            <span>
              <strong>For bike shops &amp; retailers</strong>
              <small>Typical review time: 1–2 business days.</small>
            </span>
          </div>
          <OrganizationStatus status="submitted" />
        </div>
        <div className="form-card role-form-card">
          <form
            onFocus={() => trackOnboardingEvent("form_started", "store")}
            onSubmit={submit}
          >
            <h2>Create your store profile</h2>

            {user ? (
              <div className="auth-account-badge" style={{ padding: "10px 14px", background: "#f3f5f4", borderRadius: "10px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px", fontSize: "12px" }}>
                <FiUserCheck style={{ color: "#173426", fontSize: "16px" }} />
                <span>Applying as <strong>{user.name || user.email}</strong> ({user.email})</span>
              </div>
            ) : (
              <div style={{ marginBottom: "16px", padding: "12px", background: "#f8faf9", borderRadius: "12px", border: "1px solid #e2e8e4" }}>
                <p style={{ margin: "0 0 10px 0", fontSize: "12px", fontWeight: 600, color: "#173426", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FiLock /> Step 1: Your shop account credentials
                </p>
                <label style={{ display: "block", marginBottom: "8px" }}>
                  Store manager email
                  <input name="email" type="email" required placeholder="manager@bikeshop.co.za" autoComplete="email" />
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
              Business name
              <input name="businessName" required placeholder="e.g. Cycle Hub Cape Town" />
            </label>
            <label>
              Registration or VAT number
              <input name="registrationNumber" required placeholder="e.g. 2021/123456/07" />
            </label>
            <label>
              Store address
              <input name="address" required placeholder="Street address, City, Postal Code" />
            </label>
            <label>
              Contact name
              <input name="contactName" required placeholder="Full name of manager or owner" />
            </label>
            <label>
              Phone number
              <input name="phone" required type="tel" placeholder="+27 21 000 0000" />
            </label>
            <label className="check-label">
              <input type="checkbox" required /> I confirm these details are
              accurate and I can represent this business.
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
              {busy ? "Submitting…" : "Submit store application"}{" "}
              <FiArrowRight />
            </button>
          </form>
        </div>
      </div>
    </DemoShell>
  );
}
