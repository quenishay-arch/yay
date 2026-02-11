import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Alert, EventEnvelope, PurchaseOrder } from '../../backend/src/types';

interface PoStoryResponse {
  po: PurchaseOrder;
  timeline: EventEnvelope[];
  alerts: Alert[];
}

export function PurchaseOrderStory() {
  const { poId } = useParams<{ poId: string }>();
  const [data, setData] = useState<PoStoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!poId) return;
      try {
        const res = await fetch(`/api/pos/${poId}`);
        if (!res.ok) {
          throw new Error('Failed to load PO');
        }
        const json = (await res.json()) as PoStoryResponse;
        setData(json);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [poId]);

  if (loading) return <div className="page">Loading...</div>;
  if (error || !data) return <div className="page">Error: {error}</div>;

  const { po, timeline, alerts } = data;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>
            {po.poId} · {po.product}
          </h1>
          <p className="page-subtitle">
            {po.customer} · {po.supplier} · {po.factory}
          </p>
        </div>
        <div className="po-metrics">
          <div>
            <div className="metric-label">On-time probability</div>
            <div className="metric-value">{Math.round(po.onTimeProbability * 100)}%</div>
          </div>
          <div>
            <div className="metric-label">Risk level</div>
            <span className={`pill pill-${po.riskLevel.toLowerCase()}`}>{po.riskLevel}</span>
          </div>
        </div>
      </header>

      <section className="grid-2">
        <div className="panel">
          <div className="panel-header">
            <h2>Traceability Timeline</h2>
          </div>
          <div className="timeline">
            {timeline.map(event => (
              <div key={event.eventId} className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <div className="timeline-title">{event.eventType}</div>
                  <div className="timeline-meta">
                    <span>{new Date(event.timestamp).toLocaleString()}</span>
                    {event.location?.siteId && <span> · {event.location.siteId}</span>}
                  </div>
                </div>
              </div>
            ))}
            {timeline.length === 0 && (
              <div className="panel-body">No events yet recorded for this PO.</div>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Alerts</h2>
          </div>
          <div className="panel-body">
            {alerts.length === 0 ? (
              <p>No alerts for this PO.</p>
            ) : (
              alerts.map(alert => (
                <div key={alert.alertId} className={`alert-card alert-${alert.severity.toLowerCase()}`}>
                  <div className="alert-header">
                    <span className="alert-severity">{alert.severity}</span>
                    <span className="alert-title">{alert.title}</span>
                  </div>
                  <p className="alert-description">{alert.description}</p>
                  <div className="alert-footer">
                    <span>{new Date(alert.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

