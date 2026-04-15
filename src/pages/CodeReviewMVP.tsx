import { useState } from 'react';

type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
type PolicyResult = 'blocked' | 'warned' | 'passed';

interface Finding {
  id: string;
  severity: Severity;
  rule: string;
  file: string;
  line: number;
  message: string;
  suggestion: string;
  pii?: boolean;
}

interface ReviewResult {
  prNumber: string;
  prTitle: string;
  repo: string;
  author: string;
  model: string;
  provider: string;
  duration: number;
  tokens: number;
  findings: Finding[];
  policyResult: PolicyResult;
  policyReason?: string;
}

const MOCK_FINDINGS: Finding[] = [
  {
    id: 'f1',
    severity: 'critical',
    rule: 'PII-001',
    file: 'src/services/emailService.ts',
    line: 47,
    message: 'Email address concatenated directly into SQL query — SQL injection risk.',
    suggestion: 'Use parameterized queries: db.query("SELECT * FROM users WHERE email = $1", [email])',
    pii: true,
  },
  {
    id: 'f2',
    severity: 'high',
    rule: 'SEC-012',
    file: 'src/api/klaviyoClient.ts',
    line: 23,
    message: 'API key hardcoded in source file. Will be exposed in version control.',
    suggestion: 'Move to Secret Manager: secretManagerServiceClient.accessSecretVersion({ name: "projects/.../secrets/klaviyo-api-key/versions/latest" })',
  },
  {
    id: 'f3',
    severity: 'high',
    rule: 'PII-003',
    file: 'src/services/emailService.ts',
    line: 112,
    message: 'Customer email addresses logged to Cloud Logging without redaction.',
    suggestion: 'Redact PII before logging: logger.info({ event: "email_sent", recipient: redactEmail(email) })',
    pii: true,
  },
  {
    id: 'f4',
    severity: 'medium',
    rule: 'PERF-007',
    file: 'src/jobs/campaignProcessor.ts',
    line: 88,
    message: 'N+1 query pattern detected — fetching contacts in a loop.',
    suggestion: 'Batch the query: const contacts = await db.query("SELECT * FROM contacts WHERE id = ANY($1)", [ids])',
  },
  {
    id: 'f5',
    severity: 'low',
    rule: 'STYLE-002',
    file: 'src/utils/formatters.ts',
    line: 14,
    message: 'Function exceeds 50-line complexity threshold (68 lines).',
    suggestion: 'Extract helper functions to reduce cognitive complexity.',
  },
  {
    id: 'f6',
    severity: 'info',
    rule: 'COST-001',
    file: 'src/jobs/campaignProcessor.ts',
    line: 201,
    message: 'Gemini 2.0 Pro called in a loop — consider batching or switching to Flash for this use case.',
    suggestion: 'Use Gemini 2.0 Flash for classification tasks: model = "gemini-2.0-flash-001"',
  },
];

const MOCK_REVIEW: ReviewResult = {
  prNumber: 'PR #247',
  prTitle: 'feat: add email campaign automation with Gemini personalization',
  repo: 'klaviyo/citizen-automations',
  author: 'sarah.chen@klaviyo.com',
  model: 'gemini-2.0-flash-001',
  provider: 'Vertex AI (GCP)',
  duration: 4.2,
  tokens: 8340,
  findings: MOCK_FINDINGS,
  policyResult: 'blocked',
  policyReason: '2 critical/high PII findings detected. OPA policy requires remediation before merge.',
};

