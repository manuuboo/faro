import { useState } from 'react';

import type { OnboardingData } from '../../types/onboarding';

import { saveUserData } from '../../services/storage';

import {
  getFaroAISettings,
  saveFaroAISettings,
  type FaroAISettings,
} from '../../services/aiSettings';

import './SectionView.css';
import './SettingsView.css';

interface Props {
  userData: OnboardingData;
  business: any;
  onUserDataChange: (data: OnboardingData) => void;
  onRestartTutorial: () => void;
}

type SettingsCategory =
  | 'business'
  | 'ai'
  | 'notifications'
  | 'inventory'
  | 'finance'
  | 'memory'
  | 'integrations'
  | 'appearance'
  | 'security';

export default function SettingsView({
  userData,
  onUserDataChange,
  onRestartTutorial,
}: Props) {
  const [activeCategory, setActiveCategory] =
    useState<SettingsCategory>('business');

  const [form, setForm] =
    useState<OnboardingData>(userData);

  const [isSaved, setIsSaved] = useState(false);

  const [aiSettings, setAISettings] =
    useState<FaroAISettings>(
      getFaroAISettings()
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    saveUserData(form);
    onUserDataChange(form);

    saveFaroAISettings(aiSettings);

    setIsSaved(true);

    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  const categories: {
    id: SettingsCategory;
    label: string;
    icon: React.ReactNode;
  }[] = [
      {
        id: 'business',
        label: 'Mi Negocio',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
        ),
      },

      {
        id: 'ai',
        label: 'Faro / IA',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        ),
      },

      {
        id: 'notifications',
        label: 'Notificaciones',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          </svg>
        ),
      },

      {
        id: 'inventory',
        label: 'Inventario',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
        ),
      },

      {
        id: 'finance',
        label: 'Ventas y Finanzas',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        ),
      },

      {
        id: 'memory',
        label: 'Memoria de Faro',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        ),
      },

      {
        id: 'integrations',
        label: 'Integraciones',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="2"
            />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        ),
      },

      {
        id: 'appearance',
        label: 'Apariencia',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2" />
            <path d="M12 21v2" />
            <path d="M4.22 4.22l1.42 1.42" />
            <path d="M18.36 18.36l1.42 1.42" />
            <path d="M1 12h2" />
            <path d="M21 12h2" />
            <path d="M4.22 19.78l1.42-1.42" />
            <path d="M18.36 5.64l1.42-1.42" />
          </svg>
        ),
      },

      {
        id: 'security',
        label: 'Seguridad y Priv.',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect
              x="3"
              y="11"
              width="18"
              height="11"
              rx="2"
            />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        ),
      },
    ];

  const renderContent = () => {
    switch (activeCategory) {
      case 'business':
        return (
          <div className="settings-panel">
            <h3>Datos del Negocio</h3>

            <p className="settings-panel-desc">
              Información general sobre tu negocio y responsable.
            </p>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Nombre del negocio
                </label>

                <input
                  className="form-input"
                  value={form.businessName}
                  onChange={e =>
                    setForm(f => ({
                      ...f,
                      businessName: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Responsable
                </label>

                <input
                  className="form-input"
                  value={form.name}
                  onChange={e =>
                    setForm(f => ({
                      ...f,
                      name: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Rubro principal
                </label>

                <select
                  className="form-select"
                  value={form.category}
                  onChange={e =>
                    setForm(f => ({
                      ...f,
                      category: e.target.value as any,
                    }))
                  }
                >
                  <option value="Gastronomy">
                    Gastronomía
                  </option>

                  <option value="Commerce">
                    Comercio / Retail
                  </option>

                  <option value="Services">
                    Servicios Profesionales
                  </option>

                  <option value="Health">
                    Salud y Bienestar
                  </option>

                  <option value="Education">
                    Educación
                  </option>

                  <option value="Technology">
                    Tecnología
                  </option>

                  <option value="Construction">
                    Construcción
                  </option>

                  <option value="Other">
                    Otro
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Zona horaria
                </label>

                <select className="form-select">
                  <option>
                    America/Argentina/Buenos_Aires (UTC-3)
                  </option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'ai':
        return (
          <div className="settings-panel">
            <h3>Faro / IA</h3>

            <p className="settings-panel-desc">
              Configurá cómo responde Faro y qué nivel de autonomía tiene.
            </p>

            <div className="form-group">
              <label className="form-label">
                Nivel de detalle en respuestas
              </label>

              <select
                className="form-select"
                value={aiSettings.responseStyle}
                onChange={e =>
                  setAISettings(prev => ({
                    ...prev,
                    responseStyle:
                      e.target.value as FaroAISettings['responseStyle'],
                  }))
                }
              >
                <option value="brief">
                  Breve (Solo la información necesaria)
                </option>

                <option value="balanced">
                  Equilibrado
                </option>

                <option value="detailed">
                  Detallado (Incluye contexto adicional)
                </option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Nivel de autonomía
              </label>

              <select
                className="form-select"
                value={aiSettings.autonomy}
                onChange={e =>
                  setAISettings(prev => ({
                    ...prev,
                    autonomy:
                      e.target.value as FaroAISettings['autonomy'],
                  }))
                }
              >
                <option value="answer_only">
                  Solo responder
                </option>

                <option value="suggest_actions">
                  Sugerir acciones
                </option>

                <option value="execute_actions">
                  Ejecutar acciones aprobadas
                </option>
              </select>
            </div>

            <div
              style={{
                marginTop: 20,
                padding: 16,
                borderRadius: 12,
                background: 'var(--surface-secondary, #f7f7f8)',
              }}
            >
              <strong>
                {aiSettings.autonomy === 'answer_only'
                  ? 'Faro solo consultará y responderá.'
                  : aiSettings.autonomy === 'suggest_actions'
                    ? 'Faro podrá detectar acciones y proponértelas sin ejecutarlas.'
                    : 'Faro podrá ejecutar las acciones que le solicites directamente.'}
              </strong>

              <p
                style={{
                  marginTop: 8,
                  marginBottom: 0,
                  opacity: 0.75,
                  fontSize: 14,
                }}
              >
                Esta configuración afecta ventas, gastos,
                clientes, productos e inventario.
              </p>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="settings-panel">
            <h3>Notificaciones</h3>

            <p className="settings-panel-desc">
              Elegí qué alertas querés recibir y cuándo.
            </p>

            <div className="form-group">
              <label className="form-label">
                Alertas activas
              </label>

              <div className="checkbox-list">
                <label>
                  <input type="checkbox" defaultChecked />
                  Ventas importantes
                </label>

                <label>
                  <input type="checkbox" defaultChecked />
                  Stock bajo / Sin stock
                </label>

                <label>
                  <input type="checkbox" defaultChecked />
                  Gastos elevados
                </label>

                <label>
                  <input type="checkbox" defaultChecked />
                  Sugerencias de Faro
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Horario de notificaciones
              </label>

              <select className="form-select">
                <option>Siempre</option>
                <option>
                  Solo en horario comercial (09:00 - 18:00)
                </option>
                <option>No molestar</option>
              </select>
            </div>
          </div>
        );

      case 'inventory':
        return (
          <div className="settings-panel">
            <h3>Inventario</h3>

            <p className="settings-panel-desc">
              Configuración global para tus productos y alertas.
            </p>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Activar control de inventario
                </label>

                <select className="form-select">
                  <option>
                    Sí, controlar stock
                  </option>

                  <option>
                    No controlar (Solo servicios)
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Permitir stock negativo
                </label>

                <select className="form-select">
                  <option>
                    No, bloquear ventas sin stock
                  </option>

                  <option>
                    Sí, permitir y alertar
                  </option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'finance':
        return (
          <div className="settings-panel">
            <h3>Ventas y Finanzas</h3>

            <p className="settings-panel-desc">
              Configuración de moneda, impuestos y objetivos.
            </p>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Moneda principal
                </label>

                <select className="form-select">
                  <option>ARS ($)</option>
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Impuestos
                </label>

                <select className="form-select">
                  <option>
                    Precios incluyen impuestos
                  </option>

                  <option>
                    Agregar impuestos al final
                  </option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'memory':
        return (
          <div className="settings-panel">
            <h3>Memoria de Faro</h3>

            <p className="settings-panel-desc">
              Revisá qué sabe Faro de tu negocio.
            </p>

            <div
              className="section-placeholder"
              style={{
                minHeight: '200px',
                padding: 24,
              }}
            >
              <p className="section-placeholder-text">
                Faro utiliza actualmente los datos reales de
                tu negocio para responder y ejecutar acciones.
              </p>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="settings-panel">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h3>Integraciones</h3>

              <span className="section-badge">
                Próximamente
              </span>
            </div>

            <p className="settings-panel-desc">
              Conectá Faro con tus herramientas favoritas.
            </p>

            <div className="integrations-list">
              <div className="integration-item">
                <div className="integration-icon">
                  WhatsApp
                </div>

                <div className="integration-info">
                  Automatizar mensajes y pedidos
                </div>
              </div>

              <div className="integration-item">
                <div className="integration-icon">
                  Google Sheets
                </div>

                <div className="integration-info">
                  Exportar reportes automáticos
                </div>
              </div>

              <div className="integration-item">
                <div className="integration-icon">
                  Mercado Pago
                </div>

                <div className="integration-info">
                  Sincronizar cobros
                </div>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="settings-panel">
            <h3>Apariencia</h3>

            <p className="settings-panel-desc">
              Personalizá cómo se ve y se siente Faro.
            </p>

            <div className="form-group">
              <label className="form-label">
                Tema visual
              </label>

              <select className="form-select">
                <option>Claro</option>
                <option>Oscuro</option>
                <option>Automático (Sistema)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Intensidad de animaciones
              </label>

              <select className="form-select">
                <option>Normal (Recomendado)</option>
                <option>Reducidas</option>
                <option>Sin animaciones</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Densidad de interfaz
              </label>

              <select className="form-select">
                <option>Cómoda</option>
                <option>Compacta</option>
              </select>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="settings-panel">
            <h3>Seguridad y Privacidad</h3>

            <p className="settings-panel-desc">
              Gestioná tus datos y privacidad.
            </p>

            <div className="security-actions">
              <button
                type="button"
                className="btn-secondary"
                style={{
                  width: '100%',
                  marginBottom: 12,
                }}
              >
                Cambiar contraseña
              </button>

              <button
                type="button"
                className="btn-secondary"
                style={{
                  width: '100%',
                  marginBottom: 12,
                }}
              >
                Exportar todos mis datos
              </button>

              <button
                type="button"
                className="btn-secondary"
                style={{
                  width: '100%',
                  color: 'var(--error)',
                  borderColor: 'var(--error)',
                }}
              >
                Eliminar cuenta y datos
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="section-view settings-view">
      <div className="section-header">
        <h2 className="section-title">
          Configuración
        </h2>

        <p className="section-description">
          Administrá los datos de tu cuenta y preferencias de Faro.
        </p>
      </div>

      <div className="settings-layout">
        <aside className="settings-sidebar">
          {categories.map(c => (
            <button
              key={c.id}
              className={`settings-tab ${activeCategory === c.id
                  ? 'settings-tab--active'
                  : ''
                }`}
              onClick={() =>
                setActiveCategory(c.id)
              }
            >
              <span className="settings-tab-icon">
                {c.icon}
              </span>

              {c.label}
            </button>
          ))}

          <div className="settings-sidebar-bottom">
            <button
              type="button"
              className="btn-secondary"
              onClick={onRestartTutorial}
              style={{ width: '100%' }}
            >
              Reiniciar Tutorial
            </button>
          </div>
        </aside>

        <main className="settings-content">
          <form
            onSubmit={handleSubmit}
            className="settings-form"
          >
            {renderContent()}

            <div className="settings-actions">
              {isSaved && (
                <span className="settings-saved-msg">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>

                  Guardado
                </span>
              )}

              <button
                type="submit"
                className="btn-primary"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}