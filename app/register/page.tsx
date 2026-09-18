"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, FormEvent, Suspense, useEffect, useState } from "react";
import {
  FiArrowRight,
  FiCamera,
  FiCheck,
  FiShield,
  FiUploadCloud,
} from "react-icons/fi";
import { DemoShell } from "../components/DemoShell";
import { AppwriteException } from "appwrite";
import { useAuth } from "../lib/appwrite/AuthContext";
import { createOrResumeAppwriteAccount } from "../lib/appwrite/auth";
import { createAppwriteBike } from "../lib/appwrite/bikes";

const emptyForm = {
  brand: "",
  model: "",
  year: "",
  colour: "",
  serialNumber: "",
  location: "",
  ownerName: "",
  email: "",
  password: "",
};

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAddBike = searchParams.get("mode") === "bike";
  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState(isAddBike ? 2 : 1);
  const [createdBikeId, setCreatedBikeId] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [bikeForm, setBikeForm] = useState(emptyForm);
  const [registrationError, setRegistrationError] = useState("");
  const [saving, setSaving] = useState(false);
  const [accountReady, setAccountReady] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        if (!isAddBike) {
          router.replace("/dashboard");
        } else {
          setAccountReady(true);
          setStep((prev) => (prev === 1 ? 2 : prev));
          setBikeForm((prev) => ({
            ...prev,
            ownerName: prev.ownerName || user.name || "",
            email: prev.email || user.email || "",
          }));
        }
      }
    }
  }, [user, authLoading, isAddBike, router]);

  function update(field: keyof typeof bikeForm, value: string) {
    setBikeForm((current) => ({ ...current, [field]: value }));
  }
  function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 10_000_000) {
      setRegistrationError("The bike photo must be smaller than 10 MB.");
      event.target.value = "";
      return;
    }
    setPhotoFile(file);
    setPhotoName(file.name);
    setPhotoPreview(URL.createObjectURL(file));
  }
  async function next(event: FormEvent) {
    event.preventDefault();
    setRegistrationError("");
    if (step === 1) {
      setSaving(true);
      try {
        await createOrResumeAppwriteAccount(
          bikeForm.email,
          bikeForm.password,
          bikeForm.ownerName,
        );
        setAccountReady(true);
        setStep(2);
      } catch (error) {
        handleRegistrationError(error, "account");
      } finally {
        setSaving(false);
      }
      return;
    }
    if (step === 2) {
      setStep(step + 1);
      return;
    }
    if (!photoFile) {
      setRegistrationError("Please add a clear photo of your bike.");
      return;
    }
    setSaving(true);
    try {
      if (!accountReady) {
        await createOrResumeAppwriteAccount(
          bikeForm.email,
          bikeForm.password,
          bikeForm.ownerName,
        );
      }
      const bike = await createAppwriteBike({
        brand: bikeForm.brand,
        model: bikeForm.model,
        year: Number(bikeForm.year),
        colour: bikeForm.colour,
        serialNumber: bikeForm.serialNumber,
        location: bikeForm.location,
        status: "protected",
        createdAt: new Date().toISOString(),
        photo: photoFile,
      });
      setCreatedBikeId(bike.$id);
    } catch (error) {
      handleRegistrationError(error, "bike");
    } finally {
      setSaving(false);
    }
  }

  function handleRegistrationError(error: unknown, stage: "account" | "bike") {
    console.error(`[${stage}-registration] failed`, error);
    if (error instanceof AppwriteException) {
      if (error.code === 401)
        setRegistrationError(
          "That password was not accepted for this email address. Check it and try again.",
        );
      else if (error.code === 409)
        setRegistrationError(
          stage === "account"
            ? "An account already exists for this email. Enter its password to continue."
            : "That serial number is already registered. Sign in to view the existing record.",
        );
      else if (error.code === 413)
        setRegistrationError(
          "The bike photo is too large. Choose a smaller image and try again.",
        );
      else
        setRegistrationError(
          `Could not save the ${stage}: ${error.message}`,
        );
    } else {
      setRegistrationError(
        error instanceof Error
          ? error.message
          : `We could not save the ${stage}. Check your details and try again.`,
      );
    }
  }

  const stepCopy = {
    1: {
      title: "Start with your account.",
      body: "Your secure account keeps every ownership record connected to you.",
    },
    2: {
      title: isAddBike ? "Add your bike." : "Now add your bike.",
      body: "Capture the details that identify it and help prove ownership.",
    },
    3: {
      title: "Check the record.",
      body: "Make sure everything is accurate before the bike goes on the map.",
    },
  }[step] || {
    title: "Now add your bike.",
    body: "Capture the details that identify it and help prove ownership.",
  };

  if (authLoading || (!isAddBike && user)) {
    return (
      <DemoShell active="My bikes">
        <div className="empty-state">
          <p>Checking authentication…</p>
        </div>
      </DemoShell>
    );
  }

  if (createdBikeId)
    return (
      <DemoShell active="My bikes">
        <div className="success-panel">
          <span className="success-icon">
            <FiCheck />
          </span>
          <p className="eyebrow dark-eyebrow">Bike registered</p>
          <h1>
            Your bike is now
            <br />
            <span>on the map.</span>
          </h1>
          <p>
            The live record for {bikeForm.brand} {bikeForm.model} has
            been created.
          </p>
          <div className="success-code">
            REGISTRATION ID <strong>{createdBikeId}</strong>
          </div>
          <div className="success-actions">
            <Link className="button button-green" href="/dashboard">
              Go to my dashboard <FiArrowRight />
            </Link>
            <Link
              className="text-link dark-link"
              href={`/bikes/${createdBikeId}`}
            >
              View public record <FiArrowRight />
            </Link>
          </div>
        </div>
      </DemoShell>
    );

  return (
    <DemoShell active="My bikes">
      <div className="form-layout">
        <div className="form-intro">
          <h1>{stepCopy.title}</h1>
          <p>{stepCopy.body}</p>
        </div>
        <div className="form-card">
          <div className="form-progress">
            {!isAddBike && (
              <span className={step >= 1 ? "active" : ""}>01 Account</span>
            )}
            <span className={step >= 2 ? "active" : ""}>
              {isAddBike ? "01" : "02"} Bike details
            </span>
            <span className={step > 2 ? "active" : ""}>
              {isAddBike ? "02" : "03"} Review
            </span>
          </div>
          <form onSubmit={next}>
            {step === 1 && (
              <>
                <h2>Create or continue your account</h2>
                <p className="form-helper">
                  Already registered? Use the same email and password to pick up
                  where you left off.
                </p>
                <label>
                  Full name
                  <input
                    required
                    disabled={accountReady}
                    value={bikeForm.ownerName}
                    onChange={(e) => update("ownerName", e.target.value)}
                    autoComplete="name"
                  />
                </label>
                <label>
                  Email address
                  <input
                    required
                    disabled={accountReady}
                    type="email"
                    autoComplete="email"
                    value={bikeForm.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="you@example.com"
                  />
                </label>
                <label>
                  Password
                  <input
                    required
                    disabled={accountReady}
                    minLength={8}
                    type="password"
                    autoComplete="new-password"
                    value={bikeForm.password}
                    onChange={(e) => update("password", e.target.value)}
                    placeholder="At least 8 characters"
                  />
                </label>
                {accountReady && (
                  <div className="account-ready-note">
                    <FiCheck /> Account session ready
                  </div>
                )}
              </>
            )}
            {step === 2 && (
              <>
                <h2>Tell us about your bike</h2>
                <p className="form-helper">
                  Enter the identifying details exactly as they appear on the
                  bike.
                </p>
                <div className="field-grid">
                  <label>
                    Brand
                    <input
                      required
                      value={bikeForm.brand}
                      onChange={(e) => update("brand", e.target.value)}
                      placeholder="e.g. Specialized"
                    />
                  </label>
                  <label>
                    Model
                    <input
                      required
                      value={bikeForm.model}
                      onChange={(e) => update("model", e.target.value)}
                      placeholder="e.g. Allez Sport"
                    />
                  </label>
                  <label>
                    Year
                    <input
                      required
                      type="number"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      value={bikeForm.year}
                      onChange={(e) => update("year", e.target.value)}
                      placeholder="2024"
                    />
                  </label>
                  <label>
                    Colour
                    <input
                      required
                      value={bikeForm.colour}
                      onChange={(e) => update("colour", e.target.value)}
                      placeholder="Frame colour"
                    />
                  </label>
                </div>
                <label>
                  Serial number
                  <input
                    required
                    value={bikeForm.serialNumber}
                    onChange={(e) => update("serialNumber", e.target.value)}
                    placeholder="Find this stamped on the frame"
                  />
                </label>
                <label>
                  Where do you keep your bike?
                  <input
                    required
                    value={bikeForm.location}
                    onChange={(e) => update("location", e.target.value)}
                    placeholder="City or suburb"
                  />
                </label>
                <label className="photo-upload">
                  <span className="photo-upload-preview">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Selected bike" />
                    ) : (
                      <FiCamera />
                    )}
                  </span>
                  <span>
                    <strong>
                      {photoName || "Add a clear photo of your bike"}
                    </strong>
                    <small>Include the frame and identifying details</small>
                  </span>
                  <input
                    required
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={selectPhoto}
                  />
                  <FiUploadCloud />
                </label>
                <label className="check-label">
                  <input type="checkbox" required /> I confirm that I own this
                  bike and the details are accurate.
                </label>
              </>
            )}
            {step === 3 && (
              <>
                <div className="registration-review">
                  <div className="registration-review-photo">
                    {photoPreview && (
                      <img
                        src={photoPreview}
                        alt={`${bikeForm.brand} ${bikeForm.model}`}
                      />
                    )}
                    <span className="registration-review-status">
                      <FiShield /> Ready to protect
                    </span>
                  </div>
                  <div className="registration-review-heading">
                    <div>
                      <h2>
                        {bikeForm.brand} {bikeForm.model}
                      </h2>
                      <span>Serial {bikeForm.serialNumber}</span>
                    </div>
                    <strong>{bikeForm.year}</strong>
                  </div>
                  <dl className="registration-review-details">
                    <div>
                      <dt>Owner</dt>
                      <dd>{bikeForm.ownerName}</dd>
                    </div>
                    <div>
                      <dt>Location</dt>
                      <dd>{bikeForm.location}</dd>
                    </div>
                    <div>
                      <dt>Colour</dt>
                      <dd>{bikeForm.colour}</dd>
                    </div>
                    <div>
                      <dt>Photo</dt>
                      <dd>{photoName}</dd>
                    </div>
                  </dl>
                </div>
                <label className="registration-review-confirmation">
                  <input type="checkbox" required />
                  <span>
                    I confirm these details are accurate and agree to the{" "}
                    <Link href="/terms">terms</Link> and{" "}
                    <Link href="/privacy">privacy policy</Link>.
                  </span>
                </label>
              </>
            )}
            {registrationError && (
              <p className="auth-error" role="alert">
                {registrationError}
              </p>
            )}
            <div className="form-actions">
              <button
                className="button button-green"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? step === 1
                    ? "Securing account…"
                    : "Registering bike…"
                  : step === 3
                    ? "Complete registration"
                    : "Continue"}{" "}
                <FiArrowRight />
              </button>
              {step > (isAddBike ? 2 : 1) && !saving && (
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setStep(step - 1)}
                >
                  Back
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </DemoShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <DemoShell active="My bikes">
          <div className="empty-state">
            <p>Loading…</p>
          </div>
        </DemoShell>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
