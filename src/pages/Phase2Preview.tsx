// Phase 2 — Intelligence: Roadmap preview page
// Shows code review automation, security controls, LLM observability — all "coming soon"

interface Phase2PreviewProps {
  view: 'code-review' | 'observability' | 'security-controls' | 'llm-audit';
}

const DELIVERABLES = {
  'code-review': {
    title: 'Code Review Automation',
    subtitle: 'Phase 2 — Intelligence',
    accentColor: '#60a5fa',
    description: 'Every pull request automatically reviewed by Gemini via Kong API gateway before deployment. Provider-agnostic — swap models without touching the pipeline.',
    features: [
      { icon: '⌥', label: 'AI-powered PR review', detail: 'Gemini 2.0 Flash via Vertex AI, routed through Kong — configurable per environment variable' },
      { icon: '◈', label: 'OPA policy enforcement', detail: 'Open Policy Agent evaluates findings JSON against security rules. Non-compliant PRs are blocked automatically.' },
      { icon: '◎', label: 'PII detection & redaction', detail: 'Sensitive data detected and redacted from all LLM inputs and outputs before processing.' },
      { icon: '⬡', label: 'BigQuery audit trail', detail: 'All review findings stored in BigQuery — queryable by user, project, date, and model.' },
    ],
    architecture: [
      { step: 'PR opened', detail: 'GitHub Actions triggers review pipeline' },
      { step: 'Kong gateway', detail: 'Routes request to configured AI provider' },
      { step: 'Vertex AI', detail: 'Gemini reviews diff, returns structured findings' },
      { step: 'OPA evaluation', detail: 'Policy engine blocks or warns based on findings' },
      { step: 'BigQuery', detail: 'Findings stored for audit and analytics' },
    ],
    gcp: ['Vertex AI (Gemini)', 'Cloud Run (Kong)', 'BigQuery', 'Cloud Build'],
  },
  'observability': {
    title: 'LLM Observability',
    subtitle: 'Phase 2 — Intelligence',
    accentColor: '#60a5fa',
    description: 'Every prompt, response, token count, latency, and cost captured per automation and per user. Full trace visibility via Langfuse deployed on GCP.',
    features: [
      { icon: '◎', label: 'Langfuse on Cloud Run', detail: 'Self-hosted Langfuse deployed on GCP — every LLM call traced with full input/output, tokens, latency, and cost.' },
      { icon: '◈', label: 'Anomaly detection', detail: 'Automated alerts when an automation deviates from baseline — hallucinations, cost spikes, or unexpected outputs.' },
      { icon: '⬡', label: 'Cost attribution', detail: 'Token costs attributed to individual users, teams, and projects. Enables ROI reporting for leadership.' },
      { icon: '⌥', label: 'Compliance audit trail', detail: 'Full prompt/response history retained in BigQuery for compliance reporting — queryable by user, project, date, and model.' },
    ],
    architecture: [
      { step: 'LLM call', detail: 'Citizen developer automation calls Gemini via Kong' },
      { step: 'Langfuse SDK', detail: 'Traces captured automatically — no code change required' },
      { step: 'Cloud Run', detail: 'Langfuse server processes and stores traces' },
      { step: 'BigQuery export', detail: 'Traces exported nightly for long-term analytics' },
      { step: 'Dashboard', detail: 'Cost attribution and quality metrics surfaced to teams' },
    ],
    gcp: ['Cloud Run (Langfuse)', 'BigQuery', 'Cloud Monitoring', 'Vertex AI'],
  },
  'security-controls': {
    title: 'Security Controls',
    subtitle: 'Phase 2 — Intelligence (Admin)',
    accentColor: '#f59e0b',
    description: 'Automated security posture management — policy-as-code, container scanning, and Workload Identity Federation enforcement across all citizen developer environments.',
    features: [
      { icon: '◈', label: 'Policy-as-Code (OPA)', detail: 'Terraform plans validated against security policies before apply. Non-compliant infrastructure rejected automatically.' },
      { icon: '⌥', label: 'Container vulnerability scanning', detail: 'Artifact Registry scans every container image on push. Critical vulnerabilities block deployment.' },
      { icon: '◎', label: 'WIF enforcement', detail: 'Workload Identity Federation enforced across all environments. No long-lived service account keys.' },
      { icon: '⬡', label: 'Org Policy compliance', detail: 'GCP Organization Policies continuously evaluated. Drift detected and alerted within minutes.' },
    ],
    architecture: [
      { step: 'Terraform plan', detail: 'IaC submitted via provisioning pipeline' },
      { step: 'OPA evaluation', detail: 'Policy engine validates plan against security rules' },
      { step: 'Container push', detail: 'Image pushed to Artifact Registry' },
      { step: 'Artifact Analysis', detail: 'Vulnerability scan runs automatically on push' },
      { step: 'Org Policy check', detail: 'Continuous compliance evaluation across all projects' },
    ],
    gcp: ['Artifact Registry', 'Artifact Analysis', 'Security Command Center', 'Cloud Build'],
  },
  'llm-audit': {
    title: 'LLM Audit Trail',
    subtitle: 'Phase 2 — Intelligence (Admin)',
    accentColor: '#f59e0b',
    description: 'Complete audit trail for all LLM interactions across the platform — who called what model, with what prompt, at what cost, and what was returned.',
    features: [
      { icon: '◎', label: 'Full prompt/response history', detail: 'Every LLM call logged with full input, output, model version, tokens, and latency. Retained per compliance policy.' },
      { icon: '◈', label: 'User-level attribution', detail: 'All calls attributed to the authenticated Okta user — not just the service account. Enables per-user cost and usage reporting.' },
      { icon: '⬡', label: 'BigQuery analytics', detail: 'All audit data in BigQuery — queryable by user, team, project, date range, model, and cost.' },
      { icon: '⌥', label: 'Anomaly alerting', detail: 'Cloud Monitoring alerts on cost spikes, unusual call volumes, or quality degradation signals.' },
    ],
    architecture: [
      { step: 'LLM call via Kong', detail: 'All calls routed through Kong with user identity attached' },
      { step: 'Langfuse trace', detail: 'Full trace captured — prompt, response, tokens, latency' },
      { step: 'BigQuery export', detail: 'Traces exported and indexed for querying' },
      { step: 'Cloud Monitoring', detail: 'Anomaly detection rules evaluate metrics in real-time' },
      { step: 'Admin dashboard', detail: 'Cost attribution and compliance reports surfaced here' },
    ],
    gcp: ['BigQuery', 'Cloud Monitoring', 'Cloud Logging', 'Langfuse on Cloud Run'],
  },
};

