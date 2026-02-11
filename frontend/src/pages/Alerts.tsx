import { useEffect, useState } from 'react';
import type { Alert } from '../../backend/src/types';

export function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/alerts');
        const data = (await res.json()) as Alert[];
        setAlerts(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="page">
      <header className="page-header">
        <h1>Alerts</h1>
      </header>
      {loading ? (
        <div>Loading...</div>
      ) : alerts.length === 0 ? (
        <div>No alerts yet.</div>
      ) : (
        <div className="alerts-grid">
          {alerts.map(alert => (
            <div key={alert.alertId} className={`alert-card alert-${alert.severity.toLowerCase()}`}>
              <div className="alert-header">
                <span className="alert-severity">{alert.severity}</span>
                <span className="alert-title">{alert.title}</span>
              </div>
              <p className="alert-description">{alert.description}</p>
              <div className="alert-footer">
                <span>{alert.category}</span>
                <span>{new Date(alert.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

