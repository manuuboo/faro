import type { DashboardSection } from '../../pages/Dashboard';
import './MobileBottomNav.css';

interface Props {
  activeSection: DashboardSection;
  onNavigate: (section: DashboardSection) => void;
  onOpenChat: () => void;
  onOpenMas: () => void;
  unreadNotifications?: number;
}

function IconSales() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  );
}

function IconInvoices() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  );
}

function IconFaroAI() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

function IconFinances() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
    </svg>
  );
}

function IconMas() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="12" r="1.5"/>
      <circle cx="12" cy="12" r="1.5"/>
      <circle cx="19" cy="12" r="1.5"/>
    </svg>
  );
}

const MAS_SECTIONS: DashboardSection[] = ['inventory', 'clients', 'suppliers', 'purchases', 'reports', 'settings'];

export default function MobileBottomNav({ activeSection, onNavigate, onOpenChat, onOpenMas, unreadNotifications = 0 }: Props) {
  const isChat = activeSection === 'chat';
  const isMas = MAS_SECTIONS.includes(activeSection);

  return (
    <nav className="mobile-bottom-nav" aria-label="Navegación principal móvil">
      {/* Ventas */}
      <button
        className={`mbn-item${activeSection === 'sales' ? ' mbn-item--active' : ''}`}
        onClick={() => onNavigate('sales')}
        aria-label="Ventas"
      >
        <span className="mbn-icon"><IconSales /></span>
        <span className="mbn-label">Ventas</span>
      </button>

      {/* Facturación */}
      <button
        className={`mbn-item${activeSection === 'invoices' ? ' mbn-item--active' : ''}`}
        onClick={() => onNavigate('invoices')}
        aria-label="Facturación"
      >
        <span className="mbn-icon"><IconInvoices /></span>
        <span className="mbn-label">Facturación</span>
      </button>

      {/* Central Faro AI */}
      <div className="mbn-center-wrap">
        <button
          className={`mbn-center-btn${isChat ? ' mbn-center-btn--active' : ''}`}
          onClick={onOpenChat}
          aria-label="Faro AI"
        >
          <IconFaroAI />
        </button>
        <span className="mbn-center-label">Faro AI</span>
      </div>

      {/* Gastos / Finances */}
      <button
        className={`mbn-item${activeSection === 'finances' ? ' mbn-item--active' : ''}`}
        onClick={() => onNavigate('finances')}
        aria-label="Gastos"
      >
        <span className="mbn-icon"><IconFinances /></span>
        <span className="mbn-label">Gastos</span>
      </button>

      {/* Más */}
      <button
        className={`mbn-item${isMas ? ' mbn-item--active' : ''}`}
        onClick={onOpenMas}
        aria-label="Más opciones"
        style={{ position: 'relative' }}
      >
        <span className="mbn-icon"><IconMas /></span>
        <span className="mbn-label">Más</span>
        {unreadNotifications > 0 && (
          <span className="mbn-badge">{unreadNotifications > 9 ? '9+' : unreadNotifications}</span>
        )}
      </button>
    </nav>
  );
}
