import { FiCheck, FiClock, FiShield } from "react-icons/fi";

export function OrganizationStatus({ status }: { status: string }) {
  const steps = ["submitted", "reviewing", "approved"];
  const current =
    status === "verified" || status === "active"
      ? 2
      : Math.max(0, steps.indexOf(status));
  return (
    <div
      className="organization-status"
      aria-label={`Application status: ${status}`}
    >
      {steps.map((step, index) => (
        <div className={index <= current ? "complete" : ""} key={step}>
          <span>
            {index < current ? (
              <FiCheck />
            ) : index === current ? (
              <FiClock />
            ) : (
              <FiShield />
            )}
          </span>
          <strong>
            {step === "submitted"
              ? "Submitted"
              : step === "reviewing"
                ? "Verification"
                : "Workspace active"}
          </strong>
        </div>
      ))}
    </div>
  );
}
