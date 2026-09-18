"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiArrowRight,
  FiCheck,
  FiLock,
  FiPlus,
  FiShield,
  FiShoppingBag,
} from "react-icons/fi";
import { DemoShell } from "../components/DemoShell";
import { OrganizationInvite } from "../components/OrganizationInvite";
import { OrganizationStatus } from "../components/OrganizationStatus";
import { getStoreWorkspace } from "../lib/appwrite/store";

type Workspace = Awaited<ReturnType<typeof getStoreWorkspace>>;

export default function StoreOwnerPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>();
  useEffect(() => {
    getStoreWorkspace()
      .then(setWorkspace)
      .catch(() => setWorkspace(null));
  }, []);
  if (workspace === undefined)
    return (
      <DemoShell showSidebar>
        <div className="empty-state">Loading store records…</div>
      </DemoShell>
    );
  if (!workspace)
    return (
      <DemoShell showSidebar>
        <div className="empty-state">
          <h3>Sign in to continue</h3>
          <Link className="button button-green" href="/login">
            Sign in
          </Link>
        </div>
      </DemoShell>
    );
  if (!workspace.store)
    return (
      <DemoShell showSidebar>
        <div className="empty-state">
          <h3>No store profile found</h3>
          <p>Create a store-owner record for this account.</p>
          <Link className="button button-green" href="/store-owner/onboarding">
            Create store profile
          </Link>
        </div>
      </DemoShell>
    );
  const { store, bikes } = workspace;
  const isVerified = store.status === "verified";

  return (
    <DemoShell active="Overview" showSidebar>
      <div className="store-heading">
        <div>
          <p className="eyebrow dark-eyebrow">
            Shop workspace · {store.businessName}
          </p>
          <h1>
            Live store
            <br />
            <span>records.</span>
          </h1>
          <p>
            {isVerified
              ? "Register customer bikes and manage records from your verified shop workspace."
              : "Your shop application is awaiting administrator verification before tools are activated."}
          </p>
        </div>
        {isVerified ? (
          <Link className="button button-green" href="/store-owner/register">
            <FiPlus /> Register a customer bike
          </Link>
        ) : (
          <button
            className="button"
            disabled
            style={{
              opacity: 0.6,
              cursor: "not-allowed",
              background: "#e2e8e5",
              color: "#6e7974",
              border: "1px solid #cbd5d0",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <FiLock /> Registration locked (Pending verification)
          </button>
        )}
      </div>

      <div
        className="store-banner"
        style={
          !isVerified
            ? {
                background: "#fff9e6",
                border: "1px solid #fae69e",
                borderRadius: "12px",
                padding: "16px 20px",
              }
            : undefined
        }
      >
        <span
          className="store-banner-icon"
          style={!isVerified ? { background: "#f5a623", color: "#ffffff" } : undefined}
        >
          {isVerified ? <FiShoppingBag /> : <FiLock />}
        </span>
        <div>
          <strong style={{ fontSize: "15px" }}>
            {isVerified
              ? "Store Status: Verified"
              : store.status === "rejected"
              ? "Store Status: Application Rejected"
              : "Store Status: Pending Administrator Verification"}
          </strong>
          <p style={{ margin: "4px 0 0 0", fontSize: "13px" }}>
            {isVerified
              ? "Your registration tools are active. You can register customer bicycles directly to your shop workspace."
              : "Registration tools are locked until CycleTrace administrators verify your shop credentials. Verification normally takes 1–2 business days."}
          </p>
          {!isVerified && (
            <div style={{ marginTop: "10px" }}>
              <Link
                href="/admin"
                className="button button-small button-dark"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11px",
                  padding: "6px 12px",
                }}
              >
                <FiShield /> Verify this store in Admin Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
      <OrganizationStatus status={store.status} />

      <div className="dashboard-stats">
        <div>
          <span>Bikes registered</span>
          <strong>{bikes.length}</strong>
          <small>Live records</small>
        </div>
        <div>
          <span>Active records</span>
          <strong>
            {bikes.filter((bike) => bike.status !== "stolen").length}
          </strong>
          <small>In registry</small>
        </div>
        <div>
          <span>Shop status</span>
          <strong className={isVerified ? "green-text" : "status-pending"}>
            {store.status}
          </strong>
          <small>{isVerified ? "Tools active" : "Locked pending review"}</small>
        </div>
      </div>

      <section className="store-actions">
        <div className="store-action-card">
          <span className="store-action-icon">
            <FiShoppingBag />
          </span>
          <h2>Register a customer bike</h2>
          <p>
            {isVerified
              ? "Capture customer ownership details and create a verified registry record."
              : "Registration tools are locked until your shop profile is approved by an administrator."}
          </p>
          {isVerified ? (
            <Link className="button button-dark" href="/store-owner/register">
              Start registration <FiArrowRight />
            </Link>
          ) : (
            <button
              className="button"
              disabled
              style={{
                opacity: 0.6,
                cursor: "not-allowed",
                background: "#f0f4f2",
                color: "#7b8681",
                border: "1px solid #dce2df",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <FiLock /> Verification required
            </button>
          )}
        </div>
        <div className="store-action-card">
          <span className="store-action-icon">
            <FiShield />
          </span>
          <h2>Verify a record</h2>
          <p>Search the live public registry before accepting trade-ins.</p>
          <Link className="button button-dark" href="/search">
            Search registry <FiArrowRight />
          </Link>
        </div>
      </section>
      <section className="store-recent">
        <div className="section-title">
          <div>
            <p className="eyebrow dark-eyebrow">Shop activity</p>
            <h2>
              Recent <span>registrations.</span>
            </h2>
          </div>
        </div>
        {bikes.length === 0 ? (
          <div className="empty-state">
            No bikes have been registered by this store.
          </div>
        ) : (
          <div className="store-table">
            {bikes.map((bike) => (
              <div key={bike.$id}>
                <strong>
                  {bike.brand} {bike.model}
                </strong>
                <span>{bike.serialNumber}</span>
                <b>
                  <FiCheck /> {bike.status}
                </b>
              </div>
            ))}
          </div>
        )}
      </section>
      {store.status === "verified" && (
        <OrganizationInvite
          organizationId={store.$id}
          organizationType="store"
        />
      )}
    </DemoShell>
  );
}
