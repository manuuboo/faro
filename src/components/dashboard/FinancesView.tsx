import { useState } from 'react';
import './SectionView.css';
import { formatCurrency, formatDate } from '../../utils/format';

interface Props {
  business: any; // ReturnType of useBusinessData
}

export default function FinancesView({ business }: Props) {
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;
    business.addExpense(Number(amount), description);
    setDescription('');
    setAmount('');
    setIsAddingExpense(false);
  };

  return (
    <div className="section-view">
      <div className="section-card">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="section-title">Finanzas</h2>
            <p className="section-description">
              Registra gastos. Faro calcula tu balance automáticamente.
            </p>
          </div>
          <button className="btn-primary" onClick={() => setIsAddingExpense(!isAddingExpense)}>
            {isAddingExpense ? 'Cancelar' : '+ Nuevo Gasto'}
          </button>
        </div>

        {isAddingExpense && (
          <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)' }}>
            <h3>Registrar nuevo gasto</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 2 }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Descripción del gasto</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} required style={{ padding: '0.75rem', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-sm)' }} placeholder="Ej. Alquiler o Insumos" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Monto</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required min="0" step="0.01" style={{ padding: '0.75rem', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-sm)' }} placeholder="0.00" />
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem', height: 'fit-content' }}>Guardar</button>
            </form>
          </div>
        )}

        <div className="finances-list">
          {business.data.expenses.length === 0 ? (
            <div className="section-placeholder" id="finances-placeholder">
              <span className="section-placeholder-icon" aria-hidden="true">💰</span>
              <h3 className="section-placeholder-title">No hay gastos registrados</h3>
              <p className="section-placeholder-text">
                Comienza registrando tu primer gasto.
              </p>
            </div>
          ) : (
            <table className="faro-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th style={{ textAlign: 'right' }}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {business.data.expenses.map((expense: any) => (
                  <tr key={expense.id}>
                    <td data-label="Fecha">{formatDate(expense.date)}</td>
                    <td data-label="Descripción" style={{ fontWeight: 500 }}>{expense.description}</td>
                    <td data-label="Monto" style={{ textAlign: 'right', color: 'var(--orange)' }}>
                      -{formatCurrency(expense.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