const SEVERITY_CONFIG: Record<Severity, { label: string; color: string; bg: string; border: string }> = {
  critical: { label: 'CRITICAL', color: '#ff4444', bg: 'rgba(255,68,68,0.08)', border: 'rgba(255,68,68,0.25)' },
  high:     { label: 'HIGH',     color: '#FF6B35', bg: 'rgba(255,107,53,0.08)', border: 'rgba(255,107,53,0.25)' },
  medium:   { label: 'MEDIUM',   color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
  low:      { label: 'LOW',      color: '#9FE870', bg: 'rgba(159,232,112,0.08)', border: 'rgba(159,232,112,0.25)' },
  info:     { label: 'INFO',     color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.25)' },
};

const POLICY_CONFIG: Record<PolicyResult, { label: string; color: string; bg: string; icon: string }> = {
  blocked: { label: 'BLOCKED — Merge prevented by OPA policy', color: '#ff4444', bg: 'rgba(255,68,68,0.08)', icon: '⊗' },
  warned:  { label: 'WARNING — Review required before merge',  color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', icon: '⚠' },
  passed:  { label: 'PASSED — All policy checks green',        color: '#9FE870', bg: 'rgba(159,232,112,0.08)', icon: '✓' },
};

type Step = 'form' | 'reviewing' | 'results';

export default function CodeReviewMVP() {
  const [step, setStep] = useState<Step>('form');
  const [prUrl, setPrUrl] = useState('https://github.com/klaviyo/citizen-automations/pull/247');
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [progress, setProgress] = useState(0);
  const [filterSeverity, setFilterSeverity] = useState<Severity | 'all'>('all');

  const startReview = () => {
    setStep('reviewing');
    setProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 18 + 4;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => setStep('results'), 400);
      }
      setProgress(Math.min(p, 100));
    }, 220);
  };

  const reset = () => {
    setStep('form');
    setSelectedFinding(null);
    setProgress(0);
    setFilterSeverity('all');
  };

  const filteredFindings = filterSeverity === 'all'
    ? MOCK_REVIEW.findings
    : MOCK_REVIEW.findings.filter(f => f.severity === filterSeverity);

  const counts = MOCK_REVIEW.findings.reduce((acc, f) => {
    acc[f.severity] = (acc[f.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const policy = POLICY_CONFIG[MOCK_REVIEW.policyResult];

  return (
    <div style={{ flex: 1, padding: '32px', overflowY: 'auto', background: 'var(--bg-primary)' }}>
      <div style={{ maxWidth: '1000px' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.10em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '4px', background: 'rgba(159,232,112,0.12)', border: '1px solid rgba(159,232,112,0.30)', color: '#3a7a1a' }}>Phase 2 — Intelligence</span>
            <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '4px', background: 'rgba(96,165,250,0.10)', border: '1px solid rgba(96,165,250,0.25)', color: '#60a5fa' }}>MVP Prototype</span>
          </div>
          <h1 style={{ color: 'var(--text-primary)', fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '6px' }}>Code Review Automation</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>Every pull request reviewed by AI via Klaviyo's existing Kong instance before deployment. Provider-agnostic — swap models by changing one environment variable.</p>
        </div>

        {/* Pipeline badge row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '28px', flexWrap: 'wrap' }}>
          {['GitHub Actions', '→', 'Klaviyo Kong Workspace', '→', 'Gemini Code Assist', '→', 'OPA Policy', '→', 'BigQuery Audit'].map((s, i) => (
            s === '→'
              ? <span key={i} style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>→</span>
              : <span key={i} style={{ fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.60)' }}>{s}</span>
          ))}
        </div>

        {/* STEP 1: Form */}
        {step === 'form' && (
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '28px', maxWidth: '600px' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Submit Pull Request for Review</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>GitHub PR URL</label>
              <input
                value={prUrl}
                onChange={e => setPrUrl(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI Provider</label>
                <select style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px' }}>
                  <option>Vertex AI (Gemini 2.0 Flash)</option>
                  <option>Vertex AI (Gemini 2.0 Pro)</option>
                  <option>OpenAI (GPT-4o) — via Kong</option>
                  <option>Anthropic (Claude 3.5) — via Kong</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>OPA Policy Set</label>
                <select style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px' }}>
                  <option>klaviyo-standard (PII + SEC + PERF)</option>
                  <option>klaviyo-strict (all rules)</option>
                  <option>klaviyo-lite (SEC only)</option>
                </select>
              </div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(159,232,112,0.06)', border: '1px solid rgba(159,232,112,0.15)', borderRadius: '6px', marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', color: 'rgba(159,232,112,0.80)', margin: 0, lineHeight: '1.5' }}>
                <strong>Tool-agnostic design:</strong> All AI provider calls route through your app's dedicated Kong Workspace in Klaviyo's existing Kong instance. Swap models by changing the <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 5px', borderRadius: '3px' }}>AI_REVIEW_PROVIDER</code> env variable — no pipeline changes required.
              </p>
            </div>
            <button
              onClick={startReview}
              style={{ padding: '11px 24px', background: '#9FE870', border: 'none', borderRadius: '6px', color: '#0a0a0a', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
            >
              Run AI Review →
            </button>
          </div>
        )}

        {/* STEP 2: Reviewing */}
        {step === 'reviewing' && (
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '40px 28px', maxWidth: '600px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>⌥</div>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Reviewing PR #247</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '28px' }}>Gemini 2.0 Flash analyzing diff via Klaviyo Kong Workspace…</p>
            <div style={{ background: 'var(--bg-primary)', borderRadius: '6px', height: '6px', overflow: 'hidden', marginBottom: '12px' }}>
              <div style={{ height: '100%', background: '#9FE870', width: `${progress}%`, transition: 'width 0.2s ease', borderRadius: '6px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
              {['Fetching diff', 'Routing via Kong Workspace', 'AI analysis', 'OPA evaluation', 'Writing to BigQuery'].map((s, i) => (
                <span key={i} style={{ color: progress > i * 20 ? '#9FE870' : 'var(--text-muted)' }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Results */}
        {step === 'results' && (
          <div>
            {/* PR meta bar */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#9FE870' }}>{MOCK_REVIEW.prNumber}</span>
                  <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '600' }}>{MOCK_REVIEW.prTitle}</span>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span>📁 {MOCK_REVIEW.repo}</span>
                  <span>👤 {MOCK_REVIEW.author}</span>
                  <span>🤖 {MOCK_REVIEW.model}</span>
                  <span>⏱ {MOCK_REVIEW.duration}s</span>
                  <span>🔤 {MOCK_REVIEW.tokens.toLocaleString()} tokens</span>
                </div>
              </div>
              <button onClick={reset} style={{ padding: '7px 14px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer' }}>← New Review</button>
            </div>

            {/* OPA Policy result */}
            <div style={{ background: policy.bg, border: `1px solid ${POLICY_CONFIG[MOCK_REVIEW.policyResult].color}40`, borderRadius: '10px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '22px', color: policy.color }}>{policy.icon}</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: policy.color, marginBottom: '2px' }}>{policy.label}</div>
                {MOCK_REVIEW.policyReason && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{MOCK_REVIEW.policyReason}</div>}
              </div>
            </div>

            {/* Summary chips */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {(['all', 'critical', 'high', 'medium', 'low', 'info'] as const).map(s => {
                const count = s === 'all' ? MOCK_REVIEW.findings.length : (counts[s] || 0);
                const cfg = s === 'all' ? null : SEVERITY_CONFIG[s];
                return (
                  <button
                    key={s}
                    onClick={() => setFilterSeverity(s)}
                    style={{
                      padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                      background: filterSeverity === s ? (cfg?.bg || 'rgba(255,255,255,0.10)') : 'transparent',
                      border: `1px solid ${filterSeverity === s ? (cfg?.border || 'rgba(255,255,255,0.25)') : 'rgba(255,255,255,0.12)'}`,
                      color: filterSeverity === s ? (cfg?.color || '#fff') : 'var(--text-muted)',
                    }}
                  >
                    {s === 'all' ? `All (${count})` : `${SEVERITY_CONFIG[s].label} (${count})`}
                  </button>
                );
              })}
            </div>

            {/* Two-panel: findings list + detail */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'start' }}>
              {/* Findings list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredFindings.map(f => {
                  const cfg = SEVERITY_CONFIG[f.severity];
                  const isSelected = selectedFinding?.id === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFinding(isSelected ? null : f)}
                      style={{
                        textAlign: 'left', padding: '14px 16px', borderRadius: '8px', cursor: 'pointer',
                        background: isSelected ? cfg.bg : 'var(--bg-secondary)',
                        border: `1px solid ${isSelected ? cfg.border : 'var(--border-color)'}`,
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: '3px', background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, letterSpacing: '0.06em' }}>{cfg.label}</span>
                        {f.pii && <span style={{ fontSize: '9px', fontWeight: '700', padding: '2px 6px', borderRadius: '3px', background: 'rgba(167,139,250,0.10)', border: '1px solid rgba(167,139,250,0.25)', color: '#a78bfa', letterSpacing: '0.06em' }}>PII</span>}
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{f.rule}</span>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500', marginBottom: '3px', lineHeight: '1.4' }}>{f.message}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{f.file}:{f.line}</div>
                    </button>
                  );
                })}
              </div>

              {/* Detail panel */}
              <div style={{ position: 'sticky', top: '20px' }}>
                {selectedFinding ? (
                  <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                      <span style={{ fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: '3px', background: SEVERITY_CONFIG[selectedFinding.severity].bg, border: `1px solid ${SEVERITY_CONFIG[selectedFinding.severity].border}`, color: SEVERITY_CONFIG[selectedFinding.severity].color, letterSpacing: '0.06em' }}>{SEVERITY_CONFIG[selectedFinding.severity].label}</span>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{selectedFinding.rule}</span>
                    </div>
                    <h3 style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '700', marginBottom: '8px', lineHeight: '1.4' }}>{selectedFinding.message}</h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '16px' }}>{selectedFinding.file} — Line {selectedFinding.line}</div>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Suggested Fix</div>
                      <div style={{ background: 'var(--bg-primary)', borderRadius: '6px', padding: '12px', fontFamily: 'monospace', fontSize: '12px', color: '#9FE870', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{selectedFinding.suggestion}</div>
                    </div>
                    {selectedFinding.pii && (
                      <div style={{ padding: '10px 12px', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.20)', borderRadius: '6px', fontSize: '12px', color: '#a78bfa' }}>
                        ⚠ PII detected — this finding must be resolved before merge per Klaviyo data policy.
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '40px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', marginBottom: '12px', opacity: 0.3 }}>◈</div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Select a finding to see details and suggested fix</p>
                  </div>
                )}

                {/* Audit trail note */}
                <div style={{ marginTop: '12px', padding: '12px 14px', background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#60a5fa', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>BigQuery Audit Trail</div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>All findings, tokens, latency, and policy decisions written to <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 4px', borderRadius: '3px' }}>klaviyo_platform.code_reviews</code> — queryable by user, date, repo, and model.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
