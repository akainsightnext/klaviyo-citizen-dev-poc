import { useState } from 'react';

interface PolicyRule {
  id: string;
  name: string;
  category: 'pii' | 'security' | 'cost' | 'compliance';
  description: string;
  action: 'block' | 'warn' | 'redact' | 'log';
  enabled: boolean;
  triggeredToday: number;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  project: string;
  event: string;
  outcome: 'blocked' | 'redacted' | 'warned' | 'passed';
  details: string;
}

const INITIAL_RULES: PolicyRule[] = [
  { id: 'r1', name: 'PII — Email Address Detection', category: 'pii', description: 'Detect and redact email addresses from LLM inputs before sending to model.', action: 'redact', enabled: true, triggeredToday: 3 },
  { id: 'r2', name: 'PII — Phone Number Detection', category: 'pii', description: 'Detect and redact phone numbers from LLM inputs.', action: 'redact', enabled: true, triggeredToday: 1 },
  { id: 'r3', name: 'PII — Full Name Detection', category: 'pii', description: 'Detect and redact customer full names from LLM inputs.', action: 'redact', enabled: true, triggeredToday: 3 },
  { id: 'r4', name: 'SEC — Hardcoded Secret Detection', category: 'security', description: 'Block PRs containing API keys, tokens, or passwords in source code.', action: 'block', enabled: true, triggeredToday: 1 },
  { id: 'r5', name: 'SEC — SQL Injection Pattern', category: 'security', description: 'Block PRs with unsanitized SQL string concatenation.', action: 'block', enabled: true, triggeredToday: 1 },
  { id: 'r6', name: 'COST — Token Spike Alert', category: 'cost', description: 'Alert when a single request exceeds 3× the 30-day average token count.', action: 'warn', enabled: true, triggeredToday: 1 },
  { id: 'r7', name: 'COST — Daily Spend Cap', category: 'cost', description: 'Block new LLM requests when project daily spend exceeds $50.', action: 'block', enabled: false, triggeredToday: 0 },
  { id: 'r8', name: 'COMPLIANCE — Gong Audio Policy', category: 'compliance', description: 'Restrict automations processing Gong recordings to read-only actions.', action: 'block', enabled: true, triggeredToday: 0 },
];

const AUDIT_LOG: AuditEntry[] = [
  { id: 'a1', timestamp: '10:28:55', user: 'sarah.chen', project: 'email-campaign-optimizer', event: 'LLM request — timeout', outcome: 'warned', details: 'Vertex AI 503 — auto-retry queued' },
  { id: 'a2', timestamp: '10:15:18', user: 'tom.rivera', project: 'revenue-forecast-bot', event: 'LLM request', outcome: 'passed', details: 'All policy checks passed' },
  { id: 'a3', timestamp: '10:02:44', user: 'priya.sharma', project: 'churn-predictor', event: 'PII detected in prompt', outcome: 'redacted', details: 'email, name, phone redacted before model call' },
  { id: 'a4', timestamp: '09:51:07', user: 'james.okafor', project: 'revenue-forecast-bot', event: 'Token spike anomaly', outcome: 'warned', details: '4,820 tokens — 4.2× above baseline' },
  { id: 'a5', timestamp: '09:47:23', user: 'sarah.chen', project: 'email-campaign-optimizer', event: 'LLM request', outcome: 'passed', details: 'All policy checks passed' },
  { id: 'a6', timestamp: '09:31:12', user: 'sarah.chen', project: 'email-campaign-optimizer', event: 'PR #247 — code review', outcome: 'blocked', details: '2 critical PII findings — merge prevented' },
  { id: 'a7', timestamp: '09:28:44', user: 'james.okafor', project: 'revenue-forecast-bot', event: 'PR #246 — code review', outcome: 'blocked', details: 'Hardcoded API key detected in klaviyoClient.ts' },
];

