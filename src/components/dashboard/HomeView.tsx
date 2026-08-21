import { useState, useRef, useCallback } from 'react';
import type { OnboardingData } from '../../types/onboarding';
import type { DashboardSection } from '../../pages/Dashboard';
import Modal from '../common/Modal';
import { formatCurrency, formatDate } from '../../utils/format';
import { AlertTriangle } from 'lucide-react';
import './HomeView.css';

interface Props {
  userData: OnboardingData;
  business: any;
  onNavigate: (section: DashboardSection) => void;
  onOpenChat: () => void;
  onOpenNotifications: () => void;
  onOpenHelp: () => void;
}

const SUGGESTIONS = [
  {
    id: 'chat',
    type: 'chat',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: '¿Necesitas registrar algo?',
    desc: 'Podés pedirle a Faro que lo haga por vos.',
    cta: 'Hablar con Faro',
    color: 'violet',
  },
  {
    id: 'reports',
    type: 'reports',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: 'Tus ventas de esta semana',
    desc: 'Mirá cómo le fue a tu negocio en los últimos días.',
    cta: 'Ver reporte',
    color: 'blue',
  },
  {
    id: 'inventory',
    type: 'inventory',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      </svg>
    ),
    title: 'Revisá tu inventario',
    desc: 'Algunos productos podrían estar con poco stock.',
    cta: 'Revisar inventario',
    color: 'orange',
  },
];

