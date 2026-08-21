import { useState } from 'react';
import Modal from '../common/Modal';
import { formatCurrency, formatDate } from '../../utils/format';
import './SectionView.css';

interface Props {
  business: any;
}

interface FormState {
  productId: string;
  quantity: string;
  supplierName: string;
  date: string;
}

const EMPTY_FORM: FormState = {
  productId: '',
  quantity: '1',
  supplierName: '',
  date: new Date().toISOString().slice(0, 10),
};

export default function PurchasesView({ business }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const purchases = business.data.purchases || [];
  const inventory = business.data.inventory || [];

  const selectedProduct = inventory.find(
    (product: any) => product.id === form.productId
  );

  const quantity = Number(form.quantity) || 0;

  const unitCost = selectedProduct
    ? Number(selectedProduct.costPrice) || 0
    : 0;

  const totalAmount = quantity * unitCost;

  const filtered = purchases.filter((purchase: any) =>
    (purchase.description || '')
      .toLowerCase()
      .includes(search.toLowerCase()) ||
    (purchase.supplierName || '')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.productId || quantity <= 0 || !selectedProduct) {
      return;
    }

    if (unitCost <= 0) {
      return;
    }

    await business.addPurchase(
      totalAmount,
      `${quantity}x ${selectedProduct.name}`,
      undefined,
      form.supplierName || undefined,
      selectedProduct.id,
      quantity,
      unitCost,
      form.date
    );

    setForm(EMPTY_FORM);
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    await business.deletePurchase(id);
    setDeletingId(null);
  };

  const total = purchases.reduce(
    (sum: number, purchase: any) =>
      sum + Number(purchase.amount || 0),
    0
  );

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
            <h2 className="section-title">Compras</h2>

            <p className="section-description">
              Registrá compras y actualizá automáticamente tu inventario.
            </p>
          </div>

          <button
            className="btn-primary"
            onClick={() => setShowModal(true)}
          >
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

            Nueva Compra
          </button>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginBottom: 24,
          }}
        >
          {[
            {
              label: 'Total compras',
              value: formatCurrency(total),
            },
            {
              label: 'Cantidad',
              value: String(purchases.length),
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="mini-stat"
              style={{
                background: 'var(--surface-1)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 20px',
                flex: 1,
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  marginBottom: 4,
                }}
              >
                {stat.label}
              </p>

              <p
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div
          className="search-bar"
          style={{ marginBottom: 20 }}
        >
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
              <line
                x1="21"
                y1="21"
                x2="16.65"
                y2="16.65"
              />
            </svg>
          </span>

          <input
            placeholder="Buscar compras..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Empty state / table */}
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
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />

                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>

            <h3 className="empty-state-title">
              {search
                ? 'Sin resultados'
                : 'No hay compras registradas'}
            </h3>

            <p className="empty-state-desc">
              {search
                ? 'Probá con otro término.'
                : 'Registrá tu primera compra para empezar.'}
            </p>

            {!search && (
              <button
                className="btn-primary"
                onClick={() => setShowModal(true)}
              >
                Registrar compra
              </button>
            )}
          </div>
        ) : (
          <table className="faro-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Proveedor</th>
                <th>Cantidad</th>
                <th style={{ textAlign: 'right' }}>
                  Monto
                </th>
                <th style={{ textAlign: 'right' }}>
                  Acción
                </th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((purchase: any) => (
                <tr key={purchase.id}>
                  <td
                    data-label="Fecha"
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: 13,
                    }}
                  >
                    {formatDate(purchase.date)}
                  </td>

                  <td
                    data-label="Producto"
                    style={{ fontWeight: 600 }}
                  >
                    {purchase.description}
                  </td>

                  <td
                    data-label="Proveedor"
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: 13,
                    }}
                  >
                    {purchase.supplierName || '—'}
                  </td>

                  <td data-label="Cantidad">
                    {purchase.quantity || '—'}
                  </td>

                  <td
                    data-label="Monto"
                    style={{
                      textAlign: 'right',
                      color: 'var(--blue)',
                      fontWeight: 700,
                    }}
                  >
                    -{formatCurrency(
                      Number(purchase.amount || 0)
                    )}
                  </td>

                  <td
                    data-label="Acción"
                    style={{ textAlign: 'right' }}
                  >
                    <button
                      className="icon-btn danger"
                      onClick={() =>
                        setDeletingId(purchase.id)
                      }
                      title="Eliminar"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="3 6 5 6 21 6" />

                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />

                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* New purchase modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Registrar Compra"
      >
        <form
          className="modal-form"
          onSubmit={handleSubmit}
        >
          {/* Product */}
          <div className="modal-form-group">
            <label>Producto</label>

            <select
              value={form.productId}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  productId: e.target.value,
                }))
              }
              required
            >
              <option value="">
                Seleccioná un producto
              </option>

              {inventory.map((product: any) => (
                <option
                  key={product.id}
                  value={product.id}
                >
                  {product.name} — Stock: {product.stock}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div className="modal-form-group">
            <label>Cantidad</label>

            <input
              type="number"
              value={form.quantity}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  quantity: e.target.value,
                }))
              }
              min="1"
              step="1"
              required
            />
          </div>

          {/* Unit cost */}
          {selectedProduct && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface-1)',
                border: '1px solid var(--border-light)',
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: 13,
                  }}
                >
                  Costo unitario
                </span>

                <strong>
                  {formatCurrency(unitCost)}
                </strong>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: 13,
                  }}
                >
                  Total
                </span>

                <strong
                  style={{
                    color: 'var(--blue)',
                    fontSize: 18,
                  }}
                >
                  {formatCurrency(totalAmount)}
                </strong>
              </div>
            </div>
          )}

          {/* Supplier */}
          <div className="modal-form-group">
            <label>Proveedor (Opcional)</label>

            <input
              type="text"
              value={form.supplierName}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  supplierName: e.target.value,
                }))
              }
              placeholder="Nombre del proveedor"
            />
          </div>

          {/* Date */}
          <div className="modal-form-group">
            <label>Fecha</label>

            <input
              type="date"
              value={form.date}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  date: e.target.value,
                }))
              }
            />
          </div>

          {/* Actions */}
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
              disabled={
                !form.productId ||
                quantity <= 0 ||
                !selectedProduct ||
                unitCost <= 0
              }
            >
              Guardar compra
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Eliminar compra"
      >
        <p
          style={{
            marginBottom: 20,
            color: 'var(--text-secondary)',
          }}
        >
          ¿Estás seguro de que querés eliminar esta
          compra? Esta acción no se puede deshacer.
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
            onClick={() =>
              handleDelete(deletingId!)
            }
          >
            Eliminar
          </button>
        </div>
      </Modal>
    </div>
  );
}