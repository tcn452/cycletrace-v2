"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiArrowRight,
  FiCheck,
  FiFileText,
  FiLock,
  FiPlus,
  FiPrinter,
  FiRepeat,
  FiShield,
  FiShoppingBag,
} from "react-icons/fi";
import { DemoShell } from "../components/DemoShell";
import { OrganizationInvite } from "../components/OrganizationInvite";
import { OrganizationStatus } from "../components/OrganizationStatus";
import { getStoreWorkspace } from "../lib/appwrite/store";
import { listStoreTransfers, OwnershipTransfer } from "../lib/appwrite/transfers";

type Workspace = Awaited<ReturnType<typeof getStoreWorkspace>>;

export default function StoreOwnerPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>();
  const [transfers, setTransfers] = useState<OwnershipTransfer[]>([]);
  const [activeTab, setActiveTab] = useState<"stock" | "transfers">("stock");

  useEffect(() => {
    getStoreWorkspace()
      .then((ws) => {
        setWorkspace(ws);
        if (ws?.store?.$id) {
          listStoreTransfers(ws.store.$id).then(setTransfers).catch(() => {});
        }
      })
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
  const stockBikes = bikes.filter((b) => b.status !== "transferred");

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
            <span>inventory &amp; sales.</span>
          </h1>
          <p>
            {isVerified
              ? "Register shop stock, transfer ownership to bikers, and generate verified paper trail certificates."
              : "Your shop application is awaiting administrator verification before tools are activated."}
          </p>
        </div>
        {isVerified ? (
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link className="button button-green" href="/store-owner/register">
              <FiPlus /> Register stock bike
            </Link>
            <Link
              className="button button-dark"
              href="/store-owner/transfer"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <FiRepeat /> Transfer to biker
            </Link>
          </div>
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
              ? "Store Status: Verified Retailer"
              : store.status === "rejected"
              ? "Store Status: Application Rejected"
              : "Store Status: Pending Administrator Verification"}
          </strong>
          <p style={{ margin: "4px 0 0 0", fontSize: "13px" }}>
            {isVerified
              ? "Your registration and stock transfer tools are active. All customer handovers generate a verifiable digital paper trail."
              : "Registration and transfer tools are locked until CycleTrace administrators verify your shop credentials. Verification normally takes 1–2 business days."}
          </p>
        </div>
      </div>
      <OrganizationStatus status={store.status} />

      <div className="dashboard-stats">
        <div>
          <span>Stock in store</span>
          <strong>{stockBikes.length}</strong>
          <small>Available inventory</small>
        </div>
        <div>
          <span>Transferred to bikers</span>
          <strong>{transfers.length}</strong>
          <small>Verified paper trail</small>
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
          <h2>Register shop inventory</h2>
          <p>
            {isVerified
              ? "Add new stock or customer bicycles to your shop registry."
              : "Registration tools are locked until your shop profile is approved by an administrator."}
          </p>
          {isVerified ? (
            <Link className="button button-dark" href="/store-owner/register">
              Register stock <FiArrowRight />
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
            <FiRepeat />
          </span>
          <h2>Transfer stock to biker</h2>
          <p>
            {isVerified
              ? "Hand over stock to a buyer with an invoice reference and digital certificate."
              : "Transfer tools unlock once your retailer account is verified."}
          </p>
          {isVerified ? (
            <Link className="button button-green" href="/store-owner/transfer">
              Transfer to customer <FiArrowRight />
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
          <h2>Verify registry record</h2>
          <p>Check the national public registry before accepting second-hand trade-ins.</p>
          <Link className="button button-dark" href="/search">
            Search registry <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* Inventory and Paper Trail Tabs */}
      <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid #e1e7e4", margin: "32px 0 24px" }}>
        <button
          type="button"
          onClick={() => setActiveTab("stock")}
          style={{
            padding: "10px 16px",
            background: "none",
            border: "none",
            borderBottom: activeTab === "stock" ? "2px solid #173426" : "2px solid transparent",
            color: activeTab === "stock" ? "#173426" : "#6e7772",
            fontWeight: activeTab === "stock" ? 700 : 500,
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FiShoppingBag /> Shop Stock Inventory ({stockBikes.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("transfers")}
          style={{
            padding: "10px 16px",
            background: "none",
            border: "none",
            borderBottom: activeTab === "transfers" ? "2px solid #173426" : "2px solid transparent",
            color: activeTab === "transfers" ? "#173426" : "#6e7772",
            fontWeight: activeTab === "transfers" ? 700 : 500,
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FiFileText /> Customer Handover Paper Trail ({transfers.length})
        </button>
      </div>

      {/* TAB 1: Shop Stock Inventory */}
      {activeTab === "stock" && (
        <section className="store-recent">
          <div className="section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p className="eyebrow dark-eyebrow">Available Stock</p>
              <h2>
                Shop Inventory <span>in store.</span>
              </h2>
            </div>
            {isVerified && (
              <Link className="button button-green button-small" href="/store-owner/register">
                <FiPlus /> Add stock bike
              </Link>
            )}
          </div>

          {stockBikes.length === 0 ? (
            <div className="empty-state">
              <h3>No bicycles currently in shop stock</h3>
              <p>Register new stock or customer bicycles to start building your store inventory.</p>
              {isVerified && (
                <Link className="button button-green button-small" href="/store-owner/register" style={{ marginTop: "12px" }}>
                  Register a bicycle
                </Link>
              )}
            </div>
          ) : (
            <div className="store-table">
              {stockBikes.map((bike) => (
                <div
                  key={bike.$id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.4fr 1.2fr 100px 160px",
                    alignItems: "center",
                    gap: "12px",
                  }}
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
                      <strong>
                        {bike.brand} {bike.model}
                      </strong>
                      <small>{bike.year} · {bike.colour}</small>
                    </span>
                  </span>
                  <span style={{ fontFamily: "monospace", letterSpacing: "0.05em" }}>
                    {bike.serialNumber}
                  </span>
                  <span>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "12px",
                        fontSize: "10px",
                        fontWeight: 700,
                        background: "#eefbf3",
                        color: "#167240",
                        display: "inline-block",
                      }}
                    >
                      In Stock
                    </span>
                  </span>
                  <span style={{ textAlign: "right" }}>
                    {isVerified ? (
                      <Link
                        className="button button-small"
                        href={`/store-owner/transfer?bikeId=${bike.$id}`}
                        style={{
                          padding: "4px 10px",
                          fontSize: "11px",
                          background: "#ffffff",
                          border: "1px solid #cbd5cf",
                          color: "#173426",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <FiRepeat /> Transfer to biker
                      </Link>
                    ) : (
                      <small style={{ color: "#7b8681" }}>Locked</small>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 2: Customer Handover Paper Trail Log */}
      {activeTab === "transfers" && (
        <section className="store-recent">
          <div className="section-title">
            <div>
              <p className="eyebrow dark-eyebrow">Digital Paper Trail</p>
              <h2>
                Ownership <span>Handover Log.</span>
              </h2>
              <p style={{ fontSize: "13px", color: "#6e7772" }}>
                Official commercial transfer records and certificates issued to customers.
              </p>
            </div>
          </div>

          {transfers.length === 0 ? (
            <div className="empty-state">
              <h3>No customer handovers recorded yet</h3>
              <p>When you transfer stock to buyers, their digital certificates and invoice records will appear here.</p>
              {isVerified && stockBikes.length > 0 && (
                <Link className="button button-green button-small" href="/store-owner/transfer" style={{ marginTop: "12px" }}>
                  Transfer stock to customer
                </Link>
              )}
            </div>
          ) : (
            <div className="store-table">
              {transfers.map((t) => (
                <div
                  key={t.$id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.4fr 1.2fr 1fr 150px",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <span>
                    <strong>
                      {t.bikeSummary?.brand || "Bike"} {t.bikeSummary?.model || "Transfer"}
                    </strong>
                    <small style={{ fontFamily: "monospace" }}>
                      SN: {t.bikeSummary?.serialNumber || "Recorded"} · Ref: {t.invoiceRef || "N/A"}
                    </small>
                  </span>
                  <span>
                    <strong>{t.toName}</strong>
                    <small>{t.toEmail}</small>
                  </span>
                  <span>
                    <small>{new Date(t.createdAt).toLocaleDateString("en-ZA")}</small>
                    <span
                      style={{
                        padding: "2px 6px",
                        borderRadius: "8px",
                        fontSize: "10px",
                        fontWeight: 700,
                        background: "#eefbf3",
                        color: "#167240",
                        display: "inline-block",
                        marginLeft: "6px",
                      }}
                    >
                      <FiCheck /> Transferred
                    </span>
                  </span>
                  <span style={{ textAlign: "right" }}>
                    <Link
                      className="button button-small"
                      href={`/store-owner/transfers/${t.$id}/certificate`}
                      style={{
                        padding: "4px 10px",
                        fontSize: "11px",
                        background: "#ffffff",
                        border: "1px solid #cbd5cf",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <FiPrinter /> Certificate
                    </Link>
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {store.status === "verified" && (
        <OrganizationInvite
          organizationId={store.$id}
          organizationType="store"
        />
      )}
    </DemoShell>
  );
}

