import { useRequests } from '../context/RequestContext';
import type { RequestStatus } from '../context/RequestContext';

const STATUS_CONFIG: Record<RequestStatus, { label: string; color: string; bg: string }> = {
  provisioning: { label: 'Provisioning', color: '#b45309', bg: '#fef3c7' },
  complete: { label: 'Active', color: '#166534', bg: '#dcfce7' },
  failed: { label: 'Failed', color: '#991b1b', bg: '#fee2e2' },
};

export default function AdminDeployments() {
  const { requests } = useRequests();

  const active = requests.filter(r => r.status === 'complete');
  const provisioning = requests.filter(r => r.status === 'provisioning');
  const totalMonthlyCost = active.reduce((sum, r) => sum + r.estimatedMonthlyCost, 0);

  return (
    <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
      <div style={{ maxWidth: '1000px' }}>
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.10em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '4px', background: 'rgba(159,232,112,0.12)', border: '1px solid rgba(159,232,112,0.30)', color: '#3a7a1a' }}>Phase 1 — Foundation</span>
          </div>
          <h1 style={{ color: 'var(--text-primary)', fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '4px' }}>All Deployments</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Overview of all environment requests across the organization</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Total Requests', value: requests.length, color: '#2563eb' },
            { label: 'Active Environments', value: active.length, color: '#166534' },
            { label: 'Provisioning', value: provisioning.length, color: '#b45309' },
            { label: 'Est. Monthly Cost', value: `$${totalMonthlyCost}`, color: '#166534' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '14px 16px' }}>
              <div style={{ color: stat.color, fontSize: '24px', fontWeight: '800', fontFamily: 'monospace' }}>{stat.value}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                {['Project', 'Owner', 'Team', 'Environment', 'Service Combo', 'Status', 'Cost/mo'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'JetBrains Mono, monospace' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.map((req, i) => {
                const st = STATUS_CONFIG[req.status];
                const envColor = req.environment === 'stage' ? '#7c3aed' : '#2563eb';
                return (
                  <tr key={req.id} style={{ borderBottom: i < requests.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}>{req.projectName}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace' }}>{req.id}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>{req.submittedBy}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>{req.team}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', background: `${envColor}22`, color: envColor, fontFamily: 'JetBrains Mono, monospace' }}>
                        {req.environment.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '1px 6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '3px', color: 'var(--text-muted)', fontSize: '11px' }}>{req.serviceCombo || '—'}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', background: st.bg, color: st.color, fontFamily: 'JetBrains Mono, monospace' }}>{st.label}</span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#166534', fontWeight: '600', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}>
                      ${req.estimatedMonthlyCost}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