export default function HomeView({ userData, business, onNavigate, onOpenChat, onOpenNotifications, onOpenHelp }: Props) {
  const [activeModal, setActiveModal] = useState<'none' | 'purchase' | 'client' | 'expense'>('none');
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [clientName, setClientName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const [reviewedLowStockIds, setReviewedLowStockIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('faro_reviewed_low_stock');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleCloseModal = () => {
    setActiveModal('none');
    setAmount('');
    setDescription('');
    setClientName('');
  };

  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;
    business.addPurchase(Number(amount), description);
    handleCloseModal();
  };

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName) return;
    business.addClient(clientName, undefined, description);
    handleCloseModal();
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;
    business.addExpense(Number(amount), description);
    handleCloseModal();
  };

  const handleSuggestionCta = useCallback((type: string) => {
    if (type === 'chat') onOpenChat();
    else if (type === 'reports') onNavigate('reports');
    else if (type === 'inventory') {
      const lowStockIds = business.stats.lowStockProducts?.map((p: any) => p.id) || [];
      localStorage.setItem('faro_reviewed_low_stock', JSON.stringify(lowStockIds));
      setReviewedLowStockIds(lowStockIds);
      onNavigate('inventory');
    }
  }, [onOpenChat, onNavigate, business.stats.lowStockProducts]);

  const handleInputFocus = () => {
    onOpenChat();
  };

  const activitiesWithIcons = business.data.activities.slice(0, 5);
  const unreadCount = business.stats.unreadNotifications;
  const lowStock = business.stats.lowStockProducts ?? [];
  const unreviewedLowStock = lowStock.filter((p: any) => !reviewedLowStockIds.includes(p.id));

  // Pick contextual suggestion
  const currentSuggestion = unreviewedLowStock.length > 0
    ? {
        ...SUGGESTIONS.find(s => s.id === 'inventory'),
        title: '¡Alerta de Stock Bajo!',
        desc: `Tienes ${unreviewedLowStock.length} producto${unreviewedLowStock.length > 1 ? 's' : ''} con stock por debajo del mínimo.`,
        cta: 'Revisar Inventario',
        color: 'red' // Stronger visual indicator
      } as any
    : SUGGESTIONS[activeSuggestion % SUGGESTIONS.length];

  return (
    <div className="home-view">
      {/* Top Header */}
      <div className="home-header">
        {/* Mobile Logo & Info (Hidden on Desktop) */}
        <div className="mobile-only-header">
          <div className="mobile-brand">
            <span className="home-wave" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </span>
            <div className="mobile-brand-info">
              <h1 className="mobile-greeting">¡Hola, {userData.name}!</h1>
              <p className="mobile-business">{userData.businessName}</p>
            </div>
          </div>
          <button
            className="icon-button"
            aria-label="Notificaciones"
            onClick={onOpenNotifications}
            style={{ position: 'relative' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="notification-badge" aria-label={`${unreadCount} notificaciones`}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Desktop Greeting (Hidden on Mobile) */}
        <div className="home-greeting-wrap desktop-only">
          <span className="home-wave" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" /><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" /><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
            </svg>
          </span>
          <div>
            <h1 className="home-greeting">¡Hola, {userData.name}!</h1>
            <p className="home-sub">¿Qué pasó hoy en tu negocio?</p>
          </div>
        </div>
        <div className="home-header-actions">
          <button
            className="icon-button"
            aria-label="Notificaciones"
            onClick={onOpenNotifications}
            style={{ position: 'relative' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="notification-badge" aria-label={`${unreadCount} notificaciones`}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <button className="help-button" onClick={onOpenHelp} aria-label="Ayuda">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Ayuda
          </button>
        </div>
      </div>

      {/* Mobile AI Call to Action */}
      <div className="mobile-only-ai-card" onClick={onOpenChat}>
        <div className="moa-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
        <div className="moa-content">
          <h3>Faro AI</h3>
          <p>Tu asistente inteligente para gestionar tu negocio.</p>
        </div>
        <div className="moa-action">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>

      {/* AI Input (Desktop) */}
      <div className="ai-input-container desktop-only" onClick={() => inputRef.current?.focus()}>
        <input
          ref={inputRef}
          type="text"
          className="ai-text-input"
          placeholder="Contale a Faro lo que pasó hoy..."
          onFocus={handleInputFocus}
          readOnly
        />
        <p className="ai-input-hint">Ej: Vendí 4 filtros Bosch a Juan por $47.000</p>
        <div className="ai-input-actions">
          <div className="ai-input-tools">
            <button className="tool-button tool-button--active" onClick={onOpenChat} aria-label="Escribir mensaje">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Escribir
            </button>
            <button className="tool-button" onClick={onOpenChat} aria-label="Enviar audio">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
              </svg>
              Hablar
            </button>
            <button className="tool-button" onClick={onOpenChat} aria-label="Adjuntar archivo">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
              Adjuntar
            </button>
          </div>
          <button className="send-button" aria-label="Abrir Faro AI" onClick={onOpenChat}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="quick-action-btn" onClick={() => onNavigate('sales')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Registrar venta
        </button>
        <button className="quick-action-btn" onClick={() => setActiveModal('purchase')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Registrar compra
        </button>
        <button className="quick-action-btn" onClick={() => setActiveModal('client')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Nuevo cliente
        </button>
        <button className="quick-action-btn" onClick={() => setActiveModal('expense')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Nuevo gasto
        </button>
      </div>

      {/* Main Summary Card (Mobile Only) */}
      <div className="mobile-summary-card">
        <div className="msc-header">
          <span className="msc-title">Resultado Neto</span>
          <span className="msc-badge">Hoy</span>
        </div>
        <div className="msc-balance">{formatCurrency(business.stats.netResult)}</div>
        <div className="msc-stats">
          <div className="msc-stat-col">
            <span className="msc-stat-label">Ventas</span>
            <span className="msc-stat-val msc-up">+{formatCurrency(business.stats.totalSales)}</span>
          </div>
          <div className="msc-stat-col">
            <span className="msc-stat-label">Compras/Gastos</span>
            <span className="msc-stat-val msc-down">-{formatCurrency(business.stats.totalPurchases)}</span>
          </div>
        </div>
      </div>

      {/* Summary Cards (Desktop) */}
      <div className="summary-grid desktop-only">
        {[
          {
            label: 'Total Ventas', value: formatCurrency(business.stats.totalSales), color: 'green', hasData: business.stats.totalSales > 0,
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
          },
          {
            label: 'Total Compras', value: formatCurrency(business.stats.totalPurchases), color: 'blue', hasData: business.stats.totalPurchases > 0,
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
          },
          {
            label: 'Resultado Neto', value: formatCurrency(business.stats.netResult), color: business.stats.netResult >= 0 ? 'green' : 'orange', hasData: business.stats.netResult !== 0,
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
          },
          {
            label: 'Clientes', value: String(business.data.clients.length), color: 'purple', hasData: business.data.clients.length > 0,
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
          },
        ].map(card => (
          <div key={card.label} className="summary-card">
            <div className="summary-card-header">
              <div className={`summary-icon bg-${card.color}`}>{card.icon}</div>
              <span className="summary-title">{card.label}</span>
            </div>
            <div className="summary-amount">{card.value}</div>
            <div className={`summary-change ${card.hasData ? `text-${card.color}` : 'text-gray'}`}>
              {card.hasData ? 'Actualizado' : 'Sin datos aún'}
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="dashboard-content-grid">
        {/* Recent Activity */}
        <div className="activity-section">
          <div className="section-header-inline">
            <h3>Actividad reciente</h3>
            <button className="btn-link" onClick={() => onNavigate('reports')}>Ver más →</button>
          </div>
          <div className="activity-list">
            {activitiesWithIcons.length === 0 ? (
              <div className="activity-empty">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-tertiary)' }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <p>No hay actividad aún. Agrega ventas, compras o clientes.</p>
              </div>
            ) : (
              activitiesWithIcons.map((activity: any) => {
                const colorMap: Record<string, string> = {
                  sale: 'green', purchase: 'blue', client: 'purple',
                  expense: 'orange', inventory: 'blue', invoice: 'violet', supplier: 'blue',
                };
                const color = colorMap[activity.type] || 'gray';
                return (
                  <div key={activity.id} className="activity-item">
                    <div className={`activity-icon bg-${color}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    </div>
                    <div className="activity-details">
                      <p className="activity-title">{activity.title}</p>
                      <p className="activity-sub">
                        {activity.description}{activity.amount !== undefined ? ` · ${formatCurrency(Math.abs(activity.amount))}` : ''}
                      </p>
                    </div>
                    <div className="activity-time">{formatDate(activity.date)}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Faro Suggestions */}
        <div className="suggestions-section">
          <div className={`suggestion-card suggestion-card--${currentSuggestion.color}`}>
            <div className="suggestion-header">
              {currentSuggestion.icon}
              <span style={{ fontWeight: currentSuggestion.color === 'red' ? 600 : 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                {currentSuggestion.color === 'red' && <AlertTriangle size={16} />}
                {currentSuggestion.color === 'red' ? 'Atención Requerida' : 'Faro te sugiere'}
              </span>
              <button
                className="suggestion-close"
                onClick={() => setActiveSuggestion(s => (s + 1) % SUGGESTIONS.length)}
                aria-label="Siguiente sugerencia"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
            <div key={currentSuggestion.title} className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h4 className="suggestion-title">{currentSuggestion.title}</h4>
              <p className="suggestion-sub">{currentSuggestion.desc}</p>
              <div style={{ marginTop: 'auto' }}>
                <button
                  className="suggestion-cta"
                  onClick={() => handleSuggestionCta(currentSuggestion.type)}
                >
                  {currentSuggestion.cta}
                </button>
              </div>
            </div>
          </div>
          <div className="suggestion-dots">
            {SUGGESTIONS.map((_, i) => (
              <button
                key={i}
                className={`dot${activeSuggestion % SUGGESTIONS.length === i ? ' dot--active' : ''}`}
                onClick={() => setActiveSuggestion(i)}
                aria-label={`Sugerencia ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={activeModal === 'purchase'} onClose={handleCloseModal} title="Registrar Compra">
        <form className="modal-form" onSubmit={handlePurchaseSubmit}>
          <div className="modal-form-group">
            <label>Descripción / Proveedor</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Ej. Insumos oficina" required />
          </div>
          <div className="modal-form-group">
            <label>Monto</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" min="0" step="0.01" required />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={activeModal === 'client'} onClose={handleCloseModal} title="Nuevo Cliente">
        <form className="modal-form" onSubmit={handleClientSubmit}>
          <div className="modal-form-group">
            <label>Nombre del Cliente</label>
            <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Ej. Carlos Martínez" required />
          </div>
          <div className="modal-form-group">
            <label>Teléfono / Email (Opcional)</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Email o teléfono" />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={activeModal === 'expense'} onClose={handleCloseModal} title="Nuevo Gasto">
        <form className="modal-form" onSubmit={handleExpenseSubmit}>
          <div className="modal-form-group">
            <label>Descripción del Gasto</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Ej. Internet" required />
          </div>
          <div className="modal-form-group">
            <label>Monto</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" min="0" step="0.01" required />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
