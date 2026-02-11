import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { PurchaseOrder } from '../../backend/src/types';

export function PurchaseOrders() {
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

  return (
    <div className="page">
      <header className="page-header">
        <h1>Purchase Orders</h1>
      </header>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>PO</th>
              <th>Product</th>
              <th>Supplier</th>
              <th>Factory</th>
              <th>Stage</th>
              <th>Risk</th>
              <th>On-time %</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {pos.map(po => (
              <tr key={po.poId}>
                <td>{po.poId}</td>
                <td>{po.product}</td>
                <td>{po.supplier}</td>
                <td>{po.factory}</td>
                <td>{po.currentStage}</td>
                <td>
                  <span className={`pill pill-${po.riskLevel.toLowerCase()}`}>
                    {po.riskLevel}
                  </span>
                </td>
                <td>{Math.round(po.onTimeProbability * 100)}%</td>
                <td>
                  <Link to={`/purchase-orders/${po.poId}`} className="link">
                    View story
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

