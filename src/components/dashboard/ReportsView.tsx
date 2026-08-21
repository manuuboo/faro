import { useMemo } from 'react';
import { formatCurrency, formatDate } from '../../utils/format';
import type { Activity } from '../../types/business';
import './SectionView.css';

interface Props { business: any; }

export default function ReportsView({ business }: Props) {
  const stats = business.stats;
  const activities: Activity[] = business.data.activities;

  const typeMap: Record<string, string> = {
    sale: 'Venta',
    purchase: 'Compra',
    client: 'Cliente',
    expense: 'Gasto',
    inventory: 'Inventario',
    invoice: 'Factura',
    supplier: 'Proveedor'
  };

  const typeColorMap: Record<string, string> = {
    sale: 'green',
    purchase: 'blue',
    client: 'purple',
    expense: 'orange',
    inventory: 'blue',
    invoice: 'violet',
    supplier: 'blue'
  };

  // Group by day for the chart
  const last7Days = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      
      const daySales = business.data.sales
        .filter((s:any) => s.date.slice(0, 10) === dateStr)
        .reduce((sum:number, s:any) => sum + s.amount, 0);
        
      const dayPurchases = business.data.purchases
        .filter((s:any) => s.date.slice(0, 10) === dateStr)
        .reduce((sum:number, s:any) => sum + s.amount, 0);
        
      data.push({
        label: d.toLocaleDateString('es-AR', { weekday:'short' }),
        sales: daySales,
        purchases: dayPurchases
      });
    }
    return data;
  }, [business.data.sales, business.data.purchases]);

  const maxChartValue = Math.max(...last7Days.map(d => Math.max(d.sales, d.purchases)), 100);

  return (
    <div className="section-view">
      <div className="section-card">
        <div className="section-header">
          <h2 className="section-title">Reportes y Estadísticas</h2>
          <p className="section-description">Resumen del rendimiento de tu negocio.</p>
        </div>

        {/* Global stats */}
        <div style={{ display:'flex', gap:16, marginBottom:32, flexWrap:'wrap' }}>
          {[
            { label:'Ventas Totales', value: formatCurrency(stats.totalSales), color:'--green' },
            { label:'Compras Totales', value: formatCurrency(stats.totalPurchases), color:'--blue' },
            { label:'Gastos', value: formatCurrency(stats.totalExpenses), color:'--orange' },
            { label:'Balance Neto', value: formatCurrency(stats.netResult), color: stats.netResult >= 0 ? '--green' : '--red' },
          ].map(s => (
            <div key={s.label} className="mini-stat" style={{ background:'var(--surface-1)', border:'1px solid var(--border-light)', borderRadius:'var(--radius-lg)', padding:'20px', flex:'1 1 200px' }}>
              <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:6, fontWeight:500 }}>{s.label}</p>
              <p style={{ fontSize:26, fontWeight:700, color:'var(--text-primary)', fontFamily:'var(--font-display)', letterSpacing:'-0.02em' }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Chart (Visual representation) */}
        <div style={{ background:'white', border:'1px solid var(--border-light)', borderRadius:'var(--radius-xl)', padding:'24px', marginBottom:32 }}>
          <h3 style={{ fontSize:16, fontWeight:600, marginBottom:24, display:'flex', justifyContent:'space-between' }}>
            Actividad de los últimos 7 días
            <div style={{ display:'flex', gap:16, fontSize:12, fontWeight:500 }}>
              <span style={{ display:'flex', alignItems:'center', gap:6 }}><span style={{ width:10, height:10, borderRadius:2, background:'var(--green)' }}/> Ventas</span>
              <span style={{ display:'flex', alignItems:'center', gap:6 }}><span style={{ width:10, height:10, borderRadius:2, background:'var(--blue)' }}/> Compras</span>
            </div>
          </h3>
          <div style={{ height:200, display:'flex', alignItems:'flex-end', gap:12, paddingBottom:30, borderBottom:'1px solid var(--border-light)', position:'relative' }}>
            {last7Days.map((d, i) => {
              const salesHeight = (d.sales / maxChartValue) * 100;
              const purchasesHeight = (d.purchases / maxChartValue) * 100;
              return (
                <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, height:'100%', justifyContent:'flex-end', position:'relative' }}>
                  <div style={{ display:'flex', gap:4, alignItems:'flex-end', height:'100%', width:'100%', justifyContent:'center' }}>
                    <div style={{ width:'30%', background:'var(--green)', borderRadius:'4px 4px 0 0', height:`${Math.max(salesHeight, 2)}%`, minHeight:4, transition:'height 0.5s ease' }} title={`Ventas: ${formatCurrency(d.sales)}`} />
                    <div style={{ width:'30%', background:'var(--blue)', borderRadius:'4px 4px 0 0', height:`${Math.max(purchasesHeight, 2)}%`, minHeight:4, transition:'height 0.5s ease' }} title={`Compras: ${formatCurrency(d.purchases)}`} />
                  </div>
                  <span style={{ position:'absolute', bottom:-24, fontSize:11, color:'var(--text-secondary)', textTransform:'capitalize' }}>{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Log */}
        <div>
          <h3 style={{ fontSize:16, fontWeight:600, marginBottom:16 }}>Registro detallado</h3>
          {activities.length === 0 ? (
            <p style={{ color:'var(--text-tertiary)', fontSize:14 }}>No hay actividad registrada aún.</p>
          ) : (
            <div style={{ background:'white', border:'1px solid var(--border-light)', borderRadius:'var(--radius-xl)', overflow:'hidden' }}>
              <table className="faro-table" style={{ margin:0 }}>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th style={{textAlign:'right'}}>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.slice(0, 15).map(a => (
                    <tr key={a.id}>
                      <td data-label="Fecha" style={{ fontSize:13, color:'var(--text-secondary)' }}>{formatDate(a.date)}</td>
                      <td data-label="Tipo"><span className={`badge badge-${typeColorMap[a.type] || 'gray'}`}>{typeMap[a.type] || a.type}</span></td>
                      <td data-label="Descripción" style={{ fontWeight:500 }}>
                        {a.title}
                        {a.description && <span style={{ color:'var(--text-secondary)', fontWeight:400, marginLeft:6 }}>— {a.description}</span>}
                      </td>
                      <td data-label="Monto" style={{ textAlign:'right', fontWeight:600, color: a.amount && a.amount > 0 ? 'var(--green)' : a.amount && a.amount < 0 ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                        {a.amount ? (a.amount > 0 ? '+' : '') + formatCurrency(a.amount) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
