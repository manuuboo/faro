import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { formatCurrency, formatDate } from '../../utils/format';
import type { Invoice, Client } from '../../types/business';
import { generateInvoicePDF, type IssuerInfo } from '../../utils/pdf';
import './SectionView.css';
import { FileText, Download, MessageCircle, Mail, Plus, Trash2, Search } from 'lucide-react';

interface Props { business: any; }

type FlowMode = 'select' | 'existing' | 'independent' | null;

interface FormState {
  type: string;
  clientId: string; 
  clientName: string; 
  clientCuit: string;
  clientEmail: string;
  clientPhone: string;
  itemDesc: string; 
  itemQty: string; 
  itemPrice: string; 
  notes: string; 
}
const EMPTY: FormState = { type: 'C', clientId:'', clientName:'', clientCuit:'', clientEmail:'', clientPhone:'', itemDesc:'', itemQty:'1', itemPrice:'', notes:'' };

export default function InvoicesView({ business }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [flowMode, setFlowMode] = useState<FlowMode>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<any[]>([]);

  const [issuer, setIssuer] = useState<IssuerInfo>({ name: '', cuit: '', logo: '' });

  useEffect(() => {
    const saved = localStorage.getItem('faro_issuer');
    if (saved) {
      try {
        setIssuer(JSON.parse(saved));
      } catch(e) {}
    }
  }, []);

  const handleSaveIssuer = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const newIssuer = { ...issuer, logo: ev.target?.result as string };
        setIssuer(newIssuer);
        localStorage.setItem('faro_issuer', JSON.stringify(newIssuer));
      };
      reader.readAsDataURL(file);
    }
  };

  const invoices: Invoice[] = business.data.invoices || [];
  const clients: Client[] = business.data.clients || [];

  const filtered = invoices.filter(i =>
    (i.number || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.clientName || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleAddItem = () => {
    if (!form.itemDesc || !form.itemPrice) return;
    setItems([...items, { description:form.itemDesc, quantity:Number(form.itemQty), unitPrice:Number(form.itemPrice) }]);
    setForm(f => ({...f, itemDesc:'', itemQty:'1', itemPrice:''}));
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSelectClient = (id: string) => {
    const client = clients.find(c => c.id === id);
    if (client) {
      setForm(f => ({
        ...f, 
        clientId: client.id, 
        clientName: client.name,
        clientEmail: client.email || '',
        clientPhone: client.phone || '',
        // If client had cuit in future, map it here
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || (!form.clientId && !form.clientName)) return;

    const subtotal = items.reduce((s, item) => s + (item.quantity * item.unitPrice), 0);
    const tax = form.type === 'A' ? subtotal * 0.21 : 0; // simplistic tax logic
    const total = subtotal + tax;

    business.addInvoice({
      type: form.type,
      clientId: form.clientId || undefined,
      clientName: form.clientName,
      clientCuit: form.clientCuit,
      clientEmail: form.clientEmail,
      clientPhone: form.clientPhone,
      items, subtotal, tax, total,
      status: 'draft',
      notes: form.notes
    });

    setForm(EMPTY);
    setItems([]);
    setShowModal(false);
    setFlowMode(null);
  };

  const statusMap: Record<string, {label:string, color:string}> = {
    draft: { label:'Borrador', color:'gray' },
    sent: { label:'Enviada', color:'blue' },
    paid: { label:'Cobrada', color:'green' },
    overdue: { label:'Vencida', color:'red' }
  };

  const openNewInvoice = () => {
    setForm(EMPTY);
    setItems([]);
    setFlowMode('select');
    setShowModal(true);
  };

  return (
    <div className="section-view">
      <div className="section-card">
        <div className="section-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <h2 className="section-title">Facturación</h2>
            <p className="section-description">Generá facturas profesionales y envialas a tus clientes.</p>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            {/* Hidden file input for logo */}
            <label className="btn-secondary" style={{ cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8 }}>
              <input type="file" accept="image/*" style={{ display:'none' }} onChange={handleSaveIssuer} />
              <FileText size={16}/>
              {issuer.logo ? 'Cambiar Logo' : 'Subir Logo'}
            </label>
            <button className="btn-primary" onClick={openNewInvoice}>
              <Plus size={16}/>
              Nueva Factura
            </button>
          </div>
        </div>

        <div className="search-bar" style={{ marginBottom:20 }}>
          <span className="search-bar-icon"><Search size={16}/></span>
          <input placeholder="Buscar por número o cliente..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FileText size={28}/>
            </div>
            <h3 className="empty-state-title">{search ? 'Sin resultados' : 'No tenés facturas'}</h3>
            <p className="empty-state-desc">{search ? 'Probá con otro término.' : 'Empezá generando tu primera factura para enviarla a tus clientes.'}</p>
            {!search && <button className="btn-primary" onClick={openNewInvoice}>Generar factura</button>}
          </div>
        ) : (
          <table className="faro-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th style={{textAlign:'right'}}>Total</th>
                <th style={{textAlign:'right'}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(i => (
                <tr key={i.id}>
                  <td data-label="Número" style={{fontWeight:600}}>{i.number}</td>
                  <td data-label="Fecha" style={{fontSize:13,color:'var(--text-secondary)'}}>{formatDate(i.issueDate)}</td>
                  <td data-label="Cliente" style={{fontWeight:500}}>{i.clientName}</td>
                  <td data-label="Estado">
                    <select
                      value={i.status}
                      onChange={(e) => business.updateInvoiceStatus(i.id, e.target.value)}
                      style={{ padding:'4px 8px', borderRadius:20, border:'1px solid var(--border-light)', fontSize:12, fontWeight:600, outline:'none', background: `var(--${statusMap[i.status]?.color || 'gray'}-bg)`, color: statusMap[i.status]?.color==='gray' ? 'var(--text-secondary)' : `var(--${statusMap[i.status]?.color || 'gray'})` }}
                    >
                      <option value="draft">Borrador</option>
                      <option value="sent">Enviada</option>
                      <option value="paid">Cobrada</option>
                      <option value="overdue">Vencida</option>
                    </select>
                  </td>
                  <td data-label="Total" style={{textAlign:'right',fontWeight:700}}>{formatCurrency(i.total)}</td>
                  <td data-label="Acciones" style={{textAlign:'right'}}>
                    <button className="icon-btn" onClick={() => generateInvoicePDF(i, issuer, { name: i.clientName, cuit: i.clientCuit, email: i.clientEmail, phone: i.clientPhone })} title="Descargar PDF">
                      <Download size={16}/>
                    </button>
                    <button className="icon-btn" title="WhatsApp (Próximamente)">
                      <MessageCircle size={16}/>
                    </button>
                    <button className="icon-btn" title="Email (Próximamente)">
                      <Mail size={16}/>
                    </button>
                    <button className="icon-btn" style={{ fontSize:10, padding:'2px 4px', fontWeight:600, color:'var(--primary)' }} title="ARCA (Próximamente)">
                      ARCA
                    </button>
                    <button className="icon-btn danger" onClick={() => business.deleteInvoice(i.id)} title="Eliminar">
                      <Trash2 size={16}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setFlowMode(null); }} title="Nueva Factura">
        {flowMode === 'select' ? (
          <div style={{ display:'flex', flexDirection:'column', gap:16, padding:'10px 0' }}>
            <p style={{ color:'var(--text-secondary)', marginBottom:8 }}>¿A quién le vas a facturar?</p>
            <button className="btn-secondary" style={{ justifyContent:'flex-start', padding:'16px', border:'1px solid var(--border-light)' }} onClick={() => setFlowMode('existing')}>
              <div style={{ textAlign:'left' }}>
                <span style={{ display:'block', fontWeight:600, fontSize:15, marginBottom:4 }}>Cliente existente</span>
                <span style={{ fontSize:13, color:'var(--text-secondary)' }}>Seleccionar de mi lista de clientes</span>
              </div>
            </button>
            <button className="btn-secondary" style={{ justifyContent:'flex-start', padding:'16px', border:'1px solid var(--border-light)' }} onClick={() => setFlowMode('independent')}>
              <div style={{ textAlign:'left' }}>
                <span style={{ display:'block', fontWeight:600, fontSize:15, marginBottom:4 }}>Nueva persona o empresa</span>
                <span style={{ fontSize:13, color:'var(--text-secondary)' }}>Ingresar datos manualmente (No se guarda en Clientes)</span>
              </div>
            </button>
          </div>
        ) : (
          <form className="modal-form" onSubmit={handleSubmit}>
            
            {/* Header Form */}
            <div className="stack-on-mobile" style={{ display:'flex', gap:12, marginBottom:16 }}>
              <div style={{ flex:1 }}>
                <label className="field-label">Tipo de Comprobante</label>
                <select className="field-input" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                  <option value="A">Factura A</option>
                  <option value="B">Factura B</option>
                  <option value="C">Factura C</option>
                </select>
              </div>
              <div style={{ flex:1 }}>
                <label className="field-label">Fecha</label>
                <input type="date" className="field-input" defaultValue={new Date().toISOString().split('T')[0]} readOnly />
              </div>
            </div>

            {/* Customer Info */}
            <div style={{ border:'1px solid var(--border-light)', borderRadius:'var(--radius-lg)', padding:16, marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <label style={{ fontSize:14, fontWeight:600 }}>Datos del Cliente</label>
                <button type="button" onClick={() => setFlowMode('select')} style={{ background:'none', border:'none', color:'var(--primary)', fontSize:12, fontWeight:600, cursor:'pointer' }}>Cambiar</button>
              </div>

              {flowMode === 'existing' && (
                <div style={{ marginBottom:12 }}>
                  <select className="field-input" value={form.clientId} onChange={e => handleSelectClient(e.target.value)}>
                    <option value="" disabled>Seleccionar cliente...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              <div className="form-row">
                <input type="text" className="field-input" placeholder="Nombre / Razón Social" value={form.clientName} onChange={e=>setForm(f=>({...f,clientName:e.target.value}))} disabled={flowMode === 'existing' && !!form.clientId} required />
                <input type="text" className="field-input" placeholder="CUIT (Opcional)" value={form.clientCuit} onChange={e=>setForm(f=>({...f,clientCuit:e.target.value}))} />
                <input type="email" className="field-input" placeholder="Email (Opcional)" value={form.clientEmail} onChange={e=>setForm(f=>({...f,clientEmail:e.target.value}))} />
                <input type="tel" className="field-input" placeholder="Teléfono (Opcional)" value={form.clientPhone} onChange={e=>setForm(f=>({...f,clientPhone:e.target.value}))} />
              </div>
            </div>

            {/* Items */}
            <div style={{ border:'1px solid var(--border-light)', borderRadius:'var(--radius-lg)', padding:16 }}>
              <label style={{ display:'block', fontSize:14, fontWeight:600, marginBottom:12 }}>Productos / Servicios</label>
              
              {items.length > 0 && (
                <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
                  {items.map((it, idx) => (
                    <div key={idx} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'var(--surface-1)', padding:'8px 12px', borderRadius:'var(--radius-md)' }}>
                      <div>
                        <p style={{ margin:0, fontSize:14, fontWeight:500 }}>{it.quantity}x {it.description}</p>
                        <p style={{ margin:0, fontSize:12, color:'var(--text-tertiary)' }}>{formatCurrency(it.unitPrice)} c/u</p>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <span style={{ fontWeight:600 }}>{formatCurrency(it.quantity * it.unitPrice)}</span>
                        <button type="button" onClick={() => handleRemoveItem(idx)} style={{ background:'none', border:'none', color:'var(--red)', cursor:'pointer' }}><Trash2 size={16}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="stack-on-mobile" style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                <div style={{ flex:2 }}><input type="text" placeholder="Descripción" value={form.itemDesc} onChange={e=>setForm(f=>({...f,itemDesc:e.target.value}))} className="field-input" /></div>
                <div style={{ flex:1 }}><input type="number" placeholder="Cant" value={form.itemQty} onChange={e=>setForm(f=>({...f,itemQty:e.target.value}))} min="1" className="field-input" /></div>
                <div style={{ flex:1 }}><input type="number" placeholder="Precio" value={form.itemPrice} onChange={e=>setForm(f=>({...f,itemPrice:e.target.value}))} min="0" step="0.01" className="field-input" /></div>
                <button type="button" onClick={handleAddItem} style={{ background:'var(--primary)', border:'none', padding:'10px', borderRadius:'var(--radius-md)', cursor:'pointer', color:'white' }}><Plus size={16}/></button>
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginTop:16 }}>
              <label className="field-label">Notas (Opcional)</label>
              <textarea className="field-input" placeholder="Condiciones de pago, comentarios..." value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} rows={2} style={{ resize:'none' }}></textarea>
            </div>

            {/* Actions */}
            <div className="modal-actions" style={{ marginTop:24 }}>
              <div style={{ marginRight:'auto', display:'flex', gap:16, alignItems:'center' }}>
                <span style={{ fontSize:13, color:'var(--text-secondary)' }}>Subtotal: {formatCurrency(items.reduce((s,i)=>s+(i.quantity*i.unitPrice),0))}</span>
                <span style={{ fontSize:15, fontWeight:700, color:'var(--primary)' }}>
                  Total: {formatCurrency(items.reduce((s,i)=>s+(i.quantity*i.unitPrice),0) * (form.type === 'A' ? 1.21 : 1))}
                </span>
              </div>
              <button type="button" className="btn-secondary" onClick={() => { setShowModal(false); setFlowMode(null); }}>Cancelar</button>
              <button type="submit" className="btn-primary" disabled={items.length === 0}>Generar Comprobante</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
