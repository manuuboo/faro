import type { AppNotification } from '../../types/business';
import { formatDate } from '../../utils/format';

interface Props {
  notifications: AppNotification[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClear: () => void;
}

export default function NotificationPanel({ notifications, onClose, onMarkRead, onMarkAllRead, onClear }: Props) {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:399}} onClick={onClose} />
      <div style={{
        position:'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 'min(380px, 100vw)',
        maxHeight: '100vh',
        background:'white',
        borderRadius: 'var(--radius-xl) 0 0 var(--radius-xl)',
        boxShadow:'var(--shadow-xl)',
        border:'1px solid var(--border-light)',
        zIndex:400,
        display:'flex',
        flexDirection:'column',
        animation:'slideInRight 0.25s cubic-bezier(0.16,1,0.3,1)'
      }}>
        <div style={{padding:'20px', borderBottom:'1px solid var(--border-light)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h3 style={{margin:0, fontSize:16, fontWeight:700}}>Notificaciones {unreadCount > 0 && <span style={{background:'var(--accent)',color:'white',padding:'2px 8px',borderRadius:10,fontSize:11,marginLeft:8}}>{unreadCount}</span>}</h3>
          {notifications.length > 0 && (
            <div style={{display:'flex', gap:10}}>
              {unreadCount > 0 && <button onClick={onMarkAllRead} style={{background:'none',border:'none',fontSize:12,color:'var(--accent)',cursor:'pointer',fontWeight:600}}>Marcar leídas</button>}
              <button onClick={onClear} style={{background:'none',border:'none',fontSize:12,color:'var(--text-tertiary)',cursor:'pointer'}}>Limpiar</button>
            </div>
          )}
        </div>

        <div style={{overflowY:'auto', flex:1}}>
          {notifications.length === 0 ? (
            <div style={{padding:'40px 20px', textAlign:'center', color:'var(--text-tertiary)'}}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{marginBottom:12}}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <p style={{margin:0, fontSize:14}}>No tenés notificaciones.</p>
            </div>
          ) : (
            <div style={{display:'flex', flexDirection:'column'}}>
              {notifications.map(n => (
                <div key={n.id} onClick={() => !n.read && onMarkRead(n.id)} style={{
                  padding:'16px 20px', borderBottom:'1px solid var(--border-light)', cursor:n.read ? 'default' : 'pointer',
                  background: n.read ? 'transparent' : 'var(--accent-light)', transition:'background 0.2s', display:'flex', gap:12
                }}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:'var(--accent)',marginTop:6,opacity:n.read?0:1,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <p style={{margin:'0 0 4px', fontSize:13.5, fontWeight:n.read?500:600, color:'var(--text-primary)'}}>{n.title}</p>
                    <p style={{margin:'0 0 6px', fontSize:13, color:'var(--text-secondary)'}}>{n.description}</p>
                    <p style={{margin:0, fontSize:11, color:'var(--text-tertiary)'}}>{formatDate(n.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
