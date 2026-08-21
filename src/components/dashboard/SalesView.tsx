import { useState } from 'react';
import './SectionView.css';
import { formatCurrency, formatDate } from '../../utils/format';

interface Props {
  business: any;
}

export default function SalesView({ business }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [isSaving, setIsSaving] = useState(false);

  const inventory = business.data.inventory || [];

  const selectedProduct = inventory.find(
    (product: any) => product.id === productId
  );

  const quantityNumber = Number(quantity);

  const total = selectedProduct
    ? selectedProduct.unitPrice * quantityNumber
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productId || !selectedProduct) return;

    if (
      !Number.isInteger(quantityNumber) ||
      quantityNumber <= 0
    ) {
      return;
    }

    if (quantityNumber > selectedProduct.stock) {
      return;
    }

    setIsSaving(true);

    try {
      await business.addSale(
        productId,
        quantityNumber
      );

      setProductId('');
      setQuantity('1');
      setIsAdding(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setProductId('');
    setQuantity('1');
    setIsAdding(false);
  };

  return (
    <div className="section-view">
      <div className="section-card">

        {/* HEADER */}
        <div
          className="section-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h2 className="section-title">Ventas</h2>

            <p className="section-description">
              Registra y haz seguimiento de tus ventas diarias.
            </p>
          </div>

          <button
            className="btn-primary"
            onClick={() => {
              if (isAdding) {
                handleCancel();
              } else {
                setIsAdding(true);
              }
            }}
          >
            {isAdding ? 'Cancelar' : '+ Nueva Venta'}
          </button>
        </div>

        {/* NUEVA VENTA */}
        {isAdding && (
          <div
            style={{
              marginBottom: '2rem',
              padding: '1.5rem',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <h3 style={{ margin: '0 0 16px' }}>
              Registrar nueva venta
            </h3>

            {inventory.length === 0 ? (
              <div className="section-placeholder">
                <span
                  className="section-placeholder-icon"
                  aria-hidden="true"
                >
                  📦
                </span>

                <h3 className="section-placeholder-title">
                  No hay productos disponibles
                </h3>

                <p className="section-placeholder-text">
                  Primero agrega productos desde Inventario.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="modal-form"
              >
                <div className="form-row">

                  {/* PRODUCTO */}
                  <div className="form-group">
                    <label className="form-label">
                      Producto
                    </label>

                    <select
                      className="form-input"
                      value={productId}
                      onChange={(e) =>
                        setProductId(e.target.value)
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
                          disabled={product.stock <= 0}
                        >
                          {product.name} — Stock: {product.stock}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* CANTIDAD */}
                  <div className="form-group">
                    <label className="form-label">
                      Cantidad
                    </label>

                    <input
                      type="number"
                      className="form-input"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(e.target.value)
                      }
                      required
                      min="1"
                      max={selectedProduct?.stock || 1}
                      step="1"
                    />
                  </div>

                </div>

                {/* INFO DEL PRODUCTO */}
                {selectedProduct && (
                  <div
                    style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--background-secondary)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            opacity: 0.7,
                          }}
                        >
                          Precio unitario
                        </span>

                        <div
                          style={{
                            fontWeight: 600,
                            marginTop: '4px',
                          }}
                        >
                          {formatCurrency(
                            selectedProduct.unitPrice
                          )}
                        </div>
                      </div>

                      <div>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            opacity: 0.7,
                          }}
                        >
                          Stock disponible
                        </span>

                        <div
                          style={{
                            fontWeight: 600,
                            marginTop: '4px',
                          }}
                        >
                          {selectedProduct.stock}
                        </div>
                      </div>

                      <div>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            opacity: 0.7,
                          }}
                        >
                          Total
                        </span>

                        <div
                          style={{
                            fontWeight: 700,
                            marginTop: '4px',
                            color: 'var(--green)',
                            fontSize: '1.1rem',
                          }}
                        >
                          {formatCurrency(total)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ERROR STOCK */}
                {selectedProduct &&
                  quantityNumber > selectedProduct.stock && (
                    <p
                      style={{
                        marginTop: '12px',
                        color: 'var(--red)',
                      }}
                    >
                      No hay suficiente stock disponible.
                    </p>
                  )}

                {/* ACTIONS */}
                <div
                  className="modal-actions"
                  style={{ marginTop: '1.5rem' }}
                >
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={
                      isSaving ||
                      !selectedProduct ||
                      quantityNumber <= 0 ||
                      quantityNumber > selectedProduct.stock
                    }
                  >
                    {isSaving
                      ? 'Guardando...'
                      : 'Registrar venta'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* LISTA DE VENTAS */}
        <div className="sales-list">
          {business.data.sales.length === 0 ? (
            <div
              className="section-placeholder"
              id="sales-placeholder"
            >
              <span
                className="section-placeholder-icon"
                aria-hidden="true"
              >
                📈
              </span>

              <h3 className="section-placeholder-title">
                No hay ventas registradas
              </h3>

              <p className="section-placeholder-text">
                Comienza registrando tu primera venta.
              </p>
            </div>
          ) : (
            <table className="faro-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th style={{ textAlign: 'right' }}>
                    Monto
                  </th>
                </tr>
              </thead>

              <tbody>
                {business.data.sales.map(
                  (sale: any) => (
                    <tr key={sale.id}>
                      <td data-label="Fecha">
                        {formatDate(sale.date)}
                      </td>

                      <td
                        data-label="Descripción"
                        style={{ fontWeight: 500 }}
                      >
                        {sale.description}
                      </td>

                      <td
                        data-label="Monto"
                        style={{
                          color: 'var(--green)',
                          textAlign: 'right',
                        }}
                      >
                        +{formatCurrency(sale.amount)}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}