const CATEGORY_CONFIG = {
  pii:        { label: 'PII', color: '#a78bfa', bg: 'rgba(167,139,250,0.10)' },
  security:   { label: 'Security', color: '#ff4444', bg: 'rgba(255,68,68,0.10)' },
  cost:       { label: 'Cost', color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
  compliance: { label: 'Compliance', color: '#60a5fa', bg: 'rgba(96,165,250,0.10)' },
};

const ACTION_CONFIG = {
  block:  { label: 'Block', color: '#ff4444' },
  warn:   { label: 'Warn',  color: '#f59e0b' },
  redact: { label: 'Redact', color: '#a78bfa' },
  log:    { label: 'Log',   color: '#60a5fa' },
};

const OUTCOME_CONFIG = {
  blocked:  { color: '#ff4444', icon: '⊗' },
  redacted: { color: '#a78bfa', icon: '⊘' },
  warned:   { color: '#f59e0b', icon: '⚠' },
  passed:   { color: '#9FE870', icon: '✓' },
};

export default function SecurityControlsMVP() {
  const [rules, setRules] = useState<PolicyRule[]>(INITIAL_RULES);
  const [activeTab, setActiveTab] = useState<'policies' | 'audit'>('policies');
  const [filterCat, setFilterCat] = useState<'all' | 'pii' | 'security' | 'cost' | 'compliance'>('all');

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const filteredRules = filterCat === 'all' ? rules : rules.filter(r => r.category === filterCat);
  const activeCount = rules.filter(r => r.enabled).length;
  const triggeredToday = rules.reduce((s, r) => s + r.triggeredToday, 0);

  return (
    <div style={{ flex: 1, padding: '32px', overflowY: 'auto', background: 'var(--bg-primary)' }}>
      <div style={{ maxWidth: '1000px' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.10em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '4px', background: 'rgba(159,232,112,0.12)', border: '1px solid rgba(159,232,112,0.30)', color: '#3a7a1a' }}>Phase 2 — Intelligence</span>
            <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '4px', background: 'rgba(96,165,250,0.10)', border: '1px solid rgba(96,165,250,0.25)', color: '#60a5fa' }}>Admin — MVP Prototype</span>
          </div>
          <h1 style={{ color: 'var(--text-primary)', fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '6px' }}>Security Controls</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Kong AI Plugin policy rules enforced across all citizen developer automations. Toggle rules, view triggers, and review the full audit trail.</p>
        </div>

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Active Policies', value: `${activeCount}/${rules.length}`, color: '#9FE870' },
            { label: 'Triggered Today', value: triggeredToday.toString(), color: '#f59e0b' },
            { label: 'Blocks Today', value: '2', color: '#ff4444' },
            { label: 'Redactions Today', value: '3', color: '#a78bfa' },
          ].map(k => (
            <div key={k.label} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px 18px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{k.label}</div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '0' }}>
          {(['policies', 'audit'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 18px', background: 'transparent', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: '600',
                color: activeTab === tab ? '#9FE870' : 'var(--text-muted)',
                borderBottom: `2px solid ${activeTab === tab ? '#9FE870' : 'transparent'}`,
                marginBottom: '-1px',
              }}
            >
              {tab === 'policies' ? 'Policy Rules' : 'Audit Log'}
            </button>
          ))}
        </div>

        {/* Policy Rules tab */}
        {activeTab === 'policies' && (
          <>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {(['all', 'pii', 'security', 'cost', 'compliance'] as const).map(cat => {
                const cfg = cat === 'all' ? null : CATEGORY_CONFIG[cat];
                const count = cat === 'all' ? rules.length : rules.filter(r => r.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setFilterCat(cat)}
                    style={{
                      padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                      background: filterCat === cat ? (cfg?.bg || 'rgba(255,255,255,0.10)') : 'transparent',
                      border: `1px solid ${filterCat === cat ? (cfg?.color + '50' || 'rgba(255,255,255,0.25)') : 'rgba(255,255,255,0.12)'}`,
                      color: filterCat === cat ? (cfg?.color || '#fff') : 'var(--text-muted)',
                    }}
                  >
                    {cat === 'all' ? `All (${count})` : `${CATEGORY_CONFIG[cat].label} (${count})`}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredRules.map(rule => {
                const catCfg = CATEGORY_CONFIG[rule.category];
                const actCfg = ACTION_CONFIG[rule.action];
                return (
                  <div key={rule.id} style={{ background: 'var(--bg-secondary)', border: `1px solid ${rule.enabled ? 'var(--border-color)' : 'rgba(255,255,255,0.05)'}`, borderRadius: '10px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '16px', opacity: rule.enabled ? 1 : 0.5 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: '3px', background: catCfg.bg, color: catCfg.color, letterSpacing: '0.06em' }}>{catCfg.label}</span>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{rule.name}</span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 6px', lineHeight: '1.4' }}>{rule.description}</p>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
                        <span>Action: <strong style={{ color: actCfg.color }}>{actCfg.label}</strong></span>
                        {rule.triggeredToday > 0 && <span style={{ color: '#f59e0b' }}>⚡ Triggered {rule.triggeredToday}× today</span>}
                      </div>
                    </div>
                    {/* Toggle */}
                    <button
                      onClick={() => toggleRule(rule.id)}
                      style={{
                        width: '40px', height: '22px', borderRadius: '11px', border: 'none', cursor: 'pointer', flexShrink: 0,
                        background: rule.enabled ? '#9FE870' : 'rgba(255,255,255,0.15)',
                        position: 'relative', transition: 'background 0.2s',
                      }}
                    >
                      <span style={{
                        position: 'absolute', top: '3px', width: '16px', height: '16px', borderRadius: '50%',
                        background: rule.enabled ? '#0a0a0a' : 'rgba(255,255,255,0.6)',
                        left: rule.enabled ? '21px' : '3px', transition: 'left 0.2s',
                      }} />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Audit Log tab */}
        {activeTab === 'audit' && (
          <div>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 120px 160px 1fr 90px', gap: '0', padding: '10px 16px', borderBottom: '1px solid var(--border-color)', fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <span>Time</span><span>User</span><span>Project</span><span>Event</span><span>Outcome</span>
              </div>
              {AUDIT_LOG.map((entry, i) => {
                const outcfg = OUTCOME_CONFIG[entry.outcome];
                return (
                  <div key={entry.id} style={{ display: 'grid', gridTemplateColumns: '80px 120px 160px 1fr 90px', gap: '0', padding: '12px 16px', borderBottom: i < AUDIT_LOG.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', alignItems: 'start' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{entry.timestamp}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{entry.user}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{entry.project}</span>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--text-primary)', marginBottom: '2px' }}>{entry.event}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{entry.details}</div>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: outcfg.color }}>{outcfg.icon} {entry.outcome}</span>
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px' }}>Full audit trail stored in BigQuery — queryable by user, project, date, and outcome. Retained per Klaviyo data retention policy.</p>
          </div>
        )}
      </div>
    </div>
  );
}
