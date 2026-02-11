## UX Wireframes Specification

This document translates the TraceLoom control tower concept and existing UI mockups into structured, implementation-ready wireframe specs. It focuses on **layout, key components, states, and data bindings** for each screen.

---

### 1. Control Tower Overview

**Route:** `App > Control Tower > Overview`  
**Goal:** Give operations managers a live snapshot of all POs, risk, and alerts.

#### 1.1 Layout

- **Left Navigation (persistent)**
  - Logo + product name (`TraceLoom Pulse`).
  - Primary items:
    - `Overview` (selected)
    - `Purchase Orders`
    - `Suppliers`
    - `Alerts`
  - Secondary group (separated section):
    - `Customer Portal`

- **Top Bar**
  - Page title: `Control Tower`
  - Subtitle: `Real-time supply chain intelligence`
  - Right-aligned actions:
    - Button: `View all POs`
    - User avatar + menu.

- **Summary KPIs (top cards row)**
  - Card 1: `Active POs`
    - Metric: integer count.
    - Subtext: e.g., `Currently in transit`.
  - Card 2: `Delayed POs`
    - Metric: integer count.
    - Subtext: `Require attention`.
  - Card 3: `Delay Rate`
    - Metric: percent.
    - Subtext: `Last 30 days`.
  - Card 4: `Trust Score`
    - Circular gauge (0–100) and label (e.g., `70 Good`).

- **Main Content – Two Columns**
  - **Left (≈65%) – Purchase Orders table**
  - **Right (≈35%) – Live Activity + Alerts preview**

#### 1.2 Purchase Orders Table

- **Header**
  - Title: `Purchase Orders`
  - Filters: `All`, `At Risk`, `Shipping`, `Production`, etc.
  - Search bar: placeholder `Search by PO number, product, or customer`.

- **Columns**
  - `PO Number` – clickable, navigates to **PO Story**.
  - `Product` – product name + short descriptor.
  - `Stage` – pill tag (`Yarn`, `Knitting`, `Dyeing`, `QA`, `Packing`, `Shipping`, `Delivered`).
  - `Risk Score` – numeric + color-coded pill (`Low`, `Medium`, `High`).
  - `ETA` – date + day-delta indicator (e.g., `+5d late`, `-2d early`).
  - `AI Insight` – small label or icon summarising primary risk driver (`Port risk`, `Weather`, `Supplier delay`, `On track`).
  - `Certifications` – badges (e.g., `Organic`, `Low Impact Dyeing`).
  - `Actions` – text link `View` or three-dot menu.

- **Row interaction**
  - Clicking anywhere on the row or `View` opens `PO Story` detail.
  - Hover state highlights row.

#### 1.3 Live Activity Panel

- **Tabs**
  - `All`
  - `Scans` (worker QR events)
  - `System` (ERP/API/IoT/public-data events)

- **Activity Item Layout**
  - Left icon representing event type (`scan`, `production`, `logistics`, `weather`).
  - Main text: description, e.g., `Packing completed for KT1823 · Unit U8F3KD2`.
  - Subtext:
    - Time (relative, e.g., `5 min ago`).
    - Source: `Worker scan at Vietnam Knitting Factory`.
  - Badge for `On time`, `Late`, or `At risk`.

#### 1.4 Alerts Preview Panel

- Title: `Alerts`
- Small pill: `5 open` with breakdown `1 Critical, 4 Warning`.
- List of alert cards (shortened from full Alerts screen):
  - Badge: severity (`Critical`, `Warning`, `Info`).
  - Title: e.g., `Delay Risk: Supplier A`.
  - Body text (2–3 lines):
    - **Cause summary**: “Recent slowdown in dyeing line + port congestion.”
    - **Impact summary**: “KT1823, KT1824 at risk of 2–3 days delay.”
  - Inline tags along bottom: `Factory`, `Port Data`, `Weather`.
  - CTA button: `View alert`.

