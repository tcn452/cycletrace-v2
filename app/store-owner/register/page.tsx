"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiArrowUpRight,
  FiCheck,
  FiLock,
  FiPlus,
  FiShield,
  FiShoppingBag,
  FiUploadCloud,
  FiUser,
} from "react-icons/fi";
import { DemoShell } from "../../components/DemoShell";
import { BikeRecord, createAppwriteBike } from "../../lib/appwrite/bikes";
import { getStoreWorkspace, StoreOwner } from "../../lib/appwrite/store";

export default function StoreOwnerRegisterPage() {
  const router = useRouter();
  const [workspace, setWorkspace] = useState<{
    store: StoreOwner | null;
  } | null | undefined>(undefined);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [createdBike, setCreatedBike] = useState<BikeRecord | null>(null);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [form, setForm] = useState({
    brand: "",
    model: "",
    year: String(new Date().getFullYear()),
    colour: "",
    serialNumber: "",
    location: "",
    customerName: "",
    customerContact: "",
  });

  useEffect(() => {
    getStoreWorkspace()
      .then((data) => {
        setWorkspace(data);
        if (data?.store?.address) {
          setForm((prev) => ({
            ...prev,
            location: prev.location || data.store.address,
          }));
        }
      })
      .catch(() => setWorkspace(null));
  }, []);

  function handleFieldChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handlePhotoSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10_000_000) {
      setError("Bike photo must be smaller than 10 MB.");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function resetForm() {
    setCreatedBike(null);
    setPhotoFile(null);
    setPhotoPreview("");
    setError("");
    setForm({
      brand: "",
      model: "",
      year: String(new Date().getFullYear()),
      colour: "",
      serialNumber: "",
      location: workspace?.store?.address || "",
      customerName: "",
      customerContact: "",
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!workspace?.store) return;
    if (!photoFile) {
      setError("Please attach a photo of the bicycle.");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const newBike = await createAppwriteBike(
        {
          brand: form.brand.trim(),
          model: form.model.trim(),
          year: Number(form.year) || new Date().getFullYear(),
          colour: form.colour.trim(),
          serialNumber: form.serialNumber.trim().toUpperCase(),
          location: form.location.trim() || workspace.store.address || "South Africa",
          status: "protected",
          createdAt: new Date().toISOString(),
          photo: photoFile,
          ownerType: "store",
        },
        workspace.store.$id,
      );
      setCreatedBike(newBike);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not complete customer bicycle registration.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (workspace === undefined) {
    return (
      <DemoShell active="Register bike" showSidebar>
        <div className="empty-state">Loading store credentials…</div>
      </DemoShell>
    );
  }

  if (!workspace || !workspace.store) {
    return (
      <DemoShell active="Register bike" showSidebar>
        <div className="empty-state">
          <FiShoppingBag style={{ fontSize: "32px", color: "#173426", marginBottom: "12px" }} />
          <h3>Store profile not found</h3>
          <p>Please register your bike shop before using store registration tools.</p>
          <Link className="button button-green" href="/store-owner/onboarding" style={{ marginTop: "12px" }}>
            Create store profile
          </Link>
        </div>
      </DemoShell>
    );
  }

  const { store } = workspace;
  const isVerified = store.status === "verified";

  // BLOCK THE SHOP IF NOT VERIFIED
  if (!isVerified) {
    return (
      <DemoShell active="Register bike" showSidebar>
        <div
          className="empty-state"
          style={{
            maxWidth: "540px",
            margin: "40px auto",
            padding: "36px 28px",
            textAlign: "center",
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #fedbd0",
            boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "28px",
              background: "#fff0e9",
              color: "#a84a2d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: "24px",
            }}
          >
            <FiLock />
          </div>
          <h2 style={{ fontSize: "22px", marginBottom: "8px", color: "#173426" }}>
            Store Verification Required
          </h2>
          <p style={{ color: "#6e7772", fontSize: "14px", lineHeight: "1.5", marginBottom: "24px" }}>
            Customer bicycle registration is currently locked for <strong>{store.businessName}</strong>.
            Your shop application is pending administrator verification in the CycleTrace Admin Dashboard.
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link className="button button-dark" href="/store-owner">
              <FiArrowLeft /> Return to store workspace
            </Link>
            <Link className="button button-green" href="/admin">
              <FiShield /> Open Admin Dashboard
            </Link>
          </div>
        </div>
      </DemoShell>
    );
  }

  // SUCCESS STATE
  if (createdBike) {
    return (
      <DemoShell active="Register bike" showSidebar>
        <div
          className="success-panel"
          style={{
            maxWidth: "560px",
            margin: "30px auto",
            padding: "36px 28px",
            textAlign: "center",
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #c8eed6",
          }}
        >
          <span
            className="success-icon"
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "28px",
              background: "#eefbf3",
              color: "#167240",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: "24px",
            }}
          >
            <FiCheck />
          </span>
          <h1 style={{ fontSize: "26px", marginBottom: "6px" }}>
            Customer bike
            <br />
            <span style={{ color: "#167240" }}>registered.</span>
          </h1>
          <p style={{ color: "#4f5d56", fontSize: "14px", marginBottom: "20px" }}>
            Frame serial <strong>{createdBike.serialNumber}</strong> ({createdBike.brand} {createdBike.model}) has been permanently linked to <strong>{store.businessName}</strong> in the live registry.
          </p>

          <div
            style={{
              background: "#f8faf9",
              padding: "16px",
              borderRadius: "12px",
              marginBottom: "24px",
              textAlign: "left",
              fontSize: "13px",
              display: "grid",
              gap: "8px",
            }}
          >
            <div>
              <span style={{ color: "#7b8681" }}>Registered by: </span>
              <strong>{store.businessName}</strong>
            </div>
            <div>
              <span style={{ color: "#7b8681" }}>Serial Number: </span>
              <strong style={{ fontFamily: "monospace" }}>{createdBike.serialNumber}</strong>
            </div>
            {form.customerName && (
              <div>
                <span style={{ color: "#7b8681" }}>Customer: </span>
                <strong>{form.customerName}</strong> {form.customerContact ? `(${form.customerContact})` : ""}
              </div>
            )}
            <div>
              <span style={{ color: "#7b8681" }}>Registry Status: </span>
              <span style={{ color: "#167240", fontWeight: 700 }}>Verified active</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link className="button button-green" href="/store-owner">
              <FiArrowLeft /> Return to store workspace
            </Link>
            <button className="button button-dark" onClick={resetForm} type="button">
              <FiPlus /> Register another bike
            </button>
          </div>

          <div style={{ marginTop: "16px" }}>
            <Link
              href={`/bikes/${createdBike.$id}`}
              target="_blank"
              style={{ fontSize: "12px", color: "#173426", textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: "4px" }}
            >
              View live record in public registry <FiArrowUpRight />
            </Link>
          </div>
        </div>
      </DemoShell>
    );
  }

  // ACTIVE REGISTRATION FORM
  return (
    <DemoShell active="Register bike" showSidebar>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <Link
            href="/store-owner"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              color: "#6e7772",
              marginBottom: "12px",
            }}
          >
            <FiArrowLeft /> Back to store workspace
          </Link>
          <p className="eyebrow dark-eyebrow">Shop workspace · {store.businessName}</p>
          <h1>
            Register a
            <br />
            <span>customer bike.</span>
          </h1>
          <p style={{ color: "#6e7772", fontSize: "14px" }}>
            Record the frame serial number, bicycle details and customer handover information to create a verified public ownership record.
          </p>
        </div>

        <div className="form-card" style={{ background: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid #dce2df" }}>
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
            <h2 style={{ fontSize: "18px", margin: "0 0 4px 0", color: "#173426" }}>Bicycle Details</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <label>
                Brand
                <input
                  required
                  placeholder="e.g. Specialized, Trek, Scott"
                  value={form.brand}
                  onChange={(e) => handleFieldChange("brand", e.target.value)}
                />
              </label>
              <label>
                Model
                <input
                  required
                  placeholder="e.g. Rockhopper Expert 29"
                  value={form.model}
                  onChange={(e) => handleFieldChange("model", e.target.value)}
                />
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
              <label>
                Year
                <input
                  required
                  type="number"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  value={form.year}
                  onChange={(e) => handleFieldChange("year", e.target.value)}
                />
              </label>
              <label>
                Colour
                <input
                  required
                  placeholder="e.g. Satin Forest Green"
                  value={form.colour}
                  onChange={(e) => handleFieldChange("colour", e.target.value)}
                />
              </label>
              <label>
                Store location / City
                <input
                  required
                  placeholder="e.g. Cape Town"
                  value={form.location}
                  onChange={(e) => handleFieldChange("location", e.target.value)}
                />
              </label>
            </div>

            <label>
              Frame serial number
              <input
                required
                placeholder="e.g. WSBC012345678"
                style={{ fontFamily: "monospace", letterSpacing: "0.05em", textTransform: "uppercase" }}
                value={form.serialNumber}
                onChange={(e) => handleFieldChange("serialNumber", e.target.value)}
              />
              <small style={{ color: "#7b8681", display: "block", marginTop: "4px" }}>
                Usually stamped underneath the bottom bracket shell.
              </small>
            </label>

            {/* Photo Upload */}
            <div style={{ marginTop: "8px" }}>
              <label style={{ display: "block", marginBottom: "6px" }}>Bicycle photo</label>
              <div
                style={{
                  border: "2px dashed #cbd5d0",
                  borderRadius: "12px",
                  padding: "20px",
                  textAlign: "center",
                  background: "#f9faf9",
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  required
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0,
                    cursor: "pointer",
                    width: "100%",
                    height: "100%",
                  }}
                />
                {photoPreview ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", justifyContent: "center" }}>
                    <img
                      src={photoPreview}
                      alt="Bike preview"
                      style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }}
                    />
                    <div style={{ textAlign: "left" }}>
                      <p style={{ margin: 0, fontWeight: 600, color: "#173426", fontSize: "14px" }}>Photo attached</p>
                      <small style={{ color: "#6e7772" }}>Click to change image</small>
                    </div>
                  </div>
                ) : (
                  <div>
                    <FiUploadCloud style={{ fontSize: "32px", color: "#75817c", marginBottom: "8px" }} />
                    <p style={{ margin: "0 0 4px 0", fontWeight: 600, color: "#173426", fontSize: "14px" }}>
                      Upload bicycle photo
                    </p>
                    <small style={{ color: "#75817c" }}>PNG, JPG or WebP up to 10 MB</small>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Details */}
            <div style={{ marginTop: "12px", paddingTop: "16px", borderTop: "1px solid #edf0ee" }}>
              <h2 style={{ fontSize: "18px", margin: "0 0 12px 0", color: "#173426" }}>Customer Handover Details</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <label>
                  Customer name
                  <input
                    placeholder="Full name of buyer"
                    value={form.customerName}
                    onChange={(e) => handleFieldChange("customerName", e.target.value)}
                  />
                </label>
                <label>
                  Customer email or phone
                  <input
                    placeholder="e.g. buyer@example.co.za or phone"
                    value={form.customerContact}
                    onChange={(e) => handleFieldChange("customerContact", e.target.value)}
                  />
                </label>
              </div>
            </div>

            {error && (
              <p className="auth-error" role="alert" style={{ margin: "8px 0 0 0" }}>
                {error}
              </p>
            )}

            <button
              className="button button-green full-button"
              type="submit"
              disabled={saving}
              style={{ marginTop: "12px", justifyContent: "center", height: "48px", fontSize: "15px" }}
            >
              {saving ? "Registering customer bike…" : "Complete customer bike registration"}{" "}
              <FiArrowRight />
            </button>
          </form>
        </div>
      </div>
    </DemoShell>
  );
}

