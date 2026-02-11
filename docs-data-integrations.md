## Data Source Integration Plan

This document lists and prioritizes the **ERP, logistics, IoT, and public data integrations** required to deliver the TraceLoom control tower MVP and later phases.

---

### 1. Integration Principles

- **API-first**: Prefer REST/GraphQL/Webhook integrations over flat-file where possible.
- **Near real-time**: Use webhooks or streaming where supported; otherwise, poll on a short interval (e.g., 5–15 minutes) for time-sensitive feeds.
- **Idempotent**: All ingested records should be replay-safe using unique IDs and timestamps.
- **Tenant-aware**: Every integration call is associated with a `tenantId`.
- **Observable**: Each connector has health metrics, error logs, and retry policies.

---

### 2. MVP Integrations (Phase 1 – Visibility)

#### 2.1 ERP / Order Management

**Purpose:** Seed PO digital twins with master data and planned milestones.

- **Data needed**
  - Purchase orders:
    - `poId`, `customer`, `supplier`, `factory`, `product`, `quantity`, `unit`, `price` (optional).
    - `shipWindowStart`, `shipWindowEnd`, `requestedDeliveryDate`.
    - `routeTemplate` (origin, ports, destination).
  - PO line items:
    - `lineItemId`, `sku`, `color`, `size`, `lineQuantity`.
  - Status changes:
    - `poStatus` (open, closed, cancelled), revisions.

- **Integration mode (MVP)**
  - **Initial sync**: Batch import via REST API or CSV drop.
  - **Ongoing sync**: Webhook on PO creation/update if available; otherwise poll every 15 minutes.

- **Priority:** **P0 – Required before go-live.**

#### 2.2 Factory / Production Systems

**Purpose:** Populate production stages (yarn received, knitting, dyeing, QA, packing) in the PO timeline.

- **Data needed**
  - Planned and actual timestamps for:
    - Yarn receiving.
    - Knitting start/complete.
    - Dyeing start/complete.
    - QA checks and results.
    - Packing start/complete.
  - Work orders and machine line references.

- **Integration mode (MVP)**
  - Start simple: allow CSV / flat-file uploads or a lightweight REST endpoint so factories can push basic milestones.
  - Long term: integrate with existing MES / production systems via API when available.

- **Priority:** **P0 – Required for PO stories to reflect production.**

#### 2.3 Worker QR-Scanning App

**Purpose:** Capture granular, real-time events for key physical units via QR scans.

- **Data needed**
  - Scan events as defined in the **event-model** document.

- **Integration mode**
  - Direct first-party integration (TraceLoom Worker app -> TraceLoom API).
  - No external connector required, but forms a **P0 internal integration**.

- **Priority:** **P0 – Differentiating feature for traceability.**

#### 2.4 Core Logistics Tracking

**Purpose:** Reflect shipping milestones (gate in/out, vessel departure/arrival, delivery).

- **Data needed**
  - Booking references, container numbers, AWB numbers.
  - Milestones: `GATE_IN`, `GATE_OUT`, `LOADED_ON_VESSEL`, `DEPARTED`, `ARRIVED`, `OUT_FOR_DELIVERY`, `DELIVERED`.
  - Carrier and lane identifiers.

- **Integration mode (MVP)**
  - Integrate with one or two key logistics providers or an aggregator API where possible.
  - Webhook-based if available; else polling every 30–60 minutes.

- **Priority:** **P0 – Needed to show in-transit status and ETA.**

---

### 3. Phase 2 – Analytics & Risk

#### 3.1 IoT Sensors (Factory & Transport)

**Purpose:** Enrich PO stories with environmental and machine data; feed quality and delay prediction models.

- **Data needed**
  - Factory sensors:
    - Temperature, humidity, vibration near storage or machines.
    - Machine runtime / stoppage logs.
  - Transport sensors:
    - GPS position of trucks or containers (if available).
    - Temperature for cold-chain / sensitive materials.

- **Integration mode**
  - Stream ingestion via MQTT/HTTP bridges into a time-series store.
  - Normalization jobs that emit PO-related events when thresholds or anomalies occur.

- **Priority:** **P1 – Enhances intelligence and root-cause explanations.**

#### 3.2 Public Weather Data

**Purpose:** Detect and explain disruption risk due to severe weather.

- **Data needed**
  - Storm warnings and typhoon signals (e.g., from Hong Kong Observatory).
  - Short- and medium-range forecasts for key route locations.

- **Integration mode**
  - Scheduled pulls (e.g., every 15 minutes) from public APIs (weather alerts).
  - Mapping from coordinates/ports to relevant weather zones.

- **Priority:** **P1 – Key for predictive delay alerts.**

#### 3.3 Port & Maritime Data

**Purpose:** Detect port congestion and vessel-level delays.

- **Data needed**
  - Port throughput statistics and congestion indices (e.g., DATA.GOV.HK).
  - Vessel positions / ETA and berth queues (government or AIS-based datasets).

- **Integration mode**
  - Regular ETL jobs (hourly) ingesting latest port statistics and vessel lists.
  - Matching algorithm:
    - Map Shipper’s `vesselName` and `voyage` to retrieved AIS records.

- **Priority:** **P1 – Strong contributor to shipping risk models.**

---

### 4. Phase 3 – Extended Intelligence & Storytelling

#### 4.1 Sustainability & Certification Data

**Purpose:** Power the customer-facing story with ESG/ethics badges.

- **Data needed**
  - Certification records:
    - `certificateType` (e.g., `Organic Cotton`, `Fair Trade`).
    - Validity periods and scope (factory/site).
  - Audit results and scores.

- **Integration mode**
  - Partner with existing certification databases or receive periodic CSV/feed from compliance teams.

- **Priority:** **P2 – Customer-facing differentiation.**

#### 4.2 Financial / Cost Data

**Purpose:** Allow impact analysis of delays (e.g., cost of air freight upgrades, chargebacks).

- **Data needed**
  - PO value, margin, penalties for late delivery.
  - Cost options for expedited routes.

- **Integration mode**
  - Secure, limited-scope integration to finance/ERP modules.

- **Priority:** **P2 – For advanced decision-support.**

---

### 5. Integration Matrix & Priorities

| Integration                          | Domain       | Type             | Priority | Phase |
|-------------------------------------|-------------|------------------|----------|-------|
| ERP / Order data                    | Internal    | REST/Batch       | P0       | 1     |
| Factory production milestones       | Internal    | REST/CSV         | P0       | 1     |
| Worker QR-scanning app              | Internal    | First-party API  | P0       | 1     |
| Core logistics tracking             | External    | REST/Webhook     | P0       | 1     |
| IoT sensors (factory/transport)     | Internal    | Streaming        | P1       | 2     |
| Public weather data                 | Public      | REST/Scheduled   | P1       | 2     |
| Port & maritime datasets            | Public      | ETL/Scheduled    | P1       | 2     |
| Sustainability & certification data | External    | Batch/API        | P2       | 3     |
| Financial / cost data               | Internal    | Secure API       | P2       | 3     |

---

### 6. Connector Responsibilities

Each connector should:

- Handle **authentication** (API keys, OAuth, etc.).
- Map external fields into TraceLoom’s **canonical schema** (POs, events, locations).
- Emit normalized **events** into the event store, using the schemas in `docs-event-model.md`.
- Implement **retries and backoff** for transient errors.
- Expose simple **health endpoints and metrics** for monitoring.

