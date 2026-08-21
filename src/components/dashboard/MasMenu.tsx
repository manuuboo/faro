import type { DashboardSection } from '../../pages/Dashboard';
import './MasMenu.css';

interface Props {
  activeSection: DashboardSection;
  onNavigate: (section: DashboardSection) => void;
  onClose: () => void;
  userData: any;
  onOpenNotifications: () => void;
  onLogout: () => void;
  unreadNotifications: number;
}

const MAS_ITEMS: {
  id: DashboardSection | 'home' | 'notifications' | 'logout';
  label: string;
  desc: string;
  icon: JSX.Element;
  isAction?: boolean;
  isDanger?: boolean;
}[] = [
  {
    id: 'home',
    label: 'Inicio',
    desc: 'Panel principal',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    id: 'inventory',
    label: 'Inventario',
    desc: 'Gestioná tu stock',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
  },
  {
    id: 'clients',
    label: 'Clientes',
    desc: 'Tu cartera de clientes',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    id: 'suppliers',
    label: 'Proveedores',
    desc: 'Contactos de proveedores',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
      </svg>
    ),
  },
  {
    id: 'purchases',
    label: 'Compras',
    desc: 'Historial de compras',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"/>
        <circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
    ),
  },
  {
    id: 'reports',
    label: 'Reportes',
    desc: 'Análisis y estadísticas',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Configuración',
    desc: 'Ajustes de tu cuenta',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
];

function getInitials(name: string) {
  return name.trim().split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

export default function MasMenu({ activeSection, onNavigate, onClose, userData, onOpenNotifications, onLogout, unreadNotifications }: Props) {
  const handleNav = (id: DashboardSection) => {
    onNavigate(id);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="mas-backdrop" onClick={onClose} aria-hidden="true" />

      {/* Bottom sheet */}
      <div className="mas-sheet" role="dialog" aria-label="Más opciones">
        {/* Drag handle */}
        <div className="mas-handle" />

        {/* User header */}
        <div className="mas-user-row">
          <div className="mas-user-avatar">{getInitials(userData.name)}</div>
          <div className="mas-user-info">
            <p className="mas-user-name">{userData.name}</p>
            <p className="mas-user-biz">{userData.businessName}</p>
          </div>
          <button
            className="mas-notif-btn"
            onClick={() => { onOpenNotifications(); onClose(); }}
            aria-label="Notificaciones"
            style={{ position: 'relative' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unreadNotifications > 0 && (
              <span className="mas-notif-badge">{unreadNotifications > 9 ? '9+' : unreadNotifications}</span>
            )}
          </button>
        </div>

        {/* Section grid */}
        <div className="mas-grid">
          {MAS_ITEMS.map(item => (
            <button
              key={item.id}
              className={`mas-grid-item${activeSection === item.id ? ' mas-grid-item--active' : ''}`}
              onClick={() => handleNav(item.id as DashboardSection)}
            >
              <span className="mas-grid-icon">{item.icon}</span>
              <span className="mas-grid-label">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Bottom actions */}
        <div className="mas-footer">
          <button
            className="mas-footer-btn mas-footer-btn--danger"
            onClick={() => { onLogout(); onClose(); }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
}
