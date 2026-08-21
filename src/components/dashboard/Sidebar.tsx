import React from 'react';
import type { DashboardSection } from '../../pages/Dashboard';
import type { OnboardingData } from '../../types/onboarding';
import AnimatedLogo from '../onboarding/AnimatedLogo';
import './Sidebar.css';

// ── SVG Icon Components ──────────────────────────────────────────────────────

function IconHome() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}

function IconSales() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  );
}

function IconPurchases() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  );
}

function IconInventory() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
}

function IconClients() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

function IconSuppliers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  );
}

function IconReports() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );
}

function IconInvoices() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}

function IconChat() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

// ── Nav Items ───────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: DashboardSection; label: string; Icon: React.FC }[] = [
  { id: 'home',      label: 'Inicio',         Icon: IconHome },
  { id: 'chat',      label: 'Faro AI',        Icon: IconChat },
  { id: 'sales',     label: 'Ventas',         Icon: IconSales },
  { id: 'purchases', label: 'Compras',        Icon: IconPurchases },
  { id: 'inventory', label: 'Inventario',     Icon: IconInventory },
  { id: 'clients',   label: 'Clientes',       Icon: IconClients },
  { id: 'suppliers', label: 'Proveedores',    Icon: IconSuppliers },
  { id: 'reports',   label: 'Reportes',       Icon: IconReports },
  { id: 'invoices',  label: 'Facturación',    Icon: IconInvoices },
  { id: 'settings',  label: 'Configuración',  Icon: IconSettings },
];

// ── Props ────────────────────────────────────────────────────────────────────

interface Props {
  activeSection: DashboardSection;
  onNavigate: (section: DashboardSection) => void;
  userData: OnboardingData;
  onProfileClick: () => void;
  unreadNotifications: number;
  showProfileMenu: boolean;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

function getInitials(name: string): string {
  return name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

export default function Sidebar({
  activeSection,
  onNavigate,
  userData,
  onProfileClick,
  showProfileMenu,
  isMobileOpen,
  onCloseMobile
}: Props) {
  return (
    <aside className={`sidebar ${isMobileOpen ? 'sidebar--mobile-open' : ''}`} role="navigation" aria-label="Main navigation">
      {/* Brand */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <AnimatedLogo size={28} />
          </div>
          <span className="sidebar-brand-name">Faro</span>
        </div>
        
        {isMobileOpen && onCloseMobile && (
          <button className="sidebar-close-btn" onClick={onCloseMobile}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>
      <p className="sidebar-brand-sub">Tu asistente administrativo inteligente</p>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              id={`nav-${id}`}
              type="button"
              className={`sidebar-nav-item${isActive ? ' sidebar-nav-item--active' : ''}`}
              onClick={() => onNavigate(id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="sidebar-nav-icon" aria-hidden="true">
                <Icon />
              </span>
              <span className="sidebar-nav-label">{label}</span>
              {id === 'chat' && (
                <span className="sidebar-nav-ai-dot" aria-hidden="true"/>
              )}
            </button>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="sidebar-spacer" />

      {/* User profile */}
      <button
        className={`sidebar-profile${showProfileMenu ? ' sidebar-profile--active' : ''}`}
        aria-label="User profile menu"
        onClick={onProfileClick}
        type="button"
      >
        <div className="profile-avatar" aria-hidden="true">
          {getInitials(userData.name)}
        </div>
        <div className="profile-info">
          <span className="profile-name">{userData.name}</span>
          <span className="profile-business">{userData.businessName}</span>
        </div>
        <div className="profile-chevron" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </button>
    </aside>
  );
}