export default function Phase2Preview({ view }: Phase2PreviewProps) {
  const data = DELIVERABLES[view];
  const accent = data.accentColor;

  return (
    <div style={{ flex: 1, background: 'var(--bg-primary)', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '28px 32px 20px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
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
            Coming in Phase 2
          </span>
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '6px' }}>{data.title}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '600px', lineHeight: '1.6' }}>{data.description}</p>
      </div>

      <div style={{ padding: '28px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '1100px' }}>
        {/* Capabilities */}
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '14px' }}>Capabilities</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {data.features.map((f) => (
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

        {/* Architecture flow */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px' }}>Pipeline Flow</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {data.architecture.map((step, i) => (
              <div key={step.step} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: `${accent}15`, border: `1.5px solid ${accent}50`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: '700', color: accent,
                    fontFamily: 'monospace',
                  }}>{i + 1}</div>
                  {i < data.architecture.length - 1 && (
                    <div style={{ width: '1px', height: '20px', background: `${accent}25`, margin: '2px 0' }} />
                  )}
                </div>
                <div style={{ paddingBottom: i < data.architecture.length - 1 ? '0' : '0', paddingTop: '2px', marginBottom: i < data.architecture.length - 1 ? '0' : '0' }}>
                  <div style={{ fontWeight: '600', fontSize: '12px', color: 'var(--text-primary)', marginBottom: '2px' }}>{step.step}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '10px' }}>{step.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GCP services */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px' }}>GCP Services</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.gcp.map((svc) => (
              <div key={svc} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px', background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)', borderRadius: '8px',
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: accent, flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>{svc}</span>
              </div>
            ))}
          </div>

          {/* Tool-agnostic note */}
          <div style={{
            marginTop: '16px', padding: '12px 14px',
            background: 'rgba(159,232,112,0.06)', border: '1px solid rgba(159,232,112,0.20)',
            borderRadius: '8px',
          }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#9FE870', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>Tool-Agnostic Design</div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              All AI provider calls route through Kong. Swap models by changing one environment variable — no pipeline changes required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
