import Link from "next/link";
import { FiArrowRight, FiArrowUpRight, FiShield } from "react-icons/fi";
import { DemoShell } from "../components/DemoShell";

export default function OrganizationsPage() {
  return (
    <DemoShell active="Overview">
      <div className="org-hero">
        <div>
          <p className="eyebrow dark-eyebrow">For organisations</p>
          <h1>
            Make every
            <br />
            <span>bike count.</span>
          </h1>
          <p>
            Give your shop, insurer or community a live way to register, verify
            and protect bikes.
          </p>
          <Link
            className="button button-green"
            href="/onboarding"
          >
            Choose your onboarding path <FiArrowUpRight />
          </Link>
        </div>
        <div className="org-stat-card">
          <span className="live-label">
            <i /> Appwrite connected
          </span>
          <FiShield />
          <p>
            Organization workspaces use private, role-controlled records rather
            than sample portfolio data.
          </p>
        </div>
      </div>
      <section className="org-benefits">
        <p className="eyebrow dark-eyebrow">One shared record</p>
        <h2>
          Tools that fit
          <br />
          <span>your workflow.</span>
        </h2>
        <div className="benefit-grid">
          <div>
            <strong>01</strong>
            <h3>Verify before you sell</h3>
            <p>
              Search the public registry and keep stolen bikes out of the
              market.
            </p>
          </div>
          <div>
            <strong>02</strong>
            <h3>Register at scale</h3>
            <p>Create records linked to a verified organization.</p>
          </div>
          <div>
            <strong>03</strong>
            <h3>Control access</h3>
            <p>
              Use Appwrite memberships and row permissions to keep sensitive
              records private.
            </p>
          </div>
        </div>
      </section>
      <section className="org-cta">
        <h2>
          Ready to make a<br />
          <em>safer cycle?</em>
        </h2>
        <div className="org-cta-actions">
          <Link
            className="button button-green"
            href="/store-owner/onboarding"
          >
            Onboard a store <FiArrowUpRight />
          </Link>
          <Link className="text-link light-link" href="/insurer/onboarding">
            Onboard an insurer <FiArrowRight />
          </Link>
        </div>
      </section>
    </DemoShell>
  );
}
