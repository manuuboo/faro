import type { OnboardingData } from '../../types/onboarding';
import type { DashboardSection } from '../../pages/Dashboard';

interface Props {
  userData: OnboardingData;
  onClose: () => void;
  onNavigate: (section: DashboardSection) => void;
  onLogout: () => void;
}

export default function ProfileMenu({ userData, onClose, onNavigate, onLogout }: Props) {
  const getInitials = (name: string) => name.trim().split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

  const calculateCompletion = () => {
    let score = 0;
    if (userData.name) score += 25;
    if (userData.businessName) score += 25;
    if (userData.category) score += 25;
    score += 25; // Base minimum completion
    return score;
  };
  const completionPercent = calculateCompletion();

  return (
    <>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 399 }} onClick={onClose} />
      <div className="profile-menu-popup" style={{
        position: 'absolute', bottom: 80, left: 20, width: 280,
        background: 'white', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--border-light)', zIndex: 400, display: 'flex', flexDirection: 'column',
        animation: 'slideUp 0.2s cubic-bezier(0.16,1,0.3,1)'
      }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, var(--accent), #9c27b0)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>
              {getInitials(userData.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userData.name}</p>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userData.businessName}</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ flex: 1, height: 6, background: 'var(--border-light)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${completionPercent}%`, background: completionPercent === 100 ? 'var(--success)' : 'var(--accent)', transition: 'width 0.5s ease' }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{completionPercent}%</span>
          </div>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--text-tertiary)' }}>Perfil {completionPercent === 100 ? 'completo' : 'incompleto'}</p>
        </div>

        <div style={{ padding: '8px' }}>
          <button onClick={() => onNavigate('settings')} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: 'transparent', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 13.5, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }} onMouseOver={e => e.currentTarget.style.background = 'var(--surface-hover)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            Mi Perfil
          </button>
          <button onClick={() => { onClose(); window.dispatchEvent(new CustomEvent('open-tutorial')); }} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: 'transparent', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 13.5, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }} onMouseOver={e => e.currentTarget.style.background = 'var(--surface-hover)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            Ayuda
          </button>
        </div>

        <div style={{ padding: '8px', borderTop: '1px solid var(--border-light)' }}>
          <button onClick={onLogout} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: 'transparent', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 13.5, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 10 }} onMouseOver={e => e.currentTarget.style.background = 'var(--red-bg)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
}
