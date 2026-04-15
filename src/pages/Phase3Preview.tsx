// Phase 3 — Scale: Full Dev→Test→QA→Prod ecosystem roadmap preview

interface Phase3PreviewProps {
  view: 'environments' | 'analytics' | 'env-pipeline' | 'cost-dashboard';
}

const DELIVERABLES = {
  'environments': {
    title: 'Multi-Environment Ecosystem',
    subtitle: 'Phase 3 — Scale',
    accentColor: '#a78bfa',
    description: 'Every citizen developer application automatically provisioned across Dev, Test, QA, and Production — fully connected via Cloud Deploy promotion pipelines.',
    environments: [
      { name: 'Dev', color: '#9FE870', desc: 'Instant sandbox — auto-provisioned on request. Ephemeral, low-cost, no approval required.', services: ['Cloud Run (dev)', 'Cloud SQL (small)', 'Cloud Build CI'] },
      { name: 'Test', color: '#60a5fa', desc: 'Integration testing environment. Automated test suite runs on every PR merge.', services: ['Cloud Run (test)', 'Cloud SQL (standard)', 'Cloud Deploy target'] },
      { name: 'QA', color: '#f59e0b', desc: 'Pre-production validation. Mirrors production config. Requires team lead approval to promote.', services: ['Cloud Run (QA)', 'Cloud SQL (standard)', 'Artifact Analysis'] },
      { name: 'Prod', color: '#a78bfa', desc: 'Production environment. Requires admin approval. Full audit trail, cost governance, and SCC monitoring active.', services: ['Cloud Run (prod)', 'Cloud SQL (high-avail)', 'SCC Standard', 'Cloud Armor'] },
    ],
    pipeline: [
      { from: 'Dev', to: 'Test', trigger: 'PR merge → automated tests pass' },
      { from: 'Test', to: 'QA', trigger: 'Team lead approval in portal' },
      { from: 'QA', to: 'Prod', trigger: 'Admin approval + OPA policy check' },
    ],
  },
  'analytics': {
    title: 'Platform Analytics',
    subtitle: 'Phase 3 — Scale',
    accentColor: '#a78bfa',
    description: 'Real-time visibility into platform health, adoption, cost attribution, and ROI — surfaced in a Looker Studio dashboard built on BigQuery.',
    metrics: [
      { label: 'Active Applications', value: '—', unit: 'across all environments', color: '#9FE870' },
      { label: 'Monthly GCP Spend', value: '—', unit: 'attributed by team', color: '#60a5fa' },
      { label: 'Deployments This Month', value: '—', unit: 'Dev → Prod promotions', color: '#f59e0b' },
      { label: 'LLM Calls Today', value: '—', unit: 'tokens + cost tracked', color: '#a78bfa' },
    ],
    features: [
      { icon: '◈', label: 'Cost attribution by team', detail: 'GCP spend broken down by Okta team, project, and environment. Enables chargeback and ROI reporting.' },
      { icon: '◎', label: 'Deployment velocity', detail: 'Track how fast teams move from Dev to Prod. Identify bottlenecks in the approval pipeline.' },
      { icon: '⬡', label: 'LLM usage trends', detail: 'Token consumption, model distribution, and cost per automation — all from Langfuse BigQuery export.' },
      { icon: '⌥', label: 'Security posture score', detail: 'Aggregate compliance status across all projects — OPA violations, unscanned images, and policy drift.' },
    ],
  },
  'env-pipeline': {
    title: 'Dev → Prod Pipeline',
    subtitle: 'Phase 3 — Scale (Admin)',
    accentColor: '#a78bfa',
    description: 'Fully automated Cloud Deploy pipeline connecting all four environments. Promotions require approval at each gate — enforced by Kong and OPA.',
    environments: [
      { name: 'Dev', color: '#9FE870', desc: 'Auto-provisioned on request. Ephemeral.', services: ['Cloud Run (dev)', 'Cloud SQL (small)', 'Cloud Build CI'] },
      { name: 'Test', color: '#60a5fa', desc: 'Integration tests run on every merge.', services: ['Cloud Run (test)', 'Cloud SQL (standard)', 'Cloud Deploy target'] },
      { name: 'QA', color: '#f59e0b', desc: 'Pre-production. Mirrors prod config.', services: ['Cloud Run (QA)', 'Cloud SQL (standard)', 'Artifact Analysis'] },
      { name: 'Prod', color: '#a78bfa', desc: 'Admin approval required. Full audit.', services: ['Cloud Run (prod)', 'Cloud SQL (HA)', 'SCC Standard', 'Cloud Armor'] },
    ],
    pipeline: [
      { from: 'Dev', to: 'Test', trigger: 'PR merge → automated tests pass' },
      { from: 'Test', to: 'QA', trigger: 'Team lead approval in portal' },
      { from: 'QA', to: 'Prod', trigger: 'Admin approval + OPA policy check' },
    ],
  },
  'cost-dashboard': {
    title: 'Cost Dashboard',
    subtitle: 'Phase 3 — Scale (Admin)',
    accentColor: '#a78bfa',
    description: 'Real-time GCP cost visibility across all citizen developer projects — with budget alerts, spend caps, and team-level attribution.',
    features: [
      { icon: '◈', label: 'Budget alerts', detail: 'GCP Billing API budget alerts trigger at 50%, 80%, and 100% of monthly budget per project.' },
      { icon: '◎', label: 'Spend caps', detail: 'Hard spend caps enforced via Org Policies. Projects that exceed cap are automatically suspended.' },
      { icon: '⬡', label: 'Team attribution', detail: 'All costs attributed to the Okta team that owns the project. Enables chargeback and ROI reporting.' },
      { icon: '⌥', label: 'Forecasting', detail: 'BigQuery ML models project end-of-month spend based on current trajectory. Alerts before budget is exceeded.' },
    ],
    metrics: [
      { label: 'Total Platform Spend', value: '—', unit: 'this month', color: '#9FE870' },
      { label: 'Projected Month-End', value: '—', unit: 'based on current trajectory', color: '#60a5fa' },
      { label: 'Projects Over Budget', value: '—', unit: 'require attention', color: '#ef4444' },
      { label: 'Cost per Automation', value: '—', unit: 'average monthly', color: '#a78bfa' },
    ],
  },
};

