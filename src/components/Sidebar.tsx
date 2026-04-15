import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

function KlaviyoLogo() {
  return (
    <svg width="90" height="20" viewBox="0 0 90 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="16" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="16" fill="#ffffff" letterSpacing="-0.5">klaviyo</text>
    </svg>
  );
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { currentUser, logout } = useAuth();

  const citizenNavItems = [
    {
      section: 'Phase 1 — Foundation',
      items: [
        { id: 'portal', label: 'Request Environment', icon: '⊕' },
        { id: 'my-requests', label: 'My Requests', icon: '◫' },
      ],
    },
    {
      section: 'Phase 2 — Intelligence',
      items: [
        { id: 'code-review', label: 'Code Review', icon: '⌥' },
        { id: 'observability', label: 'LLM Observability', icon: '◎' },
      ],
    },
    {
      section: 'Phase 3 — Scale',
      items: [
        { id: 'environments', label: 'Environments', icon: '⬡' },
        { id: 'analytics', label: 'Platform Analytics', icon: '◈' },
      ],
    },
  ];

  const adminNavItems = [
    {
      section: 'Phase 1 — Foundation',
      items: [
        { id: 'admin-approvals', label: 'Provisioning Monitor', icon: '⚙' },
        { id: 'admin-deployments', label: 'All Deployments', icon: '◫' },
        { id: 'admin-users', label: 'User Management', icon: '◉' },
      ],
    },
    {
      section: 'Phase 2 — Intelligence',
      items: [
        { id: 'security-controls', label: 'Security Controls', icon: '⌥' },
        { id: 'llm-audit', label: 'LLM Audit Trail', icon: '◎' },
      ],
    },
    {
      section: 'Phase 3 — Scale',
      items: [
        { id: 'env-pipeline', label: 'Dev→Stage Pipeline', icon: '⬡' },
        { id: 'cost-dashboard', label: 'Cost Dashboard', icon: '◈' },
      ],
    },
  ];

  const navSections = currentUser?.role === 'admin' ? adminNavItems : citizenNavItems;

  const sectionColors: Record<string, string> = {
    'Phase 1 — Foundation': '#9FE870',
    'Phase 2 — Intelligence': '#60a5fa',
    'Phase 3 — Scale': '#a78bfa',
  };

  return (
    <div style={{
      width: '230px',
      flexShrink: 0,
      background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--sidebar-border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
    }}>
      {/* Klaviyo Logo */}
      <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid var(--sidebar-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
          <KlaviyoLogo />
        </div>
        <div style={{
          marginTop: '6px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(159,232,112,0.12)',
          border: '1px solid rgba(159,232,112,0.25)',
          borderRadius: '4px',
          padding: '3px 8px',
        }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#9FE870', display: 'inline-block', flexShrink: 0 }} className="pulse-green" />
          <span style={{ color: '#9FE870', fontSize: '10px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {currentUser?.role === 'admin' ? 'Admin Console' : 'Developer Portal'}
          </span>
        </div>
      </div>

      {/* Nav sections */}
      <nav style={{ flex: 1, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '0', overflowY: 'auto' }}>
        {navSections.map((section) => (
          <div key={section.section} style={{ marginBottom: '2px' }}>
            {/* Section header */}
            <div style={{
              padding: '7px 8px 3px',
              fontSize: '9px',
              fontWeight: '700',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: sectionColors[section.section] || 'rgba(255,255,255,0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span style={{ flex: 1 }}>{section.section}</span>
              {section.section !== 'Phase 1 — Foundation' && (
                <span style={{
                  fontSize: '8px',
                  padding: '1px 5px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: '3px',
                  color: 'rgba(255,255,255,0.30)',
                  letterSpacing: '0.06em',
                }}>MVP</span>
              )}
            </div>

            {section.items.map((item: { id: string; label: string; icon: string; badge?: number }) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    padding: '6px 10px',
                    width: '100%',
                    textAlign: 'left',
                    background: isActive ? 'rgba(159,232,112,0.12)' : 'transparent',
                    border: `1px solid ${isActive ? 'rgba(159,232,112,0.30)' : 'transparent'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    marginBottom: '1px',
                    opacity: 1,
                    borderRadius: '4px',
                  }}
                >
                  <span style={{ fontSize: '13px', color: isActive ? '#9FE870' : 'rgba(255,255,255,0.45)', width: '16px', textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.65)', fontSize: '12.5px', fontWeight: isActive ? '600' : '400', flex: 1 }}>{item.label}</span>
                  {item.badge ? (
                    <span style={{ background: '#FF6B35', color: '#fff', fontSize: '9px', fontWeight: '700', padding: '1px 5px', borderRadius: '8px' }}>{item.badge}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User info */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid var(--sidebar-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: currentUser?.role === 'admin' ? 'rgba(167,139,250,0.15)' : 'rgba(159,232,112,0.15)',
            border: `1px solid ${currentUser?.role === 'admin' ? 'rgba(167,139,250,0.35)' : 'rgba(159,232,112,0.35)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: currentUser?.role === 'admin' ? '#a78bfa' : '#9FE870',
            fontWeight: '700',
            fontSize: '11px',
            flexShrink: 0,
          }}>
            {currentUser?.avatar}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: '#ffffff', fontSize: '12px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser?.name}</div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser?.team}</div>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            width: '100%',
            padding: '6px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: '6px',
            color: 'rgba(255,255,255,0.50)',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
