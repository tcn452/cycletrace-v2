"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiArrowUpRight,
  FiGrid,
  FiHelpCircle,
  FiHome,
  FiMenu,
  FiPlus,
  FiSearch,
  FiSettings,
  FiShield,
  FiX,
} from "react-icons/fi";
import { getCurrentAppwriteUser } from "../lib/appwrite/auth";
import { BrandMark } from "./BrandMark";

export function DemoShell({
  children,
  active = "Overview",
  showSidebar = false,
}: {
  children: ReactNode;
  active?: string;
  showSidebar?: boolean;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  useEffect(() => {
    if (showSidebar)
      getCurrentAppwriteUser().then((user) => {
        if (user) {
          setUserName(user.name || user.email);
          setUserEmail(user.email);
        }
      });
  }, [showSidebar]);
  const links: { label: string; href: string; icon: ReactNode }[] = [
    { label: "Overview", href: "/dashboard", icon: <FiHome /> },
    { label: "My bikes", href: "/dashboard#bikes", icon: <FiGrid /> },
    { label: "Search registry", href: "/search", icon: <FiSearch /> },
    { label: "Settings", href: "/settings", icon: <FiSettings /> },
  ];
  return (
    <div className={`app-frame${showSidebar ? "" : " public-frame"}`}>
      {showSidebar && (
        <aside className={`app-sidebar${mobileNavOpen ? " mobile-open" : ""}`}>
          <Link
            className="brand app-brand"
            href="/"
            onClick={() => setMobileNavOpen(false)}
          >
            <BrandMark variant="dark" />
          </Link>
          <div className="demo-badge">LIVE APPWRITE</div>
          <nav className="app-nav">
            {links.map(({ label, href, icon }) => (
              <Link
                className={active === label ? "active" : ""}
                href={href}
                key={label}
                onClick={() => setMobileNavOpen(false)}
              >
                <span>{icon}</span>
                {label}
              </Link>
            ))}
          </nav>
          <div className="sidebar-help">
            <span className="help-icon">
              <FiHelpCircle />
            </span>
            <strong>Need a hand?</strong>
            <p>Our team is here to help with your bike record.</p>
            <a href="mailto:hello@cycletrace.co.za">
              Contact support <FiArrowUpRight />
            </a>
          </div>
          <div className="sidebar-user">
            <span className="user-avatar">
              {userName ? userName.slice(0, 2).toUpperCase() : "CT"}
            </span>
            <span>
              <strong>{userName || "CycleTrace account"}</strong>
              <small>{userEmail || "Appwrite workspace"}</small>
            </span>
            <span className="more-dot">
              <FiShield />
            </span>
          </div>
        </aside>
      )}
      <div className="app-content">
        <header className="app-topbar">
          <div className="topbar-identity">
            {showSidebar && (
              <>
                <button
                  className="workspace-back-button"
                  type="button"
                  onClick={() => window.history.back()}
                  aria-label="Go back"
                >
                  <FiArrowLeft />
                </button>
                <button
                  className="workspace-menu-toggle"
                  type="button"
                  onClick={() => setMobileNavOpen(!mobileNavOpen)}
                  aria-label="Toggle workspace navigation"
                >
                  {mobileNavOpen ? <FiX /> : <FiMenu />}
                </button>
              </>
            )}
            <Link className="public-top-brand" href="/">
              <BrandMark variant="dark" />
            </Link>
            <span className="mobile-app-brand">
              <BrandMark />
            </span>
            <span className="breadcrumb">Workspace / {active}</span>
          </div>
          <div className="topbar-actions">
            {showSidebar ? (
              <>
                <Link href="/search" className="topbar-search">
                  <FiSearch /> <span>Search registry</span>
                </Link>
                <Link
                  className="button button-dark button-small"
                  href="/register"
                >
                  Add a bike <FiPlus />
                </Link>
              </>
            ) : (
              <nav className="public-top-nav">
                <Link href="/search">Search a bike</Link>
                <Link href="/organizations">For organisations</Link>
                <Link href="/login">Log in</Link>
                <Link
                  className="button button-dark button-small"
                  href="/onboarding"
                >
                  Get started <FiArrowUpRight />
                </Link>
              </nav>
            )}
          </div>
        </header>
        <main className="app-main">{children}</main>
      </div>
      {showSidebar && mobileNavOpen && (
        <button
          className="workspace-backdrop"
          aria-label="Close workspace navigation"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
    </div>
  );
}
