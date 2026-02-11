import express from 'express';
import { addAlert, addEvent, alerts, events, purchaseOrders } from './store';
import { Alert, EventEnvelope, ScanEventRequest } from './types';
import { randomUUID } from 'crypto';

const router = express.Router();

// GET /api/pos - list purchase orders
router.get('/pos', (_req, res) => {
  res.json(purchaseOrders);
});

// GET /api/pos/:poId - get a single PO with basic timeline and alerts
router.get('/pos/:poId', (req, res) => {
  const { poId } = req.params;
  const po = purchaseOrders.find(p => p.poId === poId);
  if (!po) {
    return res.status(404).json({ error: 'PO not found' });
  }

  const poEvents = events.filter(e => e.relatedIds.poId === poId);
  const poAlerts = alerts.filter(a => a.poId === poId);

  res.json({
    po,
    timeline: poEvents.sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
    alerts: poAlerts
  });
});

// GET /api/alerts - list current alerts
router.get('/alerts', (_req, res) => {
  res.json(alerts);
});

// POST /api/events/scan - worker QR scan ingestion
router.post('/events/scan', (req, res) => {
  const body = req.body as ScanEventRequest;

  if (!body?.tenantId || !body?.poId || !body?.operationCode || !body?.userId || !body?.scannedAt) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const po = purchaseOrders.find(p => p.poId === body.poId && p.tenantId === body.tenantId);
  if (!po) {
    return res.status(404).json({ error: 'PO not found for tenant' });
  }

  const nowIso = new Date().toISOString();

  const event: EventEnvelope = {
    eventId: randomUUID(),
    tenantId: body.tenantId,
    entityType: 'PHYSICAL_UNIT',
    entityId: body.physicalUnitId ?? body.poId,
    relatedIds: {
      poId: body.poId,
      lineItemId: body.lineItemId,
      physicalUnitId: body.physicalUnitId
    },
    eventType: mapOperationToEventType(body.operationCode),
    source: 'WORKER_APP',
    timestamp: body.scannedAt,
    location: body.location,
    payload: {
      userId: body.userId,
      metadata: body.metadata,
      device: body.device
    },
    ingestedAt: nowIso
  };

  addEvent(event);

  // Naive example: if packing completed late vs ship window end, raise a delay alert.
  const maybeAlert = buildSimpleAlertFromEvent(event, po.shipWindowEnd);
  if (maybeAlert) {
    addAlert(maybeAlert);
  }

  res.status(201).json({ eventId: event.eventId });
});

function mapOperationToEventType(operationCode: string): string {
  const mapping: Record<string, string> = {
    RECEIVE_YARN: 'YARN_RECEIVED',
    START_KNITTING: 'PRODUCTION_START',
    COMPLETE_KNITTING: 'PRODUCTION_COMPLETE',
    START_DYEING: 'DYEING_START',
    COMPLETE_DYEING: 'DYEING_COMPLETE',
    QA_PASSED: 'QA_INSPECTION_PASSED',
    QA_FAILED: 'QA_INSPECTION_FAILED',
    PACKING_STARTED: 'PACKING_STARTED',
    PACKING_COMPLETED: 'PACKING_COMPLETED',
    LOAD_FOR_SHIPPING: 'UNIT_LOADED_ON_TRUCK'
  };

  return mapping[operationCode] ?? operationCode;
}

function buildSimpleAlertFromEvent(event: EventEnvelope, shipWindowEndIso: string): Alert | null {
  if (event.eventType !== 'PACKING_COMPLETED') {
    return null;
  }

  const shipWindowEnd = new Date(shipWindowEndIso).getTime();
  const eventTime = new Date(event.timestamp).getTime();

  if (Number.isNaN(shipWindowEnd) || Number.isNaN(eventTime)) {
    return null;
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const daysDiff = (eventTime - shipWindowEnd) / msPerDay;

  if (daysDiff <= 0) {
    // On or before ship window end; no alert in this simple prototype.
    return null;
  }

  const severity = daysDiff > 2 ? 'CRITICAL' : 'WARNING';

  const alert: Alert = {
    alertId: randomUUID(),
    tenantId: event.tenantId,
    poId: event.relatedIds.poId ?? '',
    category: 'DELAY',
    severity,
    reasonCode: 'PACKING_COMPLETED_AFTER_SHIP_WINDOW',
    title: 'Packing completed after ship window end',
    description: `Packing was completed ${daysDiff.toFixed(
      1
    )} days after the ship window end date. This PO is at risk of late shipment.`,
    dataSources: ['WorkerScans'],
    recommendedActions: [
      'Review shipping options (expedite if necessary).',
      'Notify customer about potential delay.'
    ],
    createdAt: event.ingestedAt,
    status: 'NEW'
  };

  return alert;
}

export default router;

