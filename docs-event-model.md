## Event Model & QR Schema

### 1. Core Identity Model

- **TenantId**: Logical tenant (e.g., Cobalt or other brand).
- **PurchaseOrderId (PO ID)**: Primary key from ERP.
- **LineItemId**: Style / color / size or SKU-level identifier within a PO.
- **PhysicalUnitId**: System-generated ID for a physical unit (batch, bundle, carton, or pallet).
- **ShipmentId**: Logical shipment record (container, truck, airway bill).

These IDs combine to form a **digital twin** per PO and its physical manifestations.

### 2. QR Code Payload

QR codes are printed on labels attached to **physical units** (bundles/cartons/pallets).

**Payload format (compact pipe-delimited string):**

```text
<tenantId>|<poId>|<lineItemId>|<physicalUnitId>|<version>|<checksum>
```

- `tenantId`: Short code for the tenant, e.g., `cobalt`.
- `poId`: External PO identifier from ERP (e.g., `KT1823`).
- `lineItemId`: ERP line item or SKU code (e.g., `LN-002`).
- `physicalUnitId`: UUID or short hash identifying a carton / pallet (e.g., `U8F3KD2`).
- `version`: QR schema version (e.g., `v1`), for future-proofing.
- `checksum`: Optional integrity check (e.g., CRC32 or short HMAC).

**Security principle**: the QR code contains only **opaque identifiers**, not confidential data. All sensitive context is fetched from the backend after scan using authenticated APIs.

### 3. Event Types

All time-based updates are stored as **events** keyed by one or more IDs.

High-level categories:

- **Order events** – business milestones for the overall PO.
- **Production events** – factory-floor and WIP updates.
- **Quality events** – inspections, test results, and approvals.
- **Logistics events** – transport, port, and customs milestones.
- **Warehouse events** – receipt, storage, picking, and dispatch.
- **External risk events** – weather, port congestion, road disruptions.

Representative `eventType` values (non-exhaustive):

- `PO_CREATED`
- `YARN_DISPATCHED`
- `YARN_RECEIVED`
- `PRODUCTION_START`
- `PRODUCTION_PAUSE`
- `PRODUCTION_COMPLETE`
- `DYEING_START`
- `DYEING_COMPLETE`
- `QA_INSPECTION_STARTED`
- `QA_INSPECTION_PASSED`
- `QA_INSPECTION_FAILED`
- `PACKING_STARTED`
- `PACKING_COMPLETED`
- `UNIT_LOADED_ON_TRUCK`
- `UNIT_UNLOADED_FROM_TRUCK`
- `CONTAINER_GATE_IN`
- `CONTAINER_GATE_OUT`
- `VESSEL_DEPARTED`
- `VESSEL_ARRIVED`
- `CUSTOMS_CLEARED`
- `WAREHOUSE_RECEIVED`
- `CUSTOMER_DISPATCHED`
- `EXTERNAL_WEATHER_ALERT`
- `EXTERNAL_PORT_CONGESTION_ALERT`

### 4. Event Record Schema

All events share a common envelope and a typed `payload`.

```json
{
  "eventId": "uuid",
  "tenantId": "cobalt",
  "entityType": "PO | LINE_ITEM | PHYSICAL_UNIT | SHIPMENT | LOCATION",
  "entityId": "KT1823",
  "relatedIds": {
    "poId": "KT1823",
    "lineItemId": "LN-002",
    "physicalUnitId": "U8F3KD2",
    "shipmentId": "SHIP-9821"
  },
  "eventType": "PACKING_COMPLETED",
  "source": "WORKER_APP | ERP | IOT | LOGISTICS_API | PUBLIC_DATA",
  "timestamp": "2026-01-27T10:15:00Z",
  "location": {
    "siteId": "VN-FAC-01",
    "latitude": 10.8231,
    "longitude": 106.6297
  },
  "payload": {},
  "ingestedAt": "2026-01-27T10:15:01Z"
}
```

Notes:

- `entityType` + `entityId` give the **primary timeline** that this event belongs to (e.g., PO timeline).
- `relatedIds` lets a single event be visible on multiple views (PO, shipment, unit).
- `payload` is typed per `eventType` (see below).

### 5. Example Payloads by Event Type

#### 5.1 Yarn received at factory

```json
{
  "eventType": "YARN_RECEIVED",
  "payload": {
    "supplierId": "VN-TEXTILE-CO",
    "batchId": "BATCH-9876",
    "quantityKg": 520,
    "expectedQuantityKg": 520,
    "receivedAt": "2026-01-08T09:12:00Z",
    "notes": "No visible damage to cones."
  }
}
```

#### 5.2 Production started

```json
{
  "eventType": "PRODUCTION_START",
  "payload": {
    "lineId": "KNIT-LINE-03",
    "machineIds": ["M-201", "M-202"],
    "plannedCompletionAt": "2026-01-15T18:00:00Z",
    "operatorId": "WORKER-104"
  }
}
```

#### 5.3 QA inspection result

```json
{
  "eventType": "QA_INSPECTION_PASSED",
  "payload": {
    "inspectionId": "QA-5551",
    "batchId": "BATCH-9876",
    "sampleSize": 80,
    "defectRatePct": 1.2,
    "criteria": ["Stitching", "Color fastness"],
    "inspectorId": "QA-LEAD-01",
    "attachments": [
      {
        "type": "PHOTO",
        "url": "https://.../qa-photos/QA-5551/front.jpg"
      }
    ]
  }
}
```

#### 5.4 Logistics milestone – container gate in

```json
{
  "eventType": "CONTAINER_GATE_IN",
  "payload": {
    "containerNumber": "TCLU1234567",
    "vesselName": "MV BLUE OCEAN",
    "portCode": "VNSGN",
    "gateInAt": "2026-02-02T14:30:00Z"
  }
}
```

### 6. Worker QR Scan Event Flow

1. Worker opens the **Worker App** and taps **Scan QR**.
2. The app decodes the QR payload into `tenantId`, `poId`, `lineItemId`, `physicalUnitId`, `version`, `checksum`.
3. The app calls a backend endpoint such as:

```text
POST /api/v1/events/scan
```

Request body:

```json
{
  "tenantId": "cobalt",
  "poId": "KT1823",
  "lineItemId": "LN-002",
  "physicalUnitId": "U8F3KD2",
  "operationCode": "PACKING_COMPLETED",
  "userId": "WORKER-104",
  "metadata": {
    "quantityUnits": 150,
    "photoUrls": []
  },
  "device": {
    "id": "DEVICE-01",
    "type": "ANDROID_PWA"
  },
  "location": {
    "siteId": "VN-FAC-01",
    "latitude": 10.8231,
    "longitude": 106.6297
  },
  "scannedAt": "2026-01-27T10:15:00Z"
}
```

The backend:

- Validates `checksum` and identifiers.
- Maps `operationCode` to an `eventType`.
- Creates a normalized **event** record in the event store.
- Triggers:
  - PO timeline update.
  - Risk model recalculation.
  - Any relevant alerts (e.g., if packing completed later than baseline).

### 7. Event Streams & Timelines

- **PO timeline**: all events where `relatedIds.poId` = PO plus external risk events affecting its route.
- **Unit timeline**: events where `entityType = PHYSICAL_UNIT` or `relatedIds.physicalUnitId` matches.
- **Shipment timeline**: events keyed by `shipmentId` and vessel / port information.

These timelines feed:

- **Control Tower dashboard** (aggregated status and KPIs).
- **PO Story view** (ordered narrative of events + AI insights).
- **Customer Journey UI** (subset of events, simplified language).

