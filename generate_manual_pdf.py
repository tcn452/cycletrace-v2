import os
import subprocess

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CycleTrace Client Instruction Manual</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap');

    @page {
      size: A4;
      margin: 16mm 14mm 16mm 14mm;
      @bottom-right {
        content: counter(page);
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1a2421;
      background: #ffffff;
      line-height: 1.55;
      font-size: 10pt;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page-break {
      page-break-before: always;
      break-before: page;
    }

    .avoid-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Cover Page */
    .cover-page {
      height: 94vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 40px 30px;
      border: 2px solid #121b18;
      border-radius: 12px;
      background: linear-gradient(175deg, #f8faf9 0%, #ffffff 60%, #edf4f0 100%);
      position: relative;
    }

    .cover-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #dfe5e2;
      padding-bottom: 20px;
    }

    .brand-mark-cover {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 800;
      font-size: 18pt;
      letter-spacing: -0.02em;
      color: #121b18;
    }

    .brand-badge {
      background: #121b18;
      color: #facc15;
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      padding: 5px 12px;
      border-radius: 20px;
    }

    .cover-title-block {
      margin: auto 0;
    }

    .cover-eyebrow {
      font-size: 10pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #166534;
      margin-bottom: 12px;
      display: inline-block;
      background: #dcfce7;
      padding: 4px 10px;
      border-radius: 6px;
    }

    .cover-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 32pt;
      font-weight: 700;
      line-height: 1.1;
      letter-spacing: -0.04em;
      color: #121b18;
      margin-bottom: 16px;
    }

    .cover-title span {
      color: #15803d;
    }

    .cover-subtitle {
      font-size: 13pt;
      color: #4b5563;
      max-width: 580px;
      line-height: 1.5;
    }

    .cover-meta {
      border-top: 1px solid #dfe5e2;
      padding-top: 24px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      font-size: 8.5pt;
    }

    .cover-meta strong {
      display: block;
      color: #121b18;
      font-size: 9.5pt;
      margin-top: 2px;
    }

    .cover-meta span {
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-size: 7.5pt;
      font-weight: 700;
    }

    /* Section Styling */
    h1, h2, h3, h4 {
      font-family: 'Space Grotesk', sans-serif;
      color: #121b18;
      letter-spacing: -0.03em;
    }

    h1 {
      font-size: 20pt;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #121b18;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    h1 .section-num {
      font-size: 11pt;
      background: #121b18;
      color: #ffffff;
      padding: 3px 10px;
      border-radius: 6px;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    h2 {
      font-size: 13pt;
      margin: 18px 0 8px;
      color: #166534;
      border-left: 3px solid #166534;
      padding-left: 8px;
    }

    h3 {
      font-size: 11pt;
      margin: 12px 0 6px;
    }

    p {
      margin-bottom: 10px;
      color: #374151;
      line-height: 1.55;
    }

    /* Action Steps & Callouts */
    .step-box {
      background: #f8faf9;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px 16px;
      margin: 12px 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }

    .step-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }

    .step-badge {
      background: #121b18;
      color: #ffffff;
      font-size: 8pt;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 4px;
    }

    .step-title {
      font-weight: 700;
      font-size: 10.5pt;
      color: #121b18;
    }

    .side-by-side-prompt {
      background: #fefce8;
      border: 1px solid #fef08a;
      border-left: 4px solid #ca8a04;
      padding: 10px 14px;
      border-radius: 6px;
      margin: 10px 0;
      font-size: 9pt;
      color: #713f12;
    }

    .side-by-side-prompt strong {
      display: block;
      color: #854d0e;
      text-transform: uppercase;
      font-size: 7.5pt;
      letter-spacing: 0.08em;
      margin-bottom: 3px;
    }

    .note-box {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-left: 4px solid #059669;
      padding: 10px 14px;
      border-radius: 6px;
      margin: 10px 0;
      font-size: 9pt;
      color: #065f46;
    }

    .note-box strong {
      display: block;
      color: #047857;
      text-transform: uppercase;
      font-size: 7.5pt;
      letter-spacing: 0.08em;
      margin-bottom: 3px;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
      font-size: 8.5pt;
    }

    th, td {
      border: 1px solid #e2e8f0;
      padding: 7px 10px;
      text-align: left;
      vertical-align: top;
    }

    th {
      background: #f1f5f9;
      color: #0f172a;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 7.5pt;
      letter-spacing: 0.05em;
    }

    tr:nth-child(even) td {
      background: #fafbfc;
    }

    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      background: #edf2f7;
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 8.5pt;
      color: #0f172a;
    }

    ul, ol {
      margin-left: 18px;
      margin-bottom: 10px;
      color: #374151;
      font-size: 9.5pt;
    }

    li {
      margin-bottom: 4px;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    .card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 14px;
      background: #ffffff;
    }

    .card h4 {
      font-size: 9.5pt;
      color: #121b18;
      margin-bottom: 4px;
    }

    .card p {
      font-size: 8.5pt;
      color: #64748b;
      margin-bottom: 0;
    }

    .badge {
      display: inline-block;
      font-size: 7pt;
      font-weight: 700;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .badge-green { background: #dcfce7; color: #166534; }
    .badge-yellow { background: #fef08a; color: #854d0e; }
    .badge-red { background: #fee2e2; color: #991b1b; }
    .badge-blue { background: #dbeafe; color: #1e40af; }

    .header-tag {
      font-size: 8pt;
      color: #64748b;
      text-align: right;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 4px;
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="cover-page">
    <div class="cover-top">
      <div class="brand-mark-cover">
        <span>CycleTrace</span>
      </div>
      <div class="brand-badge">Official Client Manual</div>
    </div>

    <div class="cover-title-block">
      <div class="cover-eyebrow">Interactive Application Guide</div>
      <h1 class="cover-title">The Complete System <span>Walkthrough</span></h1>
      <p class="cover-subtitle">
        A step-by-step companion guide designed for clients, partners, and stakeholders to test and explore CycleTrace alongside a live browser window.
      </p>
    </div>

    <div class="cover-meta">
      <div>
        <span>Application Version</span>
        <strong>CycleTrace 1.0 (Production)</strong>
      </div>
      <div>
        <span>Backend Architecture</span>
        <strong>Appwrite Cloud & PayFast</strong>
      </div>
      <div>
        <span>Published For</span>
        <strong>Client Review & Stakeholder Walkthrough</strong>
      </div>
    </div>
  </div>

  <!-- TABLE OF CONTENTS & OVERVIEW -->
  <div class="page-break"></div>
  <div class="header-tag">CycleTrace Client Instruction Manual · Page 2</div>

  <h1>Table of Contents & Quick Navigation <span class="section-num">01</span></h1>

  <table>
    <thead>
      <tr>
        <th style="width: 15%;">Section</th>
        <th style="width: 35%;">Module / Feature</th>
        <th style="width: 25%;">Direct URL</th>
        <th style="width: 25%;">Target User Role</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Section 2</strong></td>
        <td>System Architecture & Security Model</td>
        <td><code>/</code></td>
        <td>All Roles & IT Stakeholders</td>
      </tr>
      <tr>
        <td><strong>Section 3</strong></td>
        <td>Public Portal & Serial Search</td>
        <td><code>/search</code>, <code>/bikes/[id]</code></td>
        <td>Buyers, Police, Public</td>
      </tr>
      <tr>
        <td><strong>Section 4</strong></td>
        <td>Authentication & Session Flow</td>
        <td><code>/login</code>, <code>/register</code></td>
        <td>Registered Members</td>
      </tr>
      <tr>
        <td><strong>Section 5</strong></td>
        <td>Rider Dashboard & Onboarding Guide</td>
        <td><code>/dashboard</code></td>
        <td>Bicycle Owners (Riders)</td>
      </tr>
      <tr>
        <td><strong>Section 6</strong></td>
        <td>Fleet Management & Registering Bikes</td>
        <td><code>/register?mode=bike</code></td>
        <td>Bicycle Owners</td>
      </tr>
      <tr>
        <td><strong>Section 7</strong></td>
        <td>Theft Flagging & Recovery Workflow</td>
        <td><code>/dashboard/report</code></td>
        <td>Bicycle Owners</td>
      </tr>
      <tr>
        <td><strong>Section 8</strong></td>
        <td>Safe Ownership Transfer Protocol</td>
        <td><code>/dashboard/transfer</code>, <code>/transfer/[token]</code></td>
        <td>Buyers & Sellers</td>
      </tr>
      <tr>
        <td><strong>Section 9</strong></td>
        <td>Store Owner POS Handover Hub</td>
        <td><code>/store-owner</code></td>
        <td>Bike Shops & Retailers</td>
      </tr>
      <tr>
        <td><strong>Section 10</strong></td>
        <td>Insurer Verification & Claims Portal</td>
        <td><code>/insurer</code></td>
        <td>Underwriters & Claims Teams</td>
      </tr>
      <tr>
        <td><strong>Section 11</strong></td>
        <td>Platform Admin & Approvals</td>
        <td><code>/admin</code></td>
        <td>CycleTrace Platform Admins</td>
      </tr>
      <tr>
        <td><strong>Section 12</strong></td>
        <td>Account & Security Preferences</td>
        <td><code>/settings</code>, <code>/settings/billing</code></td>
        <td>All Signed-In Accounts</td>
      </tr>
      <tr>
        <td><strong>Section 13</strong></td>
        <td>Side-by-Side Walkthrough Checklist</td>
        <td>All Routes</td>
        <td>Interactive Testing</td>
      </tr>
    </tbody>
  </table>

  <h2>How to Use This Manual</h2>
  <p>
    This manual is structured so that a client or reviewer can place this document side-by-side with an active browser window. Every subsection contains a highlighted <strong>SIDE-BY-SIDE ACTION</strong> box with exact keystrokes, button names, test input values, and expected UI updates.
  </p>

  <div class="grid-2">
    <div class="card">
      <h4>Desktop Browser Setup</h4>
      <p>Open Google Chrome, Safari, or Edge to <code>http://localhost:3000</code> or your live deployment URL. Keep developer tools console open if inspecting network requests.</p>
    </div>
    <div class="card">
      <h4>Live Appwrite Integration</h4>
      <p>CycleTrace connects to Appwrite Cloud with live session cookies, table storage, and secure photo buckets. No dummy data is used—actions persist immediately.</p>
    </div>
  </div>

  <!-- SECTION 2: ARCHITECTURE & SECURITY -->
  <div class="page-break"></div>
  <div class="header-tag">CycleTrace Client Instruction Manual · Page 3</div>

  <h1>System Architecture & Security <span class="section-num">02</span></h1>

  <p>
    CycleTrace is built with a verification-first approach designed specifically for South African bicycle ownership realities. It replaces fragmented paper records and social media theft posts with an immutable registry database.
  </p>

  <h2>Technical Foundation</h2>
  <table>
    <thead>
      <tr>
        <th>Layer</th>
        <th>Technology</th>
        <th>Functional Purpose</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Frontend</strong></td>
        <td>Next.js 15 (App Router), React 19, TypeScript</td>
        <td>Server components, streaming layouts, and responsive client interfaces.</td>
      </tr>
      <tr>
        <td><strong>Authentication</strong></td>
        <td>Appwrite Auth & Session Manager</td>
        <td>Secure email/password authentication with automatic session cookies and role preferences.</td>
      </tr>
      <tr>
        <td><strong>Database</strong></td>
        <td>Appwrite TablesDB</td>
        <td>Stores bike records, transfer tokens, organization applications, and member rosters.</td>
      </tr>
      <tr>
        <td><strong>Storage</strong></td>
        <td>Appwrite Storage Bucket</td>
        <td>Encrypted storage for bike photographs with strict role-based read/update permissions.</td>
      </tr>
      <tr>
        <td><strong>Onboarding</strong></td>
        <td>OnboardJS React Engine</td>
        <td>Interactive product tour with local storage persistence and Appwrite preference syncing.</td>
      </tr>
      <tr>
        <td><strong>Compliance</strong></td>
        <td>POPIA Compliance Layer</td>
        <td>Data minimisation, public serial verification without exposing personal contact details.</td>
      </tr>
    </tbody>
  </table>

  <h2>Security & Privacy Principles</h2>
  <ul>
    <li><strong>Public Anonymity:</strong> Anyone can verify a serial number publicly, but private owner details (full name, phone, residential address) are strictly protected and never displayed on public pages.</li>
    <li><strong>Role-Based Access:</strong> Only bike owners can initiate transfers or flag thefts. Insurers and store owners must undergo admin verification before accessing elevated organizational workspaces.</li>
    <li><strong>Transfer Token Integrity:</strong> Ownership transfers utilize cryptographic unique tokens with designated recipient email binding to eliminate fraudulent reassignment.</li>
  </ul>

  <!-- SECTION 3: PUBLIC PORTAL & SERIAL SEARCH -->
  <div class="page-break"></div>
  <div class="header-tag">CycleTrace Client Instruction Manual · Page 4</div>

  <h1>Public Portal & Serial Search <span class="section-num">03</span></h1>

  <p>
    The public portal enables potential second-hand buyers, bike shops, and law enforcement to instantly verify a bike’s ownership and theft status before money changes hands.
  </p>

  <div class="step-box">
    <div class="step-header">
      <span class="step-badge">STEP 1</span>
      <span class="step-title">Landing Page Overview & Live Search Bar</span>
    </div>
    <p>
      Navigate to <code>/</code>. The homepage displays CycleTrace’s mission, how it works, testimonials, and a central serial search input.
    </p>
    <div class="side-by-side-prompt">
      <strong>Side-by-Side Action:</strong>
      Scroll to the search input under "Before you buy, check the trace". Enter a brand, model, or known serial number (e.g. <code>Specialized</code> or <code>WSBC</code>) and press <kbd>Enter</kbd> or click <strong>Search registry →</strong>.
    </div>
  </div>

  <div class="step-box">
    <div class="step-header">
      <span class="step-badge">STEP 2</span>
      <span class="step-title">Live Registry Search Results (<code>/search</code>)</span>
    </div>
    <p>
      The registry query executes against the live Appwrite database. Matching bicycles are displayed with their photo, brand, model, color, registration year, and current protection status.
    </p>
    <div class="side-by-side-prompt">
      <strong>Side-by-Side Action:</strong>
      On <code>/search</code>, click on any bicycle card result to open its detailed public record at <code>/bikes/[id]</code>.
    </div>
  </div>

  <div class="step-box">
    <div class="step-header">
      <span class="step-badge">STEP 3</span>
      <span class="step-title">Public Bike Record Verification (<code>/bikes/[id]</code>)</span>
    </div>
    <p>
      This page serves as proof of registry:
    </p>
    <ul>
      <li><strong>Protected Status:</strong> Displays a green checkmark indicating the bike is legitimately registered and clear of theft reports.</li>
      <li><strong>Stolen Alert:</strong> If flagged by the owner, a prominent red alert banner displays: <em>"This bike has been reported stolen. Do not purchase it."</em></li>
      <li><strong>Frame Verification:</strong> Highlights the registered serial number so a buyer can inspect the physical bike frame on the spot.</li>
    </ul>
  </div>

  <!-- SECTION 4: AUTHENTICATION & NAVIGATION -->
  <div class="page-break"></div>
  <div class="header-tag">CycleTrace Client Instruction Manual · Page 5</div>

  <h1>Authentication & Smart Redirections <span class="section-num">04</span></h1>

  <p>
    CycleTrace features unified authentication state management. The navigation bar dynamically adapts to user state, and guest auth pages intelligently redirect signed-in users.
  </p>

  <h2>Authentication State Matrix</h2>
  <table>
    <thead>
      <tr>
        <th>Page / Location</th>
        <th>Signed-Out Visitor</th>
        <th>Signed-In Member</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Homepage Navbar</strong> (Desktop)</td>
        <td>Shows "Log in" and "Register a bike" button</td>
        <td>Shows "Dashboard" link and "Sign out" button</td>
      </tr>
      <tr>
        <td><strong>Homepage Navbar</strong> (Mobile Drawer)</td>
        <td>Shows "Log in" and "Register a bike"</td>
        <td>Shows "Dashboard" link and "Sign out" action</td>
      </tr>
      <tr>
        <td><strong>DemoShell Topbar</strong> (Public)</td>
        <td>Shows "Log in" and "Get started"</td>
        <td>Shows "Dashboard" and "Sign out" button</td>
      </tr>
      <tr>
        <td><strong>DemoShell Sidebar</strong> (Workspace)</td>
        <td>N/A (Workspace requires login)</td>
        <td>Displays User Avatar, Name, Email, and Sign-out button (<code>FiLogOut</code>)</td>
      </tr>
      <tr>
        <td><strong>Login Route (<code>/login</code>)</strong></td>
        <td>Displays member access email/password form</td>
        <td><strong>Automatically redirects to <code>/dashboard</code></strong></td>
      </tr>
      <tr>
        <td><strong>Register Route (<code>/register</code>)</strong></td>
        <td>Displays 3-step registration flow</td>
        <td><strong>Automatically redirects to <code>/dashboard</code></strong> (Unless in <code>?mode=bike</code>)</td>
      </tr>
    </tbody>
  </table>

  <div class="step-box">
    <div class="step-header">
      <span class="step-badge">STEP 1</span>
      <span class="step-title">Testing Sign-Out & Sign-In</span>
    </div>
    <div class="side-by-side-prompt">
      <strong>Side-by-Side Action:</strong>
      1. Click <strong>Sign out</strong> from the topbar or sidebar.<br>
      2. Notice how the navbar immediately changes back to "Log in" and "Register a bike".<br>
      3. Navigate to <code>/login</code>. Enter your credentials and click <strong>Sign in →</strong>.<br>
      4. Observe immediate redirect to <code>/dashboard</code> with the topbar and sidebar personalized to your account.
    </div>
  </div>

  <div class="step-box">
    <div class="step-header">
      <span class="step-badge">STEP 2</span>
      <span class="step-title">Verifying Guest Page Protection</span>
    </div>
    <div class="side-by-side-prompt">
      <strong>Side-by-Side Action:</strong>
      While logged in, manually type <code>/login</code> or <code>/register</code> in your browser address bar and hit enter. The application immediately detects your active session and redirects you to <code>/dashboard</code> without flashing the forms.
    </div>
  </div>

  <!-- SECTION 5: RIDER DASHBOARD & ONBOARDING -->
  <div class="page-break"></div>
  <div class="header-tag">CycleTrace Client Instruction Manual · Page 6</div>

  <h1>Rider Dashboard & Walkthrough Tour <span class="section-num">05</span></h1>

  <p>
    The Rider Dashboard (<code>/dashboard</code>) is the central command center for bicycle owners to oversee their registered fleet, inspect live records, and trigger recovery actions.
  </p>

  <h2>Interactive Onboarding Walkthrough (OnboardJS)</h2>
  <p>
    First-time users entering the dashboard are greeted with an interactive 3-step onboarding walkthrough guide:
  </p>

  <div class="grid-3" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 10px 0;">
    <div class="card" style="padding: 10px 12px;">
      <span class="badge badge-green" style="margin-bottom: 6px;">STEP 1</span>
      <h4>Welcome to CycleTrace</h4>
      <p style="font-size: 8pt;">Introduces the workspace where riders protect bikes and manage records.</p>
    </div>
    <div class="card" style="padding: 10px 12px;">
      <span class="badge badge-yellow" style="margin-bottom: 6px;">STEP 2</span>
      <h4>Your Bikes Live Here</h4>
      <p style="font-size: 8pt;">Points to the "My bikes" grid, tied to your secure Appwrite account ID.</p>
    </div>
    <div class="card" style="padding: 10px 12px;">
      <span class="badge badge-blue" style="margin-bottom: 6px;">STEP 3</span>
      <h4>Know Your Next Action</h4>
      <p style="font-size: 8pt;">Shows how to register new bikes, transfer ownership, or flag theft.</p>
    </div>
  </div>

  <div class="side-by-side-prompt">
    <strong>Side-by-Side Action:</strong>
    1. Advance through the tour steps using the green <strong>Next →</strong> button.<br>
    2. Test the <strong>Back</strong> button to return to a previous step.<br>
    3. Click <strong>Finish ✓</strong> on the final step.<br>
    4. Notice the tour closes cleanly, and a floating <strong>Tour guide</strong> button appears in the bottom-right corner.<br>
    5. Click <strong>Tour guide</strong> to restart and replay the tour at any time.
  </div>

  <h2>Dashboard Key Metrics</h2>
  <ul>
    <li><strong>Protected Bikes:</strong> Total number of bikes registered under your Appwrite account currently in good standing.</li>
    <li><strong>Reported Stolen:</strong> Real-time count of bikes actively flagged as stolen.</li>
    <li><strong>Account Status:</strong> Confirms live active Appwrite session connectivity.</li>
  </ul>

  <!-- SECTION 6: FLEET MANAGEMENT -->
  <div class="page-break"></div>
  <div class="header-tag">CycleTrace Client Instruction Manual · Page 7</div>

  <h1>Adding Additional Bikes to Your Fleet <span class="section-num">06</span></h1>

  <p>
    When a logged-in rider wants to register another bicycle, they bypass account creation and jump directly to bicycle details.
  </p>

  <div class="step-box">
    <div class="step-header">
      <span class="step-badge">STEP 1</span>
      <span class="step-title">Initiate Bike Registration (<code>/register?mode=bike</code>)</span>
    </div>
    <p>
      From the dashboard, click <strong>Register another bike</strong> or the sidebar/topbar <strong>Add a bike</strong> button.
    </p>
    <div class="side-by-side-prompt">
      <strong>Side-by-Side Action:</strong>
      Notice that Step 1 ("Account") is automatically marked ready. The screen starts directly on <strong>01 Bike details</strong>.
    </div>
  </div>

  <div class="step-box">
    <div class="step-header">
      <span class="step-badge">STEP 2</span>
      <span class="step-title">Enter Bicycle Identifying Details</span>
    </div>
    <table>
      <thead>
        <tr>
          <th>Field</th>
          <th>Example Input</th>
          <th>Verification Requirement</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Brand</strong></td>
          <td>Trek, Specialized, Cannondale, Giant</td>
          <td>Exact manufacturer name.</td>
        </tr>
        <tr>
          <td><strong>Model</strong></td>
          <td>Domane SL 6, Stumpjumper, Synapse</td>
          <td>Model and specification grade.</td>
        </tr>
        <tr>
          <td><strong>Year</strong></td>
          <td>2024</td>
          <td>Model manufacturing year.</td>
        </tr>
        <tr>
          <td><strong>Colour</strong></td>
          <td>Matte Black / Hyper Yellow</td>
          <td>Distinctive frame paint finish.</td>
        </tr>
        <tr>
          <td><strong>Serial Number</strong></td>
          <td>WTU12345678Z</td>
          <td>Stamped on underside of bottom bracket.</td>
        </tr>
        <tr>
          <td><strong>Storage Location</strong></td>
          <td>Cape Town / Gardens</td>
          <td>Primary residential city or suburb.</td>
        </tr>
        <tr>
          <td><strong>Photo Upload</strong></td>
          <td>Side profile image (&lt; 10MB)</td>
          <td>Clear picture showing frame geometry.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="step-box">
    <div class="step-header">
      <span class="step-badge">STEP 3</span>
      <span class="step-title">Review & Submit to Appwrite</span>
    </div>
    <p>
      Click <strong>Continue →</strong> to inspect the summary card. Confirm ownership accuracy checkbox, then click <strong>Complete registration</strong>.
    </p>
    <div class="note-box">
      <strong>Expected Outcome:</strong>
      A success confirmation screen displays your new unique <strong>REGISTRATION ID</strong> with links to view the public record or return to your dashboard.
    </div>
  </div>

  <!-- SECTION 7: THEFT REPORTING -->
  <div class="page-break"></div>
  <div class="header-tag">CycleTrace Client Instruction Manual · Page 8</div>

  <h1>Theft Reporting & Recovery Workflow <span class="section-num">07</span></h1>

  <p>
    When a bicycle is stolen, every hour counts. CycleTrace allows immediate status escalation so any buyer or bike shop checking the serial number is warned.
  </p>

  <div class="step-box">
    <div class="step-header">
      <span class="step-badge">STEP 1</span>
      <span class="step-title">Access Theft Reporting (<code>/dashboard/report</code>)</span>
    </div>
    <p>
      Navigate to <code>/dashboard/report</code> from your dashboard action menu.
    </p>
    <div class="side-by-side-prompt">
      <strong>Side-by-Side Action:</strong>
      1. Select the bicycle from the dropdown list of your owned bikes.<br>
      2. Enter the date of incident, last seen location, and police case number (SAPS CAS).<br>
      3. Add any distinguishing marks (e.g. scratched top tube, aftermarket pedals).<br>
      4. Click <strong>Flag as stolen →</strong>.
    </div>
  </div>

  <div class="step-box">
    <div class="step-header">
      <span class="step-badge">STEP 2</span>
      <span class="step-title">Verify Public Registry Escalation</span>
    </div>
    <p>
      CycleTrace updates the bike’s record status in Appwrite from <code>protected</code> to <code>stolen</code> instantaneously.
    </p>
    <div class="side-by-side-prompt">
      <strong>Side-by-Side Action:</strong>
      Open an incognito or private browser tab. Go to <code>/search</code> and search for the serial number of the bike you just flagged. Observe the high-visibility red <strong>REPORTED STOLEN</strong> alert banner on its public page.
    </div>
  </div>

  <div class="note-box">
    <strong>Community Protection Mechanism:</strong>
    The public page includes a direct reporting action for anyone spotting the bike to securely submit tips to <code>reports@cycletrace.co.za</code> without exposing the owner's personal details.
  </div>

  <!-- SECTION 8: OWNERSHIP TRANSFERS -->
  <div class="page-break"></div>
  <div class="header-tag">CycleTrace Client Instruction Manual · Page 9</div>

  <h1>Secure Ownership Transfer Protocol <span class="section-num">08</span></h1>

  <p>
    Selling or giving away a bicycle? CycleTrace enables verifiable cryptographic handovers, updating the provenance record and transferring management rights safely.
  </p>

  <h2>Two-Party Transfer Workflow</h2>

  <div class="step-box">
    <div class="step-header">
      <span class="step-badge">SENDER FLOW</span>
      <span class="step-title">Initiating Transfer (<code>/dashboard/transfer</code>)</span>
    </div>
    <div class="side-by-side-prompt">
      <strong>Side-by-Side Action:</strong>
      1. On <code>/dashboard</code>, locate the bike card and click <strong>Transfer ownership</strong>.<br>
      2. Enter the buyer's email address (e.g. <code>buyer@example.com</code>).<br>
      3. Agree to release ownership rights and click <strong>Generate transfer link →</strong>.<br>
      4. Copy the unique transfer URL containing the secure handover token.
    </div>
  </div>

  <div class="step-box">
    <div class="step-header">
      <span class="step-badge">BUYER FLOW</span>
      <span class="step-title">Accepting Ownership (<code>/transfer/[token]</code>)</span>
    </div>
    <div class="side-by-side-prompt">
      <strong>Side-by-Side Action:</strong>
      1. Paste the transfer URL in a browser.<br>
      2. Review the bike details on the transfer reception page.<br>
      3. Enter the buyer email to verify authorization.<br>
      4. Click <strong>Accept ownership →</strong>.
    </div>
  </div>

  <div class="note-box">
    <strong>Post-Handover State:</strong>
    The bike is immediately removed from the seller's active fleet and assigned to the buyer's account. The public provenance history logs the transfer timestamp.
  </div>

  <!-- SECTION 9: ORGANIZATIONAL WORKSPACES -->
  <div class="page-break"></div>
  <div class="header-tag">CycleTrace Client Instruction Manual · Page 10</div>

  <h1>Organizations & Commercial Roles <span class="section-num">09</span></h1>

  <p>
    CycleTrace partners with bike shops, insurers, and recovery organizations. The Onboarding Hub (<code>/onboarding</code>) routes commercial teams to the appropriate workflow.
  </p>

  <div class="grid-2">
    <div class="card">
      <h4>Store Owner Workspace (<code>/store-owner</code>)</h4>
      <p>
        Allows bicycle retail stores to register bicycles for customers directly at the point of sale. Ensures new owners leave the shop with verified digital protection active on day one.
      </p>
      <ul style="margin-top: 8px; font-size: 8pt;">
        <li>Batch customer bike registrations</li>
        <li>Custom store branding on handover</li>
        <li>Proof of authorized retail chain</li>
      </ul>
    </div>
    <div class="card">
      <h4>Insurer Workspace (<code>/insurer</code>)</h4>
      <p>
        Gives underwriting and claims teams instant serial verification tools. Insurers verify frame numbers before writing policies and validate claims history.
      </p>
      <ul style="margin-top: 8px; font-size: 8pt;">
        <li>Instant serial fraud & duplicate checks</li>
        <li>Active claims queue review</li>
        <li>Confidence verification scores</li>
      </ul>
    </div>
  </div>

  <h2>Store Owner & Insurer Application Flow</h2>
  <div class="step-box">
    <div class="step-header">
      <span class="step-badge">ACTION</span>
      <span class="step-title">Submitting Organization Verification</span>
    </div>
    <div class="side-by-side-prompt">
      <strong>Side-by-Side Action:</strong>
      1. Navigate to <code>/onboarding</code>.<br>
      2. Click <strong>Store owner</strong> (or <strong>Insurer</strong>).<br>
      3. Fill in the business registration number, contact person, phone, and address.<br>
      4. Click <strong>Submit application →</strong>. The submission is queued in Appwrite under <code>organization_applications</code> for platform admin review.
    </div>
  </div>

  <!-- SECTION 10: PLATFORM ADMIN -->
  <div class="page-break"></div>
  <div class="header-tag">CycleTrace Client Instruction Manual · Page 11</div>

  <h1>Platform Administration & Governance <span class="section-num">10</span></h1>

  <p>
    The Platform Administration portal (<code>/admin</code>) allows authorized operators to review organization applications, manage memberships, and maintain registry integrity.
  </p>

  <h2>Admin Capabilities</h2>
  <table>
    <thead>
      <tr>
        <th>Module</th>
        <th>Functionality</th>
        <th>Administrative Controls</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Application Queue</strong></td>
        <td>Review pending retailer and insurer registrations</td>
        <td>Approve application, reject with notes, or request documentation.</td>
      </tr>
      <tr>
        <td><strong>Organization Roster</strong></td>
        <td>Active verified partner organizations</td>
        <td>Suspend access, invite team members, adjust role quotas.</td>
      </tr>
      <tr>
        <td><strong>Registry Analytics</strong></td>
        <td>Platform-wide bike registration health</td>
        <td>Inspect total registered bikes, active theft rates, and transfer volume.</td>
      </tr>
    </tbody>
  </table>

  <div class="step-box">
    <div class="step-header">
      <span class="step-badge">SECURITY</span>
      <span class="step-title">Admin Access Control</span>
    </div>
    <p>
      Admin routes are strictly guarded by Appwrite labels (<code>admin</code>) or the <code>ADMIN_EMAILS</code> environment allowlist. Unauthenticated or unauthorized visitors are automatically blocked.
    </p>
  </div>

  <!-- SECTION 11: ACCOUNT SETTINGS -->
  <div class="page-break"></div>
  <div class="header-tag">CycleTrace Client Instruction Manual · Page 12</div>

  <h1>Settings, Profile & Billing <span class="section-num">11</span></h1>

  <p>
    Members manage their personal details, Appwrite session security, and subscription billing via <code>/settings</code>.
  </p>

  <h2>Account Preferences (<code>/settings</code>)</h2>
  <ul>
    <li><strong>Full Name:</strong> Updates user display name across ownership records and certificates.</li>
    <li><strong>Email Address:</strong> Read-only display of primary Appwrite account identity.</li>
    <li><strong>Contact Phone:</strong> Stored securely for recovery notifications.</li>
    <li><strong>Home City:</strong> Primary locality for regional recovery network alerts.</li>
    <li><strong>Security:</strong> Direct visibility of active Appwrite Auth session encryption.</li>
  </ul>

  <h2>Billing & Subscription (<code>/settings/billing</code>)</h2>
  <p>
    CycleTrace integrates with South Africa's leading payment gateway, <strong>PayFast</strong>, to manage monthly bike registry subscriptions (R24.99 / month).
  </p>
  <div class="note-box">
    <strong>Production Billing Note:</strong>
    On staging and evaluation environments without live merchant keys, the billing portal displays a clean, informational state indicating active Appwrite records are maintained without service interruption.
  </div>

  <!-- SECTION 12: TESTING CHECKLIST -->
  <div class="page-break"></div>
  <div class="header-tag">CycleTrace Client Instruction Manual · Page 13</div>

  <h1>Interactive Testing Checklist <span class="section-num">12</span></h1>

  <p>
    Use this verification matrix to conduct a complete evaluation of the CycleTrace application. Check off each scenario as you complete the walkthrough.
  </p>

  <table>
    <thead>
      <tr>
        <th style="width: 5%;">✓</th>
        <th style="width: 25%;">Test Scenario</th>
        <th style="width: 40%;">Verification Steps</th>
        <th style="width: 30%;">Expected Result</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>[ ]</td>
        <td><strong>Public Search</strong></td>
        <td>Go to <code>/search</code>, query a bike serial number or brand.</td>
        <td>Matching bikes appear with photo and protected status.</td>
      </tr>
      <tr>
        <td>[ ]</td>
        <td><strong>Public Record View</strong></td>
        <td>Click a bike result card to view <code>/bikes/[id]</code>.</td>
        <td>Verified badge and frame specs displayed; owner data remains private.</td>
      </tr>
      <tr>
        <td>[ ]</td>
        <td><strong>New User Register</strong></td>
        <td>From homepage, click <strong>Register a bike</strong> while signed out.</td>
        <td>Step 1 creates account, Step 2 captures bike, Step 3 confirms.</td>
      </tr>
      <tr>
        <td>[ ]</td>
        <td><strong>Auth Redirection</strong></td>
        <td>While signed in, navigate to <code>/login</code> or <code>/register</code>.</td>
        <td>Instantly redirected to <code>/dashboard</code>.</td>
      </tr>
      <tr>
        <td>[ ]</td>
        <td><strong>Navbar Auth Sync</strong></td>
        <td>Check homepage and topbar after signing in and signing out.</td>
        <td>Changes between "Log in / Register" and "Dashboard / Sign out".</td>
      </tr>
      <tr>
        <td>[ ]</td>
        <td><strong>Onboarding Tour</strong></td>
        <td>Open <code>/dashboard</code>. Step through the 3-card guide.</td>
        <td>Cards animate smoothly; "Tour guide" button replays on demand.</td>
      </tr>
      <tr>
        <td>[ ]</td>
        <td><strong>Add Another Bike</strong></td>
        <td>From dashboard, click <strong>Register another bike</strong>.</td>
        <td>Starts directly on Bike Details; no password required.</td>
      </tr>
      <tr>
        <td>[ ]</td>
        <td><strong>Flag Theft</strong></td>
        <td>Go to <code>/dashboard/report</code> and submit a theft flag.</td>
        <td>Status changes to stolen; public search shows red alert banner.</td>
      </tr>
      <tr>
        <td>[ ]</td>
        <td><strong>Ownership Transfer</strong></td>
        <td>Generate transfer token on <code>/dashboard/transfer</code>.</td>
        <td>Recipient accepts on <code>/transfer/[token]</code>; record reassigns.</td>
      </tr>
      <tr>
        <td>[ ]</td>
        <td><strong>Commercial Hub</strong></td>
        <td>Visit <code>/onboarding</code> and select Store or Insurer.</td>
        <td>Application forms submit cleanly to Appwrite admin queue.</td>
      </tr>
      <tr>
        <td>[ ]</td>
        <td><strong>Profile Settings</strong></td>
        <td>Update phone and city on <code>/settings</code> and save.</td>
        <td>Preferences save directly to Appwrite with green success note.</td>
      </tr>
    </tbody>
  </table>

  <!-- SECTION 13: FAQ & TROUBLESHOOTING -->
  <div class="page-break"></div>
  <div class="header-tag">CycleTrace Client Instruction Manual · Page 14</div>

  <h1>Frequently Asked Questions & Support <span class="section-num">13</span></h1>

  <h2>Common Questions</h2>

  <div class="step-box">
    <div class="step-title">Where do I find my bike's serial number?</div>
    <p style="margin-top: 6px; font-size: 9pt;">
      On 95% of bicycles, the serial number is stamped into the metal on the underside of the bottom bracket shell (beneath the pedals). It can also sometimes be found on the rear dropout or the head tube.
    </p>
  </div>

  <div class="step-box">
    <div class="step-title">Can someone steal my bike by claiming my serial number?</div>
    <p style="margin-top: 6px; font-size: 9pt;">
      No. Once a serial number is registered in CycleTrace, any attempt to register the same serial number triggers an automatic <code>409 Conflict</code> guard. Ownership can only be updated through an authorized cryptographic handover link from the existing registered owner.
    </p>
  </div>

  <div class="step-box">
    <div class="step-title">What if I sell my bike to someone who isn't on CycleTrace yet?</div>
    <p style="margin-top: 6px; font-size: 9pt;">
      Simply generate a transfer link using their email address. When they open the link, CycleTrace allows them to accept ownership and create their free secure account in one smooth step.
    </p>
  </div>

  <div class="step-box">
    <div class="step-title">How does CycleTrace protect owner privacy?</div>
    <p style="margin-top: 6px; font-size: 9pt;">
      In accordance with the South African Protection of Personal Information Act (POPIA), public search results only disclose bicycle technical specifications and theft verification status. Your full name, residential address, and contact numbers are strictly confidential.
    </p>
  </div>

  <h2>Technical Support & Enquiries</h2>
  <p>
    For technical inquiries, partner onboarding, or pilot deployment support, please contact the CycleTrace team:
  </p>
  <ul>
    <li><strong>General Enquiries:</strong> <code>hello@cycletrace.co.za</code></li>
    <li><strong>Theft Recovery & Law Enforcement:</strong> <code>reports@cycletrace.co.za</code></li>
    <li><strong>Privacy & Compliance:</strong> <code>privacy@cycletrace.co.za</code></li>
    <li><strong>Official Website:</strong> <code>https://cycletrace.co.za</code></li>
  </ul>

  <div style="margin-top: 40px; padding: 20px; border-top: 2px solid #121b18; text-align: center; color: #64748b; font-size: 8.5pt;">
    © 2026 CycleTrace (Pty) Ltd. Built for South African riders, bike shops, and recovery partners. All rights reserved.
  </div>

</body>
</html>
"""

html_path = "/Users/tshianzitshinaba/Documents/Cycletrace/manual.html"
pdf_path = "/Users/tshianzitshinaba/Documents/Cycletrace/CycleTrace_Client_Instruction_Manual.pdf"

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Generated HTML manual at {html_path}")

# Run headless Google Chrome to print to PDF
chrome_path = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
cmd = [
    chrome_path,
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    f"--print-to-pdf={pdf_path}",
    html_path
]

res = subprocess.run(cmd, capture_output=True, text=True)
if os.path.exists(pdf_path):
    size = os.path.getsize(pdf_path)
    print(f"Successfully generated PDF manual: {pdf_path} ({size} bytes)")
else:
    print(f"PDF generation failed: {res.stderr}")
