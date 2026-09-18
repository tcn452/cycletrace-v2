"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiActivity,
  FiArrowRight,
  FiCheck,
  FiRefreshCw,
  FiShield,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { DemoShell } from "../components/DemoShell";
import { loadAdminOverview, reviewApplication } from "../lib/appwrite/platform";

type Row = Record<string, string> & { $id: string };
type Overview = {
  admin: { name: string; email: string };
  applications: Row[];
  stores: Row[];
  insurers: Row[];
  members: Row[];
  analytics: { totalEvents: number; eventCounts: Record<string, number> };
};

export default function AdminPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  async function load() {
    setError("");
    try {
      setData(await loadAdminOverview());
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Admin workspace could not be loaded.",
      );
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function review(id: string, status: "approved" | "rejected") {
    setBusy(id);
    try {
      await reviewApplication(id, status);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Review failed.");
    } finally {
      setBusy("");
    }
  }
  if (error && !data)
    return (
      <DemoShell>
        <div className="empty-state admin-access">
          <FiShield />
          <h3>Admin access required</h3>
          <p>{error}</p>
          <Link className="button button-dark" href="/login">
            Sign in with an admin account
          </Link>
        </div>
      </DemoShell>
    );
  if (!data)
    return (
      <DemoShell>
        <div className="empty-state">Loading the platform workspace…</div>
      </DemoShell>
    );
  const pending = data.applications.filter(
    (row) => row.status === "submitted" || row.status === "reviewing",
  );
  return (
    <DemoShell active="Platform admin">
      <div className="admin-heading">
        <div>
          <h1>
            Platform
            <br />
            <span>control.</span>
          </h1>
          <p>
            Review organisations, monitor onboarding and manage access from one
            protected workspace.
          </p>
        </div>
        <button className="button button-dark" onClick={load}>
          <FiRefreshCw /> Refresh
        </button>
      </div>
      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}
      <div className="admin-metrics">
        <div>
          <FiActivity />
          <span>Pending applications</span>
          <strong>{pending.length}</strong>
        </div>
        <div>
          <FiShield />
          <span>Verified organisations</span>
          <strong>
            {data.stores.filter((row) => row.status === "verified").length +
              data.insurers.filter((row) => row.status === "active").length}
          </strong>
        </div>
        <div>
          <FiUsers />
          <span>Organisation members</span>
          <strong>{data.members.length}</strong>
        </div>
        <div>
          <FiArrowRight />
          <span>Onboarding events</span>
          <strong>{data.analytics.totalEvents}</strong>
        </div>
      </div>
      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Organisation applications</h2>
            <p>
              Approve only after validating business identity and the
              applicant&apos;s authority.
            </p>
          </div>
          <span>{pending.length} awaiting review</span>
        </div>
        {data.applications.length === 0 ? (
          <div className="empty-state">No organisation applications yet.</div>
        ) : (
          <div className="admin-table">
            <div className="admin-table-head">
              <span>Organisation</span>
              <span>Type</span>
              <span>Reference</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {data.applications.map((row) => (
              <div className="admin-table-row" key={row.$id}>
                <span>
                  <strong>{row.organizationName}</strong>
                  <small>{row.applicantEmail}</small>
                </span>
                <span>{row.type}</span>
                <span>{row.reference}</span>
                <span className={`status status-${row.status}`}>
                  {row.status}
                </span>
                <span className="admin-row-actions">
                  {row.status === "submitted" || row.status === "reviewing" ? (
                    <>
                      <button
                        disabled={busy === row.$id}
                        onClick={() => review(row.$id, "approved")}
                        aria-label={`Approve ${row.organizationName}`}
                      >
                        <FiCheck />
                      </button>
                      <button
                        disabled={busy === row.$id}
                        onClick={() => review(row.$id, "rejected")}
                        aria-label={`Reject ${row.organizationName}`}
                      >
                        <FiX />
                      </button>
                    </>
                  ) : (
                    "Reviewed"
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Onboarding funnel</h2>
            <p>Events collected without customer profile or bike data.</p>
          </div>
        </div>
        <div className="analytics-list">
          {Object.entries(data.analytics.eventCounts).length === 0 ? (
            <p>No onboarding activity has been recorded yet.</p>
          ) : (
            Object.entries(data.analytics.eventCounts).map(([event, count]) => (
              <div key={event}>
                <span>{event.replaceAll("_", " ")}</span>
                <strong>{count}</strong>
              </div>
            ))
          )}
        </div>
      </section>
    </DemoShell>
  );
}
