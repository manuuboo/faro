import { useState } from 'react';
import Modal from '../common/Modal';
import { formatDate } from '../../utils/format';
import type { Supplier } from '../../types/business';
import './SectionView.css';

interface Props { business: any; }

interface FormState { name: string; email: string; phone: string; contactPerson: string; notes: string; }
const EMPTY: FormState = { name:'', email:'', phone:'', contactPerson:'', notes:'' };

export default function SuppliersView({ business }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const suppliers: Supplier[] = business.data.suppliers;
  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.contactPerson || '').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingSupplier(null);
    setForm(EMPTY);
    setShowModal(true);
  };

  const openEdit = (s: Supplier) => {
    setEditingSupplier(s);
    setForm({ name: s.name, email: s.email||'', phone: s.phone||'', contactPerson: s.contactPerson||'', notes: s.notes||'' });
    setShowModal(true);
    setSelectedSupplier(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    if (editingSupplier) {
      business.updateSupplier(editingSupplier.id, {
        name:form.name, email:form.email||undefined, phone:form.phone||undefined,
        contactPerson:form.contactPerson||undefined, notes:form.notes||undefined
      });
    } else {
      business.addSupplier(form.name, form.contactPerson||undefined, form.email||undefined, form.phone||undefined, form.notes||undefined);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    business.deleteSupplier(id);
    setDeletingId(null);
    setSelectedSupplier(null);
  };

  const getInitials = (name: string) => name.trim().split(' ').map((w:string) => w[0]).join('').toUpperCase().slice(0,2);

  return (
    <div className="section-view">
      <div className="section-card">
        <div className="section-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <h2 className="section-title">Proveedores</h2>
            <p className="section-description">Administrá los contactos de tus proveedores.</p>
          </div>
          <button className="btn-primary" onClick={openAdd}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Agregar proveedor
          </button>
        </div>

        <div className="search-bar" style={{ marginBottom:20 }}>
          <span className="search-bar-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
          <input placeholder="Buscar proveedores..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </div>
            <h3 className="empty-state-title">{search ? 'Sin resultados' : 'Aún no hay proveedores'}</h3>
            <p className="empty-state-desc">{search ? 'Probá con otro término.' : 'Agregá tu primer proveedor para tener a mano tus contactos.'}</p>
            {!search && <button className="btn-primary" onClick={openAdd}>Agregar proveedor</button>}
          </div>
        ) : (
          <div className="clients-grid">
            {filtered.map(s => (
              <div key={s.id} className="client-card" onClick={() => setSelectedSupplier(s)}>
                <div className="client-avatar" style={{background:'var(--blue-bg)', color:'var(--blue)'}}>{getInitials(s.name)}</div>
                <div className="client-info">
                  <p className="client-name">{s.name}</p>
                  {s.contactPerson && <p className="client-sub">Contacto: {s.contactPerson}</p>}
                  {s.email && !s.contactPerson && <p className="client-sub">{s.email}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingSupplier ? 'Editar Proveedor' : 'Agregar Proveedor'}>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-form-group">
            <label>Empresa / Nombre *</label>
            <input type="text" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="Ej. Distribuidora Sur" required />
          </div>
          <div className="modal-form-group">
            <label>Persona de contacto</label>
            <input type="text" value={form.contactPerson} onChange={e => setForm(f=>({...f,contactPerson:e.target.value}))} placeholder="Ej. Juan Pérez" />
          </div>
          <div className="modal-form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} placeholder="correo@ejemplo.com" />
          </div>
          <div className="modal-form-group">
            <label>Teléfono</label>
            <input type="tel" value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} placeholder="+54 11 1234-5678" />
          </div>
          <div className="modal-form-group">
            <label>Notas</label>
            <textarea value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} placeholder="Condiciones de pago, días de entrega..." style={{padding:'10px 14px',border:'1.5px solid var(--border-light)',borderRadius:'var(--radius-md)',fontFamily:'var(--font-ui)',fontSize:14,resize:'vertical',outline:'none',minHeight:72}} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">{editingSupplier ? 'Guardar cambios' : 'Agregar'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!selectedSupplier} onClose={() => setSelectedSupplier(null)} title="Detalle del proveedor">
        {selectedSupplier && (
          <div>
            <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:20,padding:'16px',background:'var(--surface-1)',borderRadius:'var(--radius-lg)'}}>
              <div className="client-avatar" style={{width:52,height:52,fontSize:18,background:'var(--blue-bg)',color:'var(--blue)'}}>{getInitials(selectedSupplier.name)}</div>
              <div>
                <p style={{fontWeight:700,fontSize:18,margin:0}}>{selectedSupplier.name}</p>
                <p style={{fontSize:12,color:'var(--text-tertiary)',margin:'3px 0 0'}}>Agregado el {formatDate(selectedSupplier.date)}</p>
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:24}}>
              {selectedSupplier.contactPerson && <div><p style={{fontSize:12,color:'var(--text-secondary)',marginBottom:2}}>Persona de contacto</p><p style={{fontWeight:500}}>{selectedSupplier.contactPerson}</p></div>}
              {selectedSupplier.email && <div><p style={{fontSize:12,color:'var(--text-secondary)',marginBottom:2}}>Email</p><p style={{fontWeight:500}}>{selectedSupplier.email}</p></div>}
              {selectedSupplier.phone && <div><p style={{fontSize:12,color:'var(--text-secondary)',marginBottom:2}}>Teléfono</p><p style={{fontWeight:500}}>{selectedSupplier.phone}</p></div>}
              {selectedSupplier.notes && <div><p style={{fontSize:12,color:'var(--text-secondary)',marginBottom:2}}>Notas</p><p style={{color:'var(--text-primary)'}}>{selectedSupplier.notes}</p></div>}
            </div>
            <div style={{display:'flex',gap:10}}>
              <button className="btn-secondary" style={{flex:1}} onClick={() => openEdit(selectedSupplier)}>Editar</button>
              <button className="btn-danger" style={{flex:1}} onClick={() => { setSelectedSupplier(null); setDeletingId(selectedSupplier.id); }}>Eliminar</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!deletingId} onClose={() => setDeletingId(null)} title="Eliminar proveedor">
        <p style={{marginBottom:20,color:'var(--text-secondary)'}}>¿Querés eliminar este proveedor? Esta acción no se puede deshacer.</p>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={() => setDeletingId(null)}>Cancelar</button>
          <button className="btn-danger" onClick={() => handleDelete(deletingId!)}>Eliminar</button>
        </div>
      </Modal>
    </div>
  );
}
