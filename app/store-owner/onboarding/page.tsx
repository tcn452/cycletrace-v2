"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { FiArrowRight, FiCheck, FiShoppingBag } from "react-icons/fi";
import { DemoShell } from "../../components/DemoShell";
import { OrganizationStatus } from "../../components/OrganizationStatus";
import {
  submitOrganizationApplication,
  trackOnboardingEvent,
} from "../../lib/appwrite/platform";

export default function StoreOwnerOnboardingPage() {
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
        type: "store",
        organizationName: String(form.get("businessName")),
        registrationNumber: String(form.get("registrationNumber")),
        contactName: String(form.get("contactName")),
        phone: String(form.get("phone")),
        address: String(form.get("address")),
        intendedRole: "admin",
      });
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
      <DemoShell active="Onboarding" showSidebar>
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
          <Link className="button button-green" href="/store-owner">
            Check store workspace <FiArrowRight />
          </Link>
        </div>
      </DemoShell>
    );
  return (
    <DemoShell active="Onboarding" showSidebar>
      <div className="role-form-layout">
        <div className="role-form-intro">
          <h1>
            Turn every
            <br />
            <span>sale into trust.</span>
          </h1>
          <p>
            Sign in, submit your shop details, and we will verify the business
            before registration tools are activated. Have your company or
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
            <label>
              Business name
              <input name="businessName" required />
            </label>
            <label>
              Registration number
              <input name="registrationNumber" required />
            </label>
            <label>
              Store address
              <input name="address" required />
            </label>
            <label>
              Contact name
              <input name="contactName" required />
            </label>
            <label>
              Phone number
              <input name="phone" required type="tel" />
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
