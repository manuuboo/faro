import { useState } from 'react';
import Modal from '../common/Modal';
import { formatCurrency } from '../../utils/format';
import type { InventoryProduct } from '../../types/business';
import './SectionView.css';

interface Props { business: any; }

interface FormState { name: string; category: string; stock: string; minStock: string; unitPrice: string; costPrice: string; unit: string; }
const EMPTY: FormState = { name:'', category:'', stock:'0', minStock:'5', unitPrice:'0', costPrice:'0', unit:'unidad' };

export default function InventoryView({ business }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryProduct | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [adjustingStock, setAdjustingStock] = useState<{id:string, val:number} | null>(null);

  const inventory: InventoryProduct[] = business.data.inventory;
  const filtered = inventory.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = inventory.reduce((s, p) => s + (p.stock * p.costPrice), 0);
  const lowStockCount = inventory.filter(p => p.stock <= p.minStock).length;

  const openAdd = () => {
    setEditingItem(null);
    setForm(EMPTY);
    setShowModal(true);
  };

  const openEdit = (p: InventoryProduct) => {
    setEditingItem(p);
    setForm({
      name: p.name, category: p.category, stock: String(p.stock),
      minStock: String(p.minStock), unitPrice: String(p.unitPrice),
      costPrice: String(p.costPrice), unit: p.unit
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    
    const payload = {
      name: form.name, category: form.category || 'General',
      stock: Number(form.stock), minStock: Number(form.minStock),
      unitPrice: Number(form.unitPrice), costPrice: Number(form.costPrice),
      unit: form.unit
    };

    if (editingItem) {
      business.updateInventoryProduct(editingItem.id, payload);
    } else {
      business.addInventoryProduct(payload);
    }
    setShowModal(false);
  };

  const handleAdjustStock = () => {
    if (!adjustingStock) return;
    business.adjustStock(adjustingStock.id, adjustingStock.val);
    setAdjustingStock(null);
  };

  const handleDelete = (id: string) => {
    business.deleteInventoryProduct(id);
    setDeletingId(null);
  };

  return (
    <div className="section-view">
      <div className="section-card">
        <div className="section-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <h2 className="section-title">Inventario</h2>
            <p className="section-description">Controlá tus productos, stock y valor de mercadería.</p>
          </div>
          <button className="btn-primary" onClick={openAdd}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Agregar producto
          </button>
        </div>

        {/* Stats */}
        <div style={{ display:'flex', gap:16, marginBottom:24 }}>
          {[
            { label:'Total productos', value: String(inventory.length), color:'--blue' },
            { label:'Stock bajo', value: String(lowStockCount), color:'--orange' },
            { label:'Valor del inventario', value: formatCurrency(totalValue), color:'--green' },
          ].map(s => (
            <div key={s.label} className="mini-stat" style={{ background:'var(--surface-1)', border:'1px solid var(--border-light)', borderRadius:'var(--radius-lg)', padding:'16px 20px', flex:1 }}>
              <p style={{ fontSize:12, color:'var(--text-secondary)', marginBottom:4 }}>{s.label}</p>
              <p style={{ fontSize:22, fontWeight:700, color:'var(--text-primary)', fontFamily:'var(--font-display)' }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="search-bar" style={{ marginBottom:20 }}>
          <span className="search-bar-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
          <input placeholder="Buscar por nombre o categoría..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            </div>
            <h3 className="empty-state-title">{search ? 'Sin resultados' : 'Tu inventario está vacío'}</h3>
            <p className="empty-state-desc">{search ? 'Probá con otro término.' : 'Comenzá agregando los productos que vendés o los insumos que usás.'}</p>
            {!search && <button className="btn-primary" onClick={openAdd}>Agregar producto</button>}
          </div>
        ) : (
          <table className="faro-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Stock</th>
                <th>Precio Venta</th>
                <th>Costo</th>
                <th style={{textAlign:'right'}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td data-label="Producto">
                    <p style={{fontWeight:600,margin:0}}>{p.name}</p>
                    <p style={{fontSize:12,color:'var(--text-tertiary)',margin:0}}>{p.category}</p>
                  </td>
                  <td data-label="Stock">
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <button className="icon-btn" onClick={() => setAdjustingStock({id:p.id, val:-1})} style={{padding:2,background:'var(--surface-2)'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
                      <span className={`badge ${p.stock <= p.minStock ? 'badge-orange' : 'badge-green'}`} style={{minWidth:60,justifyContent:'center'}}>
                        {p.stock} {p.unit}
                      </span>
                      <button className="icon-btn" onClick={() => setAdjustingStock({id:p.id, val:1})} style={{padding:2,background:'var(--surface-2)'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
                    </div>
                  </td>
                  <td data-label="Precio Venta" style={{fontWeight:500}}>{formatCurrency(p.unitPrice)}</td>
                  <td data-label="Costo" style={{color:'var(--text-secondary)'}}>{formatCurrency(p.costPrice)}</td>
                  <td data-label="Acciones" style={{textAlign:'right'}}>
                    <button className="icon-btn" onClick={() => openEdit(p)} title="Editar" style={{display:'inline-flex',marginRight:4}}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button className="icon-btn danger" onClick={() => setDeletingId(p.id)} title="Eliminar" style={{display:'inline-flex'}}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Editar Producto' : 'Agregar Producto'}>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-form-group">
            <label>Nombre del producto *</label>
            <input type="text" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="Ej. Filtro de aceite" required />
          </div>
          <div className="modal-form-group">
            <label>Categoría</label>
            <input type="text" value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))} placeholder="Ej. Repuestos" />
          </div>
          <div className="form-row">
            <div className="modal-form-group">
              <label>Stock actual</label>
              <input type="number" value={form.stock} onChange={e => setForm(f=>({...f,stock:e.target.value}))} required min="0" />
            </div>
            <div className="modal-form-group">
              <label>Stock mínimo (Alerta)</label>
              <input type="number" value={form.minStock} onChange={e => setForm(f=>({...f,minStock:e.target.value}))} required min="0" />
            </div>
          </div>
          <div className="modal-form-group">
            <label>Unidad de medida</label>
            <select value={form.unit} onChange={e => setForm(f=>({...f,unit:e.target.value}))} style={{padding:'10px 14px',border:'1.5px solid var(--border-light)',borderRadius:'var(--radius-md)',fontSize:14,fontFamily:'var(--font-ui)',outline:'none'}}>
              <option value="unidad">Unidad</option>
              <option value="kg">Kilogramo (kg)</option>
              <option value="litro">Litro (l)</option>
              <option value="metro">Metro (m)</option>
              <option value="caja">Caja</option>
            </select>
          </div>
          <div className="form-row">
            <div className="modal-form-group">
              <label>Costo de compra</label>
              <input type="number" value={form.costPrice} onChange={e => setForm(f=>({...f,costPrice:e.target.value}))} required min="0" step="0.01" />
            </div>
            <div className="modal-form-group">
              <label>Precio de venta</label>
              <input type="number" value={form.unitPrice} onChange={e => setForm(f=>({...f,unitPrice:e.target.value}))} required min="0" step="0.01" />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">{editingItem ? 'Guardar cambios' : 'Agregar producto'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!adjustingStock} onClose={() => setAdjustingStock(null)} title="Confirmar ajuste">
        {adjustingStock && (
          <>
            <p style={{marginBottom:20,color:'var(--text-secondary)'}}>
              ¿Estás seguro de que querés {adjustingStock.val > 0 ? 'sumar 1' : 'restar 1'} al stock de este producto?
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setAdjustingStock(null)}>Cancelar</button>
              <button className="btn-primary" onClick={handleAdjustStock}>Confirmar</button>
            </div>
          </>
        )}
      </Modal>

      <Modal isOpen={!!deletingId} onClose={() => setDeletingId(null)} title="Eliminar producto">
        <p style={{marginBottom:20,color:'var(--text-secondary)'}}>¿Querés eliminar este producto de tu inventario? Esta acción no se puede deshacer.</p>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={() => setDeletingId(null)}>Cancelar</button>
          <button className="btn-danger" onClick={() => handleDelete(deletingId!)}>Eliminar</button>
        </div>
      </Modal>
    </div>
  );
}
