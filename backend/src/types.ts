export type EntityType = 'PO' | 'LINE_ITEM' | 'PHYSICAL_UNIT' | 'SHIPMENT' | 'LOCATION';

export type EventSource = 'WORKER_APP' | 'ERP' | 'IOT' | 'LOGISTICS_API' | 'PUBLIC_DATA';

export interface LocationInfo {
  siteId?: string;
  latitude?: number;
  longitude?: number;
}

export interface RelatedIds {
  poId?: string;
  lineItemId?: string;
  physicalUnitId?: string;
  shipmentId?: string;
}

export interface EventEnvelope<TPayload = unknown> {
  eventId: string;
  tenantId: string;
  entityType: EntityType;
  entityId: string;
  relatedIds: RelatedIds;
  eventType: string;
  source: EventSource;
  timestamp: string; // ISO string
  location?: LocationInfo;
  payload: TPayload;
  ingestedAt: string; // ISO string
}

export interface PurchaseOrder {
  tenantId: string;
  poId: string;
  customer: string;
  supplier: string;
  factory: string;
  product: string;
  quantity: number;
  unit: string;
  shipWindowStart: string;
  shipWindowEnd: string;
  requestedDeliveryDate: string;
  currentStage: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  onTimeProbability: number; // 0-1
}

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export type AlertCategory = 'DELAY' | 'QUALITY' | 'DISRUPTION';

export interface Alert {
  alertId: string;
  tenantId: string;
  poId: string;
  category: AlertCategory;
  severity: AlertSeverity;
  reasonCode: string;
  title: string;
  description: string;
  dataSources: string[];
  recommendedActions: string[];
  createdAt: string;
  status: 'NEW' | 'IN_REVIEW' | 'RESOLVED';
}

export interface ScanEventRequest {
  tenantId: string;
  poId: string;
  lineItemId?: string;
  physicalUnitId?: string;
  operationCode: string;
  userId: string;
  metadata?: Record<string, unknown>;
  device?: {
    id?: string;
    type?: string;
  };
  location?: LocationInfo;
  scannedAt: string;
}