export default function Phase3Preview({ view }: Phase3PreviewProps) {
  const data = DELIVERABLES[view];
  const accent = data.accentColor;
  const hasEnvironments = 'environments' in data;
  const hasMetrics = 'metrics' in data;
  const hasFeatures = 'features' in data;

  return (
    <div style={{ flex: 1, background: 'var(--bg-primary)', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '28px 32px 20px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span style={{
            fontSize: '10px', fontWeight: '700', letterSpacing: '0.10em', textTransform: 'uppercase',
            padding: '3px 10px', borderRadius: '4px',
            background: `${accent}15`, border: `1px solid ${accent}35`, color: accent,
          }}>
            {data.subtitle}
          </span>
          <span style={{
            fontSize: '10px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase',
            padding: '3px 10px', borderRadius: '4px',
            background: 'rgba(255,107,53,0.10)', border: '1px solid rgba(255,107,53,0.25)', color: '#FF6B35',
          }}>
            Coming in Phase 3
          </span>
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '6px' }}>{data.title}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '600px', lineHeight: '1.6' }}>{data.description}</p>
      </div>

      <div style={{ padding: '28px 32px', maxWidth: '1100px' }}>
        {/* Environment cards */}
        {hasEnvironments && (
          <div style={{ marginBottom: '28px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '14px' }}>Environment Tiers</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {(data as { environments: { name: string; color: string; desc: string; services: string[] }[] }).environments.map((env) => (
                <div key={env.name} style={{
                  padding: '18px', background: 'var(--bg-secondary)',
                  border: `1px solid ${env.color}30`,
                  borderTop: `3px solid ${env.color}`,
                  borderRadius: '10px',
                }}>
                  <div style={{
                    display: 'inline-block', padding: '2px 10px', borderRadius: '4px',
                    background: `${env.color}15`, border: `1px solid ${env.color}35`,
                    color: env.color, fontSize: '11px', fontWeight: '700',
                    letterSpacing: '0.06em', marginBottom: '10px',
                  }}>{env.name}</div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '12px' }}>{env.desc}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {env.services.map((svc) => (
                      <div key={svc} style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: env.color, flexShrink: 0 }} />
                        {svc}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Promotion pipeline */}
            <div style={{ marginTop: '16px', padding: '16px 20px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '14px' }}>Promotion Gates</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {(data as { pipeline: { from: string; to: string; trigger: string }[] }).pipeline.map((gate, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ padding: '8px 14px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {gate.from}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                      <span style={{ fontSize: '16px', color: accent }}>→</span>
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)', maxWidth: '120px', textAlign: 'center', lineHeight: '1.3' }}>{gate.trigger}</span>
                    </div>
                    <div style={{ padding: '8px 14px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {gate.to}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Metrics placeholders */}
        {hasMetrics && (
          <div style={{ marginBottom: '28px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '14px' }}>Platform Metrics</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {(data as { metrics: { label: string; value: string; unit: string; color: string }[] }).metrics.map((m) => (
                <div key={m.label} style={{
                  padding: '18px', background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)', borderRadius: '10px',
                  borderTop: `3px solid ${m.color}`,
                }}>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: m.color, fontFamily: 'monospace', marginBottom: '4px' }}>{m.value}</div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>{m.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.unit}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feature cards */}
        {hasFeatures && (
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '14px' }}>Capabilities</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {(data as { features: { icon: string; label: string; detail: string }[] }).features.map((f) => (
                <div key={f.label} style={{
                  padding: '18px', background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)', borderRadius: '10px',
                  borderLeft: `3px solid ${accent}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '16px', color: accent }}>{f.icon}</span>
                    <span style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-primary)' }}>{f.label}</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: '1.6' }}>{f.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GCP services note */}
        <div style={{
          marginTop: '20px', padding: '16px 20px',
          background: 'rgba(159,232,112,0.05)', border: '1px solid rgba(159,232,112,0.18)',
          borderRadius: '10px', display: 'flex', alignItems: 'flex-start', gap: '12px',
        }}>
          <span style={{ fontSize: '18px', flexShrink: 0, marginTop: '1px' }}>⬡</span>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#9FE870', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>GCP-Native, Tool-Agnostic Design</div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Phase 3 infrastructure runs on GCP (Cloud Run, Cloud SQL, Cloud Deploy, BigQuery) — an intentional choice aligned with Klaviyo's existing GCP enterprise agreement.
              The platform layer — portal, pipelines, policies, and observability — is tool-agnostic and portable. Terraform modules are the key portable artifact.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
