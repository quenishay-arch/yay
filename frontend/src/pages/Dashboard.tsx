import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { PurchaseOrder } from '../../backend/src/types';

interface AlertSummary {
  id: string;
  title: string;
  severity: string;
  poId: string;
}

export function Dashboard() {
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/pos');
        const data = (await res.json()) as PurchaseOrder[];
        setPos(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const activePos = pos.length;
  const delayedPos = pos.filter(po => po.riskLevel !== 'LOW').length;
  const delayRatePct = activePos ? Math.round((delayedPos / activePos) * 100) : 0;
  const trustScore = Math.round(
    pos.reduce((sum, po) => sum + po.onTimeProbability, 0) / (pos.length || 1) * 100
  );

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Control Tower</h1>
          <p className="page-subtitle">Real-time supply chain intelligence</p>
        </div>
      </header>

      <section className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Active POs</div>
          <div className="kpi-value">{activePos}</div>
          <div className="kpi-sub">Currently in transit</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Delayed POs</div>
          <div className="kpi-value">{delayedPos}</div>
          <div className="kpi-sub">Require attention</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Delay Rate</div>
          <div className="kpi-value">{delayRatePct}%</div>
          <div className="kpi-sub">Last 30 days</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Trust Score</div>
          <div className="kpi-value">{trustScore}</div>
          <div className="kpi-sub">Based on on-time probability</div>
        </div>
      </section>

      <section className="grid-2">
        <div className="panel">
          <div className="panel-header">
            <h2>Purchase Orders</h2>
          </div>
          {loading ? (
            <div className="panel-body">Loading...</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Product</th>
                  <th>Stage</th>
                  <th>Risk</th>
                  <th>ETA</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {pos.map(po => (
                  <tr key={po.poId}>
                    <td>{po.poId}</td>
                    <td>{po.product}</td>
                    <td>{po.currentStage}</td>
                    <td>
                      <span className={`pill pill-${po.riskLevel.toLowerCase()}`}>
                        {po.riskLevel}
                      </span>
                    </td>
                    <td>{new Date(po.requestedDeliveryDate).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/purchase-orders/${po.poId}`} className="link">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Alerts</h2>
          </div>
          <div className="panel-body">
            <p>Alerts list UI will connect to /api/alerts.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

