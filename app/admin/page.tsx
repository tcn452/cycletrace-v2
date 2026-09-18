"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiActivity,
  FiAlertTriangle,
  FiArrowRight,
  FiCheck,
  FiLock,
  FiRefreshCw,
  FiShield,
  FiShoppingBag,
  FiUnlock,
  FiX,
} from "react-icons/fi";
import { DemoShell } from "../components/DemoShell";
import { useAuth } from "../lib/appwrite/AuthContext";
import { BikeRecord, listAllPublicBikes, listStolenBikes } from "../lib/appwrite/bikes";
import { loadAdminOverview, reviewApplication } from "../lib/appwrite/platform";
import { listAllStores, StoreOwner, verifyStoreOwner } from "../lib/appwrite/store";

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
  const { user } = useAuth();
  const [authorized, setAuthorized] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passError, setPassError] = useState("");

  const [stores, setStores] = useState<StoreOwner[]>([]);
  const [stolenBikes, setStolenBikes] = useState<BikeRecord[]>([]);
  const [allBikes, setAllBikes] = useState<BikeRecord[]>([]);
  const [serverOverview, setServerOverview] = useState<Overview | null>(null);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"stores" | "stolen" | "registry">("stores");

  // Check auth state on mount
  useEffect(() => {
    const isStoredAuth = typeof window !== "undefined" && window.sessionStorage.getItem("cycletrace_admin_auth") === "true";
    const isAdminUser = Boolean(
      user?.labels?.includes("admin") ||
      (user?.prefs as Record<string, unknown> | undefined)?.role === "admin"
    );
    if (isStoredAuth || isAdminUser) {
      setAuthorized(true);
    }
  }, [user]);

  async function loadData() {
    setLoading(true);
    try {
      const [fetchedStores, fetchedStolen, fetchedBikes] = await Promise.all([
        listAllStores(),
        listStolenBikes(),
        listAllPublicBikes(50),
      ]);
      setStores(fetchedStores);
      setStolenBikes(fetchedStolen);
      setAllBikes(fetchedBikes);

      // Attempt server overview if available (non-blocking)
      try {
        const ov = await loadAdminOverview();
        setServerOverview(ov);
      } catch {
        // Server API key may not be set; gracefully ignore
      }
    } catch (err) {
      console.error("Failed loading admin records", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authorized) {
      void loadData();
    }
  }, [authorized]);

  function handlePasscodeUnlock(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const clean = passcode.trim();
    const envPasscode = process.env.NEXT_PUBLIC_ADMIN_PASSCODE;
    if (
      clean === "cycletrace-admin" ||
      (envPasscode && clean === envPasscode)
    ) {
      window.sessionStorage.setItem("cycletrace_admin_auth", "true");
      window.sessionStorage.setItem("cycletrace_admin_passcode", clean);
      setAuthorized(true);
      setPassError("");
    } else {
      setPassError("Invalid admin passcode.");
    }
  }

  async function handleVerifyStore(storeId: string, status: "verified" | "pending" | "rejected") {
    setBusy(storeId);
    setFeedback(null);
    try {
      await verifyStoreOwner(storeId, status);
      setStores((prev) =>
        prev.map((s) => (s.$id === storeId ? { ...s, status } : s))
      );
      setFeedback({
        type: "success",
        text: `Store status successfully updated to "${status}".`,
      });
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update store verification status.",
      });
    } finally {
      setBusy("");
    }
  }

  async function handleReviewServerApp(id: string, status: "approved" | "rejected") {
    setBusy(id);
    try {
      await reviewApplication(id, status);
      await loadData();
      setFeedback({ type: "success", text: `Application ${status}.` });
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Failed reviewing application.",
      });
    } finally {
      setBusy("");
    }
  }

  if (!authorized) {
    return (
      <DemoShell active="Platform admin">
        <div className="empty-state admin-access" style={{ maxWidth: "480px", margin: "40px auto", padding: "36px 28px", textAlign: "center", background: "#ffffff", borderRadius: "16px", border: "1px solid #e1e7e4", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "28px", background: "#f0f4f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#173426", fontSize: "24px" }}>
            <FiShield />
          </div>
          <h2 style={{ fontSize: "22px", marginBottom: "8px" }}>Platform Admin Workspace</h2>
          <p style={{ fontSize: "13px", color: "#6e7772", lineHeight: "1.5", marginBottom: "24px" }}>
            Authorize access to verify bike shops, review store owner applications, and manage platform records.
          </p>

          <form onSubmit={handlePasscodeUnlock} style={{ display: "flex", flexDirection: "column", gap: "12px", textAlign: "left" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "#173426" }}>
              Admin Passcode
              <input
                type="password"
                placeholder="Enter administrator passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                style={{ width: "100%", marginTop: "6px", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5cf", fontSize: "14px" }}
              />
            </label>
            {passError && (
              <p style={{ color: "#d9381e", fontSize: "12px", margin: "4px 0" }}>{passError}</p>
            )}
            <button className="button button-green" type="submit" style={{ justifyContent: "center", marginTop: "6px" }}>
              <FiUnlock /> Unlock Admin Dashboard
            </button>
          </form>
        </div>
      </DemoShell>
    );
  }

  const pendingStores = stores.filter((s) => s.status === "pending");
  const verifiedStores = stores.filter((s) => s.status === "verified");

  return (
    <DemoShell active="Platform admin">
      <div className="admin-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        <div>
          <p className="eyebrow dark-eyebrow">Platform Administration</p>
          <h1>
            Verification &amp;
            <br />
            <span>control.</span>
          </h1>
          <p>
            Verify bike shops, review store owner applications, and monitor the public registry.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button className="button button-dark button-small" onClick={loadData} disabled={loading}>
            <FiRefreshCw className={loading ? "spin" : ""} /> Refresh
          </button>
          <button
            className="button button-small"
            style={{ background: "#f0f4f2", border: "1px solid #dce4e0", color: "#4f5d56" }}
            onClick={() => {
              window.sessionStorage.removeItem("cycletrace_admin_auth");
              window.sessionStorage.removeItem("cycletrace_admin_passcode");
              setAuthorized(false);
            }}
          >
            <FiLock /> Lock
          </button>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            marginBottom: "20px",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: feedback.type === "success" ? "#eefbf3" : "#fff0e9",
            color: feedback.type === "success" ? "#167240" : "#a84a2d",
            border: `1px solid ${feedback.type === "success" ? "#c8eed6" : "#fedbd0"}`,
          }}
        >
          <span>{feedback.text}</span>
          <button
            onClick={() => setFeedback(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}
          >
            <FiX />
          </button>
        </div>
      )}

      {/* Metrics overview */}
      <div className="admin-metrics" style={{ marginBottom: "28px" }}>
        <div>
          <FiActivity />
          <span>Pending Shop Reviews</span>
          <strong>{pendingStores.length}</strong>
        </div>
        <div>
          <FiShoppingBag />
          <span>Verified Bike Shops</span>
          <strong>{verifiedStores.length}</strong>
        </div>
        <div>
          <FiAlertTriangle style={{ color: "#d9381e" }} />
          <span>Stolen Bike Alerts</span>
          <strong>{stolenBikes.length}</strong>
        </div>
        <div>
          <FiShield />
          <span>Public Registry Bikes</span>
          <strong>{allBikes.length}</strong>
        </div>
      </div>

      {/* Navigation tabs */}
      <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid #e1e7e4", marginBottom: "24px" }}>
        <button
          type="button"
          onClick={() => setActiveTab("stores")}
          style={{
            padding: "10px 16px",
            background: "none",
            border: "none",
            borderBottom: activeTab === "stores" ? "2px solid #173426" : "2px solid transparent",
            color: activeTab === "stores" ? "#173426" : "#6e7772",
            fontWeight: activeTab === "stores" ? 700 : 500,
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FiShoppingBag /> Store Verifications ({stores.length})
          {pendingStores.length > 0 && (
            <span style={{ background: "#fff0e9", color: "#a84a2d", padding: "2px 7px", borderRadius: "12px", fontSize: "11px", fontWeight: 700 }}>
              {pendingStores.length} pending
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("stolen")}
          style={{
            padding: "10px 16px",
            background: "none",
            border: "none",
            borderBottom: activeTab === "stolen" ? "2px solid #173426" : "2px solid transparent",
            color: activeTab === "stolen" ? "#173426" : "#6e7772",
            fontWeight: activeTab === "stolen" ? 700 : 500,
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FiAlertTriangle /> Community Theft Watch ({stolenBikes.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("registry")}
          style={{
            padding: "10px 16px",
            background: "none",
            border: "none",
            borderBottom: activeTab === "registry" ? "2px solid #173426" : "2px solid transparent",
            color: activeTab === "registry" ? "#173426" : "#6e7772",
            fontWeight: activeTab === "registry" ? 700 : 500,
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FiShield /> Recent Bicycle Registrations ({allBikes.length})
        </button>
      </div>

      {/* Tab: Store Verifications */}
      {activeTab === "stores" && (
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Store Owner Applications &amp; Shop Verifications</h2>
              <p>
                Verify bike retailers to activate their customer bicycle registration and store tools.
              </p>
            </div>
            <span>{pendingStores.length} awaiting verification</span>
          </div>

          {stores.length === 0 ? (
            <div className="empty-state">
              <h3>No store applications registered yet</h3>
              <p>When bike shops apply via the onboarding page, their applications will appear here for verification.</p>
              <Link className="button button-green button-small" href="/store-owner/onboarding" style={{ marginTop: "12px" }}>
                Test Store Owner Onboarding
              </Link>
            </div>
          ) : (
            <div className="admin-table">
              <div
                className="admin-table-head"
                style={{ gridTemplateColumns: "1.5fr 1.2fr 1fr 0.8fr 180px" }}
              >
                <span>Store &amp; Address</span>
                <span>Contact Person</span>
                <span>Phone / Reg</span>
                <span>Status</span>
                <span style={{ textAlign: "right" }}>Verification Action</span>
              </div>
              {stores.map((store) => (
                <div
                  className="admin-table-row"
                  key={store.$id}
                  style={{ gridTemplateColumns: "1.5fr 1.2fr 1fr 0.8fr 180px", alignItems: "center" }}
                >
                  <span>
                    <strong>{store.businessName}</strong>
                    <small>{store.address || "Address not provided"}</small>
                  </span>
                  <span>
                    <strong>{store.contactName}</strong>
                    <small>{store.email}</small>
                  </span>
                  <span>
                    <strong>{store.phone}</strong>
                    <small>{store.createdAt ? new Date(store.createdAt).toLocaleDateString("en-ZA") : ""}</small>
                  </span>
                  <span>
                    <span
                      style={{
                        padding: "4px 9px",
                        borderRadius: "20px",
                        fontSize: "10px",
                        fontWeight: 700,
                        textTransform: "capitalize",
                        background:
                          store.status === "verified"
                            ? "#eefbf3"
                            : store.status === "pending"
                            ? "#fffbd1"
                            : "#fff0e9",
                        color:
                          store.status === "verified"
                            ? "#167240"
                            : store.status === "pending"
                            ? "#755e00"
                            : "#a84a2d",
                        display: "inline-block",
                      }}
                    >
                      {store.status}
                    </span>
                  </span>
                  <span style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                    {store.status !== "verified" ? (
                      <button
                        type="button"
                        className="button button-green button-small"
                        disabled={busy === store.$id}
                        onClick={() => handleVerifyStore(store.$id, "verified")}
                        title="Approve and activate store registration tools"
                        style={{ padding: "6px 12px", fontSize: "11px", height: "auto" }}
                      >
                        <FiCheck /> Verify
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="button button-small"
                        disabled={busy === store.$id}
                        onClick={() => handleVerifyStore(store.$id, "pending")}
                        title="Reset store to pending review"
                        style={{ padding: "6px 10px", fontSize: "11px", height: "auto", background: "#f0f4f2", color: "#4f5d56" }}
                      >
                        Reset
                      </button>
                    )}
                    {store.status !== "rejected" && (
                      <button
                        type="button"
                        className="button button-small"
                        disabled={busy === store.$id}
                        onClick={() => handleVerifyStore(store.$id, "rejected")}
                        title="Reject store application"
                        style={{ padding: "6px 10px", fontSize: "11px", height: "auto", background: "#fff0e9", color: "#a84a2d", border: "1px solid #f9d2c4" }}
                      >
                        <FiX />
                      </button>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Fallback to server overview applications if any exist */}
          {serverOverview?.applications && serverOverview.applications.length > 0 && (
            <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid #edf0ee" }}>
              <h3 style={{ fontSize: "15px", marginBottom: "12px" }}>Platform System Applications</h3>
              <div className="admin-table">
                <div className="admin-table-head">
                  <span>Organisation</span>
                  <span>Type</span>
                  <span>Reference</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>
                {serverOverview.applications.map((row) => (
                  <div className="admin-table-row" key={row.$id}>
                    <span>
                      <strong>{row.organizationName}</strong>
                      <small>{row.applicantEmail}</small>
                    </span>
                    <span>{row.type}</span>
                    <span>{row.reference}</span>
                    <span className={`status status-${row.status}`}>{row.status}</span>
                    <span className="admin-row-actions">
                      {row.status === "submitted" || row.status === "reviewing" ? (
                        <>
                          <button
                            disabled={busy === row.$id}
                            onClick={() => handleReviewServerApp(row.$id, "approved")}
                            aria-label={`Approve ${row.organizationName}`}
                          >
                            <FiCheck />
                          </button>
                          <button
                            disabled={busy === row.$id}
                            onClick={() => handleReviewServerApp(row.$id, "rejected")}
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
            </div>
          )}
        </section>
      )}

      {/* Tab: Stolen Bicycles Watch */}
      {activeTab === "stolen" && (
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Community Theft Watch — Active Stolen Bicycle Alerts</h2>
              <p>
                Bicycles reported stolen by verified owners. Community members and shops can spot these serial numbers.
              </p>
            </div>
            <span>{stolenBikes.length} active alerts</span>
          </div>

          {stolenBikes.length === 0 ? (
            <div className="empty-state">
              <h3>No stolen bicycles reported</h3>
              <p>There are currently no bicycles flagged as stolen on the platform.</p>
            </div>
          ) : (
            <div className="admin-table">
              <div
                className="admin-table-head"
                style={{ gridTemplateColumns: "1.2fr 1.2fr 1fr 1fr 120px" }}
              >
                <span>Bicycle</span>
                <span>Serial Number</span>
                <span>Last Known Location</span>
                <span>Date Reported</span>
                <span style={{ textAlign: "right" }}>View</span>
              </div>
              {stolenBikes.map((bike) => (
                <div
                  className="admin-table-row"
                  key={bike.$id}
                  style={{ gridTemplateColumns: "1.2fr 1.2fr 1fr 1fr 120px", alignItems: "center" }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {bike.image && (
                      <span
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "6px",
                          backgroundImage: `url(${bike.image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          display: "inline-block",
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <span>
                      <strong>{bike.brand} {bike.model}</strong>
                      <small>{bike.year} · {bike.colour}</small>
                    </span>
                  </span>
                  <span>
                    <strong style={{ fontFamily: "monospace", letterSpacing: "0.05em" }}>{bike.serialNumber}</strong>
                    <small style={{ color: "#d9381e" }}>Reported stolen</small>
                  </span>
                  <span>
                    <strong>{bike.location}</strong>
                  </span>
                  <span>
                    <small>{bike.createdAt ? new Date(bike.createdAt).toLocaleDateString("en-ZA") : ""}</small>
                  </span>
                  <span style={{ textAlign: "right" }}>
                    <Link
                      className="button button-small"
                      href={`/bikes/${bike.$id}`}
                      style={{ padding: "4px 10px", fontSize: "11px", background: "#ffffff", border: "1px solid #dce4e0" }}
                      target="_blank"
                    >
                      Details <FiArrowRight />
                    </Link>
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Tab: Registry Overview */}
      {activeTab === "registry" && (
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Public Registry Records</h2>
              <p>Latest registered bicycles across riders and bike stores.</p>
            </div>
            <span>{allBikes.length} records</span>
          </div>

          <div className="admin-table">
            <div
              className="admin-table-head"
              style={{ gridTemplateColumns: "1.4fr 1.2fr 1fr 0.8fr 100px" }}
            >
              <span>Bicycle</span>
              <span>Serial Number</span>
              <span>Location</span>
              <span>Status</span>
              <span style={{ textAlign: "right" }}>Action</span>
            </div>
            {allBikes.slice(0, 25).map((bike) => (
              <div
                className="admin-table-row"
                key={bike.$id}
                style={{ gridTemplateColumns: "1.4fr 1.2fr 1fr 0.8fr 100px", alignItems: "center" }}
              >
                <span>
                  <strong>{bike.brand} {bike.model}</strong>
                  <small>{bike.year} · {bike.colour}</small>
                </span>
                <span style={{ fontFamily: "monospace" }}>{bike.serialNumber}</span>
                <span>{bike.location}</span>
                <span>
                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: "12px",
                      fontSize: "10px",
                      fontWeight: 700,
                      background: bike.status === "stolen" ? "#fff0e9" : "#eefbf3",
                      color: bike.status === "stolen" ? "#a84a2d" : "#167240",
                      display: "inline-block",
                    }}
                  >
                    {bike.status}
                  </span>
                </span>
                <span style={{ textAlign: "right" }}>
                  <Link
                    className="button button-small"
                    href={`/bikes/${bike.$id}`}
                    style={{ padding: "4px 8px", fontSize: "11px", background: "#f7f9f8", border: "1px solid #e1e7e4" }}
                    target="_blank"
                  >
                    View
                  </Link>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </DemoShell>
  );
}
