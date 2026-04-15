import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRequests } from '../context/RequestContext';
import type { RequestStatus } from '../context/RequestContext';

const STATUS_CONFIG: Record<RequestStatus, { label: string; color: string; bg: string }> = {
  provisioning: { label: 'Provisioning…', color: '#b45309', bg: '#fef3c7' },
  complete: { label: 'Active', color: '#166534', bg: '#dcfce7' },
  failed: { label: 'Failed', color: '#991b1b', bg: '#fee2e2' },
};

interface Props {
  onNavigate: (page: string) => void;
}

export default function MyRequests({ onNavigate }: Props) {
  const { currentUser } = useAuth();
  const { requests } = useRequests();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const myRequests = requests.filter(r => r.submittedByEmail === currentUser?.email);
  const activeCount = myRequests.filter(r => r.status === 'complete').length;

  return (
    <div style={{ flex: 1, padding: '32px', overflowY: 'auto', background: 'var(--bg-primary)' }}>
      <div style={{ maxWidth: '900px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.10em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '4px', background: 'rgba(159,232,112,0.12)', border: '1px solid rgba(159,232,112,0.30)', color: '#3a7a1a' }}>Phase 1 — Foundation</span>
            </div>
            <h1 style={{ color: 'var(--text-primary)', fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '4px' }}>My Environments</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{activeCount} active · {myRequests.length} total</p>
          </div>
          <button
            onClick={() => onNavigate('portal')}
            style={{ padding: '10px 18px', background: '#9FE870', border: 'none', borderRadius: '6px', color: '#0a0a0a', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
          >
            + New Environment
          </button>
        </div>

        {myRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>◫</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '20px' }}>No environments yet</p>
            <button onClick={() => onNavigate('portal')} style={{ padding: '10px 20px', background: '#9FE870', border: 'none', borderRadius: '6px', color: '#0a0a0a', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
              Request Your First Environment
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {myRequests.map(req => {
              const st = STATUS_CONFIG[req.status];
              const isExpanded = expandedId === req.id;
              const isActive = req.status === 'complete' && req.gcpProjectId;

              return (
                <div
                  key={req.id}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: `1px solid ${isExpanded ? 'rgba(159,232,112,0.40)' : 'var(--border-color)'}`,
                    borderRadius: '10px',
                    overflow: 'hidden',
                    transition: 'border-color 0.15s',
                  }}
                >
                  {/* Card header row */}
                  <div style={{ padding: '18px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '15px', fontFamily: 'JetBrains Mono, monospace' }}>{req.projectName}</span>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', background: st.bg, color: st.color }}>{st.label}</span>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>{req.environment}</span>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>{req.serviceCombo}</span>
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{req.team} · {req.costCenter} · Submitted {new Date(req.submittedAt).toLocaleDateString()}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, marginLeft: '16px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#166534', fontWeight: '700', fontSize: '15px' }}>${req.estimatedMonthlyCost}/mo</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>estimated</div>
                      </div>
                      {isActive && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : req.id)}
                          style={{
                            padding: '7px 14px',
                            background: isExpanded ? 'rgba(159,232,112,0.12)' : '#9FE870',
                            border: isExpanded ? '1px solid rgba(159,232,112,0.40)' : 'none',
                            borderRadius: '6px',
                            color: isExpanded ? '#166534' : '#0a0a0a',
                            fontWeight: '700',
                            fontSize: '12px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {isExpanded ? 'Hide Details' : 'View Environment'}
                        </button>
                      )}
                      {req.status === 'provisioning' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '6px' }}>
                          <span style={{ fontSize: '12px' }}>⟳</span>
                          <span style={{ color: '#92400e', fontSize: '12px', fontWeight: '600' }}>~5 min</span>
                        </div>
                      )}
                      {req.status === 'failed' && (
                        <button
                          onClick={() => onNavigate('portal')}
                          style={{ padding: '7px 14px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '6px', color: '#991b1b', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded environment detail panel */}
                  {isExpanded && isActive && (
                    <div style={{ borderTop: '1px solid var(--border-color)', padding: '18px', background: 'var(--bg-tertiary)' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '14px' }}>Provisioned Resources</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                        {[
                          { label: 'GCP Project ID', value: req.gcpProjectId || '—', icon: '◈' },
                          { label: 'Cloud Run URL', value: req.cloudRunUrl || '—', icon: '⬡', link: req.cloudRunUrl },
                          { label: 'Kong Workspace', value: req.kongWorkspace || '—', icon: '⌥' },
                          { label: 'WIF Pool', value: req.wifPool ? '✓ Configured (keyless)' : '—', icon: '⊕' },
                          ...(req.cloudSqlInstance ? [{ label: 'Cloud SQL Instance', value: req.cloudSqlInstance, icon: '◫' }] : []),
                          ...(req.githubRepo ? [{ label: 'GitHub Repo', value: req.githubRepo, icon: '◉', link: `https://github.com/${req.githubRepo}` }] : []),
                        ].map(item => (
                          <div key={item.label} style={{ padding: '10px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{item.icon}</span>
                              <span style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</span>
                            </div>
                            {item.link ? (
                              <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{item.value}</a>
                            ) : (
                              <div style={{ color: 'var(--text-primary)', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Quick actions */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <a
                          href={`https://console.cloud.google.com/home/dashboard?project=${req.gcpProjectId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ padding: '7px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', textDecoration: 'none' }}
                        >
                          ↗ GCP Console
                        </a>
                        <a
                          href={`https://github.com/${req.githubRepo}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ padding: '7px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', textDecoration: 'none' }}
                        >
                          ↗ GitHub Repo
                        </a>
                        <button
                          style={{ padding: '7px 14px', background: 'var(--bg-secondary)', border: '1px solid #fca5a5', borderRadius: '6px', color: '#991b1b', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                          onClick={() => alert('Decommission request sent to Slack for approval.')}
                        >
                          Decommission
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