---

### 2. Purchase Orders List

**Route:** `App > Purchase Orders`  
**Goal:** Dedicated PO list with richer filtering and bulk views.

#### 2.1 Layout

- Same left nav and top bar, page title: `Purchase Orders`.
- Top controls:
  - Search across POs.
  - Filters: `Stage`, `Risk level`, `Supplier`, `Route`, `Season`.
  - Toggle: `Table / Cards` view (initial: table).

#### 2.2 Table

- Columns largely mirror the Overview table but can add:
  - `Supplier`.
  - `Factory`.
  - `Order value` (optional).

- Bulk actions:
  - Checkbox on each row + header.
  - Actions: `Export`, `Share snapshot`, `Create watchlist`.

---

### 3. PO Story Detail

**Route:** `App > Purchase Orders > PO Story`  
**Goal:** Show the full digital story for a single PO, from yarn to delivery.

#### 3.1 Layout

- Top band:
  - Left:
    - PO number and product name.
    - Subtext: `Customer`, `Supplier`, `Factory`, `Season`.
  - Center metrics:
    - `On-time probability` (e.g., `78%`).
    - `Risk level` pill.
    - `Est. delay` (e.g., `+1–2 days`, or `On track`).
  - Right:
    - `Share` button (generate read-only link / snapshot).
    - `Download report` button.

- Secondary row below top band:
  - Tabs:
    - `Timeline`
    - `Map`
    - `Documents`
    - `Insights`

- Main content: two-column layout
  - Left: **Traceability Timeline**.
  - Right: **Insights & Context**.

#### 3.2 Traceability Timeline (default tab)

- Vertical stepped timeline with stages:
  - `Yarn Sourcing`
  - `Knitting`
  - `Dyeing`
  - `QA Check`
  - `Packing`
  - `Shipping`
  - `Delivery`

- Each stage node contains:
  - Stage title + completion status icon (checkmark / in-progress / at-risk).
  - Date and time.
  - Location (city, site).
  - Source (e.g., `Worker scan`, `ERP`, `Carrier API`).
  - **AI Insight pill** (if any), which expands to show:
    - Cause: “Supplier raw material shortage.”
    - Effect: “1 day delay vs baseline.”
    - Confidence level.

- Expandable sub-events:
  - Within `Knitting`, show multiple machine events and pauses.
  - Within `Shipping`, show port gate-in/out, vessel departure/arrival.

#### 3.3 Map Tab

- World / regional map (OpenStreetMap or similar).
- Path lines:
  - `Yarn origin` → `Factory` → `Port of Loading` → `Port of Discharge` → `DC / Customer`.
- Markers:
  - Each node clickable to show:
    - Status (completed/current/upcoming).
    - Main dates.
    - Linked alerts (e.g., port congestion).

#### 3.4 Insights Panel (right column)

- Sections:
  - **Why this order is at risk**
    - Bullet list of drivers (e.g., `Knitting +24h`, `Port congestion index 0.8`, `Storm warning`).
  - **Recommended actions**
    - Action cards: “Expedite booking”, “Shift production slot”, “Notify customer”.
  - **Data sources used**
    - Chips: `ERP`, `Worker scans`, `IoT`, `Weather`, `Port data`.

---

### 4. Alerts Inbox

**Route:** `App > Alerts`  
**Goal:** Central place to triage and resolve AI-generated exceptions.

#### 4.1 Layout

- Top bar:
  - Title: `Alerts`
  - Summary counters: `5 open`, `1 critical`, `4 warning`, `0 info`.
  - Filter chips: `All`, `Critical`, `Warning`, `Info`, `Resolved`.
  - Refresh button.

- Main area:
  - List of alert cards stacked vertically.

#### 4.2 Alert Card Structure

- Header row:
  - Severity pill (`Critical`/`Warning`/`Info`).
  - Alert title (e.g., `Delay Risk: Supplier A`).
  - Right: timestamp and status (`New`, `In review`, `Resolved`).

