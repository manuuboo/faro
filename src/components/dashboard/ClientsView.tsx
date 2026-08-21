import { useState } from 'react';
import Modal from '../common/Modal';
import { formatDate } from '../../utils/format';
import type { Client } from '../../types/business';
import './SectionView.css';

interface Props {
  business: any;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

const EMPTY: FormState = {
  name: '',
  email: '',
  phone: '',
  notes: '',
};

export default function ClientsView({ business }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const clients: Client[] = business.data.clients;

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  );

  const openAdd = () => {
    setEditingClient(null);
    setForm(EMPTY);
    setShowModal(true);
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);

    setForm({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      notes: client.notes || '',
    });

    setShowModal(true);
    setSelectedClient(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) return;

    try {
      if (editingClient) {
        await business.updateClient(editingClient.id, {
          name: form.name.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          notes: form.notes.trim() || undefined,
        });
      } else {
        await business.addClient(
          form.name.trim(),
          form.email.trim() || undefined,
          form.phone.trim() || undefined,
          form.notes.trim() || undefined
        );
      }

      setShowModal(false);
      setEditingClient(null);
      setForm(EMPTY);
    } catch (error) {
      console.error('Error guardando cliente:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await business.deleteClient(id);

      setDeletingId(null);
      setSelectedClient(null);
    } catch (error) {
      console.error('Error eliminando cliente:', error);
    }
  };

  const getInitials = (name: string) =>
    name
      .trim()
      .split(' ')
      .map((word: string) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="section-view">
      <div className="section-card">

        {/* Header */}
        <div
          className="section-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <h2 className="section-title">Clientes</h2>
            <p className="section-description">
              Gestioná tu cartera de clientes.
            </p>
          </div>

          <button className="btn-primary" onClick={openAdd}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>

            Agregar cliente
          </button>
        </div>

        {/* Search */}
        <div className="search-bar" style={{ marginBottom: 20 }}>
          <span className="search-bar-icon">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>

          <input
            placeholder="Buscar clientes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Empty state / Clients */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>

            <h3 className="empty-state-title">
              {search
                ? 'Sin resultados'
                : 'Todavía no tenés clientes'}
            </h3>

            <p className="empty-state-desc">
              {search
                ? 'Probá con otro nombre.'
                : 'Agregá tu primer cliente para empezar a registrar su historial.'}
            </p>

            {!search && (
              <button className="btn-primary" onClick={openAdd}>
                Agregar cliente
              </button>
            )}
          </div>
        ) : (
          <div className="clients-grid">
            {filtered.map((client) => (
              <div
                key={client.id}
                className="client-card"
                onClick={() => setSelectedClient(client)}
              >
                <div className="client-avatar">
                  {getInitials(client.name)}
                </div>

                <div className="client-info">
                  <p className="client-name">
                    {client.name}
                  </p>

                  {client.email && (
                    <p className="client-sub">
                      {client.email}
                    </p>
                  )}

                  {client.phone && (
                    <p className="client-sub">
                      {client.phone}
                    </p>
                  )}

                  {!client.email && !client.phone && (
                    <p
                      className="client-sub"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      Sin datos de contacto
                    </p>
                  )}
                </div>

                <div
                  className="client-date"
                  style={{
                    fontSize: 11,
                    color: 'var(--text-tertiary)',
                    marginLeft: 'auto',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatDate(client.date)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          editingClient
            ? 'Editar Cliente'
            : 'Agregar Cliente'
        }
      >
        <form
          className="modal-form"
          onSubmit={handleSubmit}
        >
          <div className="modal-form-group">
            <label>Nombre *</label>

            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  name: e.target.value,
                }))
              }
              placeholder="Ej. Carlos Martínez"
              required
            />
          </div>

          <div className="modal-form-group">
            <label>Email</label>

            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  email: e.target.value,
                }))
              }
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="modal-form-group">
            <label>Teléfono</label>

            <input
              type="tel"
              value={form.phone}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  phone: e.target.value,
                }))
              }
              placeholder="+54 11 1234-5678"
            />
          </div>

          <div className="modal-form-group">
            <label>Notas</label>

            <textarea
              value={form.notes}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  notes: e.target.value,
                }))
              }
              placeholder="Información adicional..."
              style={{
                padding: '10px 14px',
                border: '1.5px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-ui)',
                fontSize: 14,
                resize: 'vertical',
                outline: 'none',
                minHeight: 72,
              }}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn-primary"
            >
              {editingClient
                ? 'Guardar cambios'
                : 'Agregar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedClient}
        onClose={() => setSelectedClient(null)}
        title="Detalle del cliente"
      >
        {selectedClient && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginBottom: 20,
                padding: '16px',
                background: 'var(--surface-1)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div
                className="client-avatar"
                style={{
                  width: 52,
                  height: 52,
                  fontSize: 18,
                }}
              >
                {getInitials(selectedClient.name)}
              </div>

              <div>
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: 18,
                    margin: 0,
                  }}
                >
                  {selectedClient.name}
                </p>

                <p
                  style={{
                    fontSize: 12,
                    color: 'var(--text-tertiary)',
                    margin: '3px 0 0',
                  }}
                >
                  Cliente desde{' '}
                  {formatDate(selectedClient.date)}
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                marginBottom: 24,
              }}
            >
              {selectedClient.email && (
                <div>
                  <p
                    style={{
                      fontSize: 12,
                      color: 'var(--text-secondary)',
                      marginBottom: 2,
                    }}
                  >
                    Email
                  </p>

                  <p style={{ fontWeight: 500 }}>
                    {selectedClient.email}
                  </p>
                </div>
              )}

              {selectedClient.phone && (
                <div>
                  <p
                    style={{
                      fontSize: 12,
                      color: 'var(--text-secondary)',
                      marginBottom: 2,
                    }}
                  >
                    Teléfono
                  </p>

                  <p style={{ fontWeight: 500 }}>
                    {selectedClient.phone}
                  </p>
                </div>
              )}

              {selectedClient.notes && (
                <div>
                  <p
                    style={{
                      fontSize: 12,
                      color: 'var(--text-secondary)',
                      marginBottom: 2,
                    }}
                  >
                    Notas
                  </p>

                  <p style={{ color: 'var(--text-primary)' }}>
                    {selectedClient.notes}
                  </p>
                </div>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                gap: 10,
              }}
            >
              <button
                className="btn-secondary"
                style={{ flex: 1 }}
                onClick={() =>
                  openEdit(selectedClient)
                }
              >
                Editar
              </button>

              <button
                className="btn-danger"
                style={{ flex: 1 }}
                onClick={() => {
                  setSelectedClient(null);
                  setDeletingId(selectedClient.id);
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Eliminar cliente"
      >
        <p
          style={{
            marginBottom: 20,
            color: 'var(--text-secondary)',
          }}
        >
          ¿Querés eliminar este cliente? Esta acción no se
          puede deshacer.
        </p>

        <div className="modal-actions">
          <button
            className="btn-secondary"
            onClick={() => setDeletingId(null)}
          >
            Cancelar
          </button>

          <button
            className="btn-danger"
            onClick={() => handleDelete(deletingId!)}
          >
            Eliminar
          </button>
        </div>
      </Modal>
    </div>
  );
}