import { useState } from 'react';
import { useRequests } from '../context/RequestContext';
import type { ProvisionRequest, RequestStatus } from '../context/RequestContext';

const STATUS_CONFIG: Record<RequestStatus, { label: string; color: string; bg: string }> = {
  provisioning: { label: 'Provisioning', color: '#b45309', bg: '#fef3c7' },
  complete: { label: 'Active', color: '#166534', bg: '#dcfce7' },
  failed: { label: 'Failed', color: '#991b1b', bg: '#fee2e2' },
};

const PIPELINE_STAGES = [
  { id: 'trigger', label: 'Pub/Sub Trigger', service: 'Cloud Pub/Sub' },
  { id: 'workflow', label: 'Cloud Workflows', service: 'Cloud Workflows' },
  { id: 'terraform', label: 'Terraform Apply', service: 'Infrastructure Manager' },
  { id: 'kong', label: 'Kong Workspace', service: 'Kong Admin API' },
  { id: 'wif', label: 'WIF + GitHub Repo', service: 'Workload Identity Federation' },
  { id: 'notify', label: 'Access Notification', service: 'Cloud Scheduler' },
];

function getPipelineProgress(status: RequestStatus): number {
  switch (status) {
    case 'provisioning': return 3;
    case 'complete': return 6;
    case 'failed': return -1;
    default: return 0;
  }
}

export default function AdminApprovals() {
  const { requests } = useRequests();
  const [selectedReq, setSelectedReq] = useState<ProvisionRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<RequestStatus | 'all'>('all');

  const filtered = filterStatus === 'all' ? requests : requests.filter(r => r.status === filterStatus);
  const activeCount = requests.filter(r => r.status === 'provisioning').length;

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* Left: Request List */}
      <div style={{ width: '420px', flexShrink: 0, borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.10em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '4px', background: 'rgba(159,232,112,0.12)', border: '1px solid rgba(159,232,112,0.30)', color: '#3a7a1a' }}>Phase 1 — Foundation</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <h1 style={{ color: 'var(--text-primary)', fontSize: '20px', fontWeight: '800', letterSpacing: '-0.3px' }}>Provisioning Monitor</h1>
            {activeCount > 0 && (
              <span style={{ background: '#eab308', color: '#0a0a0a', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' }}>{activeCount} active</span>
            )}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '14px', lineHeight: '1.5' }}>
            Environments are provisioned automatically — no manual approval required. Monitor pipeline status in real time.
          </p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {(['all', 'provisioning', 'complete', 'failed'] as const).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} style={{
                padding: '4px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer',
                background: filterStatus === s ? 'var(--accent-green-dim)' : 'var(--bg-tertiary)',
                border: `1px solid ${filterStatus === s ? 'var(--accent-green)' : 'var(--border-color)'}`,
                color: filterStatus === s ? 'var(--accent-green)' : 'var(--text-secondary)',
                fontFamily: 'JetBrains Mono, monospace',
              }}>
                {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '13px' }}>No environments found</div>
          )}
          {filtered.map(req => {
            const cfg = STATUS_CONFIG[req.status];
            const progress = getPipelineProgress(req.status);
            const pct = progress < 0 ? 100 : Math.round((progress / PIPELINE_STAGES.length) * 100);
            const barColor = progress < 0 ? 'var(--accent-red)' : req.status === 'complete' ? 'var(--accent-green)' : '#eab308';
            return (
              <div key={req.id} onClick={() => setSelectedReq(req)} style={{
                padding: '12px 14px', borderRadius: '8px', cursor: 'pointer',
                background: selectedReq?.id === req.id ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                border: `1px solid ${selectedReq?.id === req.id ? 'var(--accent-green)' : 'var(--border-color)'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}>{req.projectName}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{req.submittedBy} · {req.team}</div>
                  </div>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '600', background: cfg.bg, color: cfg.color, flexShrink: 0, marginLeft: '8px' }}>{cfg.label}</span>
                </div>
                <div style={{ height: '3px', background: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden', marginBottom: '4px' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: '2px' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'JetBrains Mono, monospace' }}>{req.id}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{req.environment} · ${req.estimatedMonthlyCost}/mo</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Detail Panel */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {!selectedReq ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚙</div>
              <div style={{ fontSize: '14px' }}>Select an environment to view pipeline status</div>
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: '600px' }}>
            <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <h2 style={{ color: 'var(--text-primary)', fontSize: '20px', fontWeight: '700', fontFamily: 'JetBrains Mono, monospace' }}>{selectedReq.projectName}</h2>
                <span style={{ padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', background: STATUS_CONFIG[selectedReq.status].bg, color: STATUS_CONFIG[selectedReq.status].color }}>
                  {STATUS_CONFIG[selectedReq.status].label}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Requested by', value: selectedReq.submittedBy },
                  { label: 'Team', value: selectedReq.team },
                  { label: 'Environment', value: selectedReq.environment.toUpperCase() },
                  { label: 'Est. cost', value: `$${selectedReq.estimatedMonthlyCost}/mo` },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.label}</div>
                    <div style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: '500' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pipeline stages */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px', fontFamily: 'JetBrains Mono, monospace' }}>Provisioning Pipeline</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {PIPELINE_STAGES.map((stage, idx) => {
                  const progress = getPipelineProgress(selectedReq.status);
                  const isDone = progress >= 0 && idx < progress;
                  const isActive = progress >= 0 && idx === progress && selectedReq.status === 'provisioning';
                  const isFailed = progress < 0 && idx === 2;
                  const stageColor = isFailed ? 'var(--accent-red)' : isDone ? 'var(--accent-green)' : isActive ? '#eab308' : 'var(--border-color)';
                  return (
                    <div key={stage.id} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: isFailed ? 'var(--accent-red-dim)' : isDone ? 'var(--accent-green-dim)' : isActive ? '#eab30820' : 'var(--bg-tertiary)', border: `1.5px solid ${stageColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: stageColor }}>
                          {isFailed ? '✗' : isDone ? '✓' : isActive ? '⟳' : <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{idx + 1}</span>}
                        </div>
                        {idx < PIPELINE_STAGES.length - 1 && (
                          <div style={{ width: '1.5px', height: '24px', background: isDone ? 'var(--accent-green)' : 'var(--border-color)' }} />
                        )}
                      </div>
                      <div style={{ paddingTop: '4px', marginBottom: '8px' }}>
                        <div style={{ color: isDone || isActive ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '13px', fontWeight: isDone || isActive ? '600' : '400' }}>{stage.label}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace' }}>{stage.service}</div>
                        {isActive && <div style={{ marginTop: '3px', fontSize: '11px', color: '#eab308' }}>⟳ Running…</div>}
                        {isFailed && <div style={{ marginTop: '3px', fontSize: '11px', color: 'var(--accent-red)' }}>✗ Error — check Cloud Logging</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* GCP Services */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px', fontFamily: 'JetBrains Mono, monospace' }}>GCP Services</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ padding: '3px 8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '11px', color: 'var(--accent-blue)', fontFamily: 'JetBrains Mono, monospace' }}>{selectedReq.serviceCombo || '—'}</span>
              </div>
            </div>

            {/* Justification */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontFamily: 'JetBrains Mono, monospace' }}>Business Justification</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6' }}>{selectedReq.justification || 'No justification provided.'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