- Body:
  - Primary explanation in plain language:
    - “This PO shows elevated delay risk due to recent shipping lane congestion. Port dwell time has increased by 48 hours vs baseline.”
  - Secondary explanation:
    - Highlight contributing signals and models used.

- Footer:
  - Tags: `PO: KT1823`, `Factory: Dongguan Knitting`, `Port: VNSGN`, `Weather`.
  - Two CTAs:
    - `Open PO Story`
    - `Take Action` (opens drawer showing recommended actions and comment box).

---

### 5. Suppliers Management

**Route:** `App > Suppliers`  
**Goal:** Summarize partner performance and trust.

#### 5.1 Layout

- Grid of supplier cards.

- Each card:
  - Supplier name + location.
  - Tags: `Tier 1`, `Spinning`, `Knitting` etc.
  - KPIs:
    - `Trust Score` (0–100).
    - `% On-time POs (last 90 days)`.
    - `Avg lead time`.
    - `Recent quality issues` count.
  - Button: `View POs` (filters PO list by this supplier).

---

### 6. Customer Portal – Track & Story

**Route:** `Customer Portal > Track`  
**Goal:** Provide a simplified, consumer-friendly journey view.

#### 6.1 Landing / Search

- Dark hero section with:
  - Headline: `Trace the Journey of Your Knit Sweater`.
  - Subtitle: short explanation of what they’ll see.
  - Input: `Enter PO or Tracking Number`.
  - Button: `Scan & Trace` (for QR scanning on mobile).

#### 6.2 Journey Summary

- Once a valid code is entered:
  - Show a **Journey score card**:
    - Large score (0–100) label like `65 Good`.
    - Subtext describing what it represents (on-time and sustainability combined).
  - Badge list:
    - `Organic Cotton Certified`
    - `Low Impact Dyeing`
    - `Ethical Manufacturing`
    - `Efficient Sea Freight`

#### 6.3 Timeline & Map

- Map:
  - Focused on relevant countries only.
  - Simple markers and connective line.

- Timeline:
  - Short list of stages with friendly labels:
    - `Yarn sourced in Vietnam`
    - `Sweater knitted in Dongguan`
    - `Dyed with low-impact process`
    - `Shipped by sea`
    - `Arriving at your door`
  - Each stage can show:
    - Completion icon.
    - Short AI note when relevant, in non-technical language.

---

### 7. Worker QR-Scanning App

**Route:** Separate PWA / mobile-friendly view, but consistent branding.  
**Goal:** Allow floor and warehouse staff to update status quickly via QR scans.

#### 7.1 Home Screen

- Header: `TraceLoom Worker`
- Content:
  - Primary button: `Scan QR to Update`.
  - Quick action buttons (tiles):
    - `Receive Yarn`
    - `Start Production`
    - `QA Check`
    - `Packing`
    - `Load for Shipping`
  - Small list: `Recent scans` for that user/device.

#### 7.2 Scan & Confirm Flow

- Screen 1: Scanner view
  - Full-screen camera.
  - Overlay text: `Align QR code within the frame`.

- On successful scan:
  - Show PO summary card:
    - `PO number`, `Product`, `Current stage`, `Location`.
  - Dropdown: `Operation` (pre-selected if user came from a quick action).
  - Input:
    - Optional `Quantity` / `Units`.
    - Optional note.
    - Optional photo upload (thumbnail after capture).
  - Button: `Confirm update`.

- Confirmation state:
  - Success toast: `Update saved · Control Tower updated in real time`.
  - Option buttons: `Scan next` or `Back to home`.

#### 7.3 Error & Offline States

- Invalid QR:
  - Message: `Code not recognised. Check the label or enter PO manually.`
  - Input field for manual `PO number`.

- Offline:
  - Banner: `Offline – changes will be synced when connection is restored.`
  - Local queue list of pending updates.

