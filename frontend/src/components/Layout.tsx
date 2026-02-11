import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="logo">TraceLoom</div>
        <nav className="nav">
          <NavLink to="/overview" className="nav-link">
            Overview
          </NavLink>
          <NavLink to="/purchase-orders" className="nav-link">
            Purchase Orders
          </NavLink>
          <NavLink to="/alerts" className="nav-link">
            Alerts
          </NavLink>
        </nav>
        <div className="sidebar-secondary">
          <div className="sidebar-label">Customer</div>
          <button className="ghost-button" type="button">
            Customer Portal
          </button>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}

