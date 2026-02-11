import { Route, Routes, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { PurchaseOrders } from './pages/PurchaseOrders';
import { PurchaseOrderStory } from './pages/PurchaseOrderStory';
import { Alerts } from './pages/Alerts';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/overview" replace />} />
        <Route path="/overview" element={<Dashboard />} />
        <Route path="/purchase-orders" element={<PurchaseOrders />} />
        <Route path="/purchase-orders/:poId" element={<PurchaseOrderStory />} />
        <Route path="/alerts" element={<Alerts />} />
      </Routes>
    </Layout>
  );
}

