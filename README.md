## TraceLoom Control Tower (Prototype)

This repository contains a **prototype implementation** of the TraceLoom web-based control tower described in the design documents:

- `docs-event-model.md` – PO event schema and QR code payload format.
- `docs-ux-wireframes.md` – UX specs for the control tower, PO story, alerts, supplier view, customer portal, and worker app.
- `docs-data-integrations.md` – Data source integration plan and priorities.
- `docs-risk-models.md` – Exception rules and risk model specifications.

### Structure

Planned structure (in progress):

- `backend/` – TypeScript/Node API implementing:
  - PO digital twin models.
  - Event ingestion (including worker QR scan endpoint).
  - Simple in-memory storage for POs, events, and alerts.
- `frontend/` – Web UI (React/TypeScript) that will consume the backend API.

### Getting Started (backend prototype)

> Note: Commands assume you are in the repository root.

1. Install dependencies:

```bash
cd backend
npm install
```

2. Run the dev server:

```bash
npm run dev
```

3. The API will be available at `http://localhost:4000` (configurable).

Key endpoints (initial prototype):

- `GET /api/pos` – list purchase orders.
- `GET /api/pos/:poId` – get a PO story (summary + timeline).
- `POST /api/events/scan` – ingest a worker QR scan event and update the PO timeline.
- `GET /api/alerts` – list current alerts for the control tower dashboard.

These endpoints align with the schemas and flows defined in the design docs and are intended as a foundation for the eventual production implementation.

# yay
