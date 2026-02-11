import { Alert, EventEnvelope, PurchaseOrder } from './types';

// Simple in-memory store for prototype / dev usage.

export const purchaseOrders: PurchaseOrder[] = [
  {
    tenantId: 'cobalt',
    poId: 'KT1823',
    customer: 'Cobalt Apparel',
    supplier: 'Vietnam Textile Co.',
    factory: 'Dongguan Knitting Factory',
    product: "Kids Cardigan Set - Multi",
    quantity: 5000,
    unit: 'pcs',
    shipWindowStart: '2026-02-01T00:00:00Z',
    shipWindowEnd: '2026-02-10T00:00:00Z',
    requestedDeliveryDate: '2026-03-01T00:00:00Z',
    currentStage: 'DYEING',
    riskLevel: 'MEDIUM',
    onTimeProbability: 0.76
  },
  {
    tenantId: 'cobalt',
    poId: 'KT1824',
    customer: 'Cobalt Apparel',
    supplier: 'Vietnam Textile Co.',
    factory: 'Bangladesh Textile Ltd',
    product: "Women\'s Knit Sweater - Cream",
    quantity: 6000,
    unit: 'pcs',
    shipWindowStart: '2026-02-05T00:00:00Z',
    shipWindowEnd: '2026-02-15T00:00:00Z',
    requestedDeliveryDate: '2026-03-05T00:00:00Z',
    currentStage: 'SHIPPING',
    riskLevel: 'LOW',
    onTimeProbability: 0.9
  }
];

export const events: EventEnvelope[] = [];

export const alerts: Alert[] = [];

export function addEvent(event: EventEnvelope): void {
  events.push(event);
}

export function addAlert(alert: Alert): void {
  alerts.push(alert);
}

