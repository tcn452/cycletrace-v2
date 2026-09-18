"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiArrowRight,
  FiCheck,
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
            Register customer bikes and verify records from your store
            workspace.
          </p>
        </div>
        <Link className="button button-green" href="/store-owner/register">
          <FiPlus /> Register a customer bike
        </Link>
      </div>
      <div className="store-banner">
        <span className="store-banner-icon">
          <FiShoppingBag />
        </span>
        <div>
          <strong>Store status: {store.status}</strong>
          <p>
            {store.status === "verified"
              ? "Your registration tools are active."
              : "Verification normally takes 1–2 business days."}
          </p>
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
          <span>Protected</span>
          <strong>
            {bikes.filter((bike) => bike.status === "protected").length}
          </strong>
          <small>Live records</small>
        </div>
        <div>
          <span>Shop status</span>
          <strong className="green-text">{store.status}</strong>
          <small>Verified status</small>
        </div>
      </div>
      <section className="store-actions">
        <div className="store-action-card">
          <span className="store-action-icon">
            <FiShoppingBag />
          </span>
          <h2>Register a bike</h2>
          <p>Capture customer ownership details and a bike photo.</p>
          <Link className="button button-dark" href="/store-owner/register">
            Start registration <FiArrowRight />
          </Link>
        </div>
        <div className="store-action-card">
          <span className="store-action-icon">
            <FiShield />
          </span>
          <h2>Verify a record</h2>
          <p>Search the live public registry.</p>
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
