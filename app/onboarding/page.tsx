"use client";

import Link from "next/link";
import {
  FiArrowRight,
  FiCheck,
  FiClock,
  FiShield,
  FiShoppingBag,
  FiUser,
} from "react-icons/fi";
import { DemoShell } from "../components/DemoShell";
import { trackOnboardingEvent } from "../lib/appwrite/platform";

export default function OnboardingPage() {
  return (
    <DemoShell active="Onboarding">
      <section className="onboarding-hub" aria-labelledby="onboarding-title">
        <div className="onboarding-intro">
          <div>
            <h1 id="onboarding-title">
              Choose how you&apos;ll
              <br />
              <span>use CycleTrace.</span>
            </h1>
            <p>
              Start with the path that matches your role. Each one connects to
              the live CycleTrace registry and guides you through the right
              setup.
            </p>
          </div>
          <div className="onboarding-signin">
            Already registered?{" "}
            <Link href="/login">
              Log in to your workspace <FiArrowRight />
            </Link>
          </div>
        </div>

        <div className="onboarding-choice-layout">
          <nav
            className="onboarding-role-nav"
            aria-label="Choose an onboarding path"
          >
            <a href="#rider">Rider</a>
            <a href="#store">Store</a>
            <a href="#insurer">Insurer</a>
          </nav>
          <article className="onboarding-primary" id="rider">
            <div className="onboarding-path-icon">
              <FiUser />
            </div>
            <div>
              <span className="onboarding-role">For riders</span>
              <h2>Protect your first bike.</h2>
              <p>
                Create your account, add your bike&apos;s identifying details
                and establish a verified ownership record.
              </p>
            </div>
            <ul>
              <li>
                <FiCheck /> Create your secure account
              </li>
              <li>
                <FiCheck /> Add serial number and bike details
              </li>
              <li>
                <FiCheck /> Manage the record from your dashboard
              </li>
            </ul>
            <div className="onboarding-primary-action">
              <Link
                className="button button-green"
                href="/register"
                onClick={() => trackOnboardingEvent("path_selected", "rider")}
              >
                Register my bike <FiArrowRight />
              </Link>
              <span>
                <FiClock /> About 5 minutes
              </span>
            </div>
            <p className="onboarding-price">
              <strong>R24.99 / month</strong> after registration. Cancel from
              billing settings.
            </p>
          </article>

          <div
            className="onboarding-org-paths"
            aria-label="Organisation onboarding paths"
          >
            <div className="onboarding-org-heading">
              <span>Onboarding an organisation?</span>
              <p>Choose the workspace your team needs.</p>
            </div>
            <Link
              className="onboarding-path"
              href="/store-owner/onboarding"
              id="store"
              onClick={() => trackOnboardingEvent("path_selected", "store")}
            >
              <span className="onboarding-path-icon">
                <FiShoppingBag />
              </span>
              <span className="onboarding-path-copy">
                <strong>Store owner</strong>
                <small>
                  Set up a shop profile and register bikes at handover.
                </small>
              </span>
              <span className="onboarding-path-arrow">
                <FiArrowRight />
              </span>
            </Link>
            <Link
              className="onboarding-path"
              href="/insurer/onboarding"
              id="insurer"
              onClick={() => trackOnboardingEvent("path_selected", "insurer")}
            >
              <span className="onboarding-path-icon">
                <FiShield />
              </span>
              <span className="onboarding-path-copy">
                <strong>Insurer</strong>
                <small>
                  Request controlled access for verification and claims.
                </small>
              </span>
              <span className="onboarding-path-arrow">
                <FiArrowRight />
              </span>
            </Link>
            <div className="onboarding-trust-note">
              <FiShield />
              <p>
                <strong>Private by design.</strong> Organisation access is
                reviewed and role-controlled before sensitive records are
                available.
              </p>
            </div>
            <p className="organization-pricing">
              Organisation access is verification-first. Commercial terms are
              confirmed during approval.
            </p>
          </div>
        </div>
      </section>
    </DemoShell>
  );
}
