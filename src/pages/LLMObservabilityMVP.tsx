import { useState } from 'react';

type TraceStatus = 'success' | 'anomaly' | 'pii_redacted' | 'error';

interface LLMTrace {
  id: string;
  timestamp: string;
  user: string;
  project: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  costUsd: number;
  status: TraceStatus;
  prompt: string;
  response: string;
  anomalyReason?: string;
  piiFields?: string[];
}

const TRACES: LLMTrace[] = [
  {
    id: 'tr-001',
    timestamp: '2026-04-12 09:47:23',
    user: 'sarah.chen@klaviyo.com',
    project: 'email-campaign-optimizer',
    model: 'gemini-2.0-flash-001',
    promptTokens: 1240,
    completionTokens: 380,
    latencyMs: 1820,
    costUsd: 0.0018,
    status: 'success',
    prompt: 'You are a marketing copy assistant. Given the following customer segment data, generate 3 subject line variants for a re-engagement campaign targeting customers who haven\'t purchased in 90 days.\n\nSegment: High-value, fashion-forward, 25-34 age group\nPrevious open rate: 22%\nBest performing subject: "Your style is waiting"',
    response: '1. "We\'ve been saving something special for you"\n2. "90 days is too long — here\'s what you missed"\n3. "Your curated picks are ready (and they won\'t last)"',
  },
  {
    id: 'tr-002',
    timestamp: '2026-04-12 09:51:07',
    user: 'james.okafor@klaviyo.com',
    project: 'revenue-forecast-bot',
    model: 'gemini-2.0-pro-001',
    promptTokens: 4820,
    completionTokens: 1240,
    latencyMs: 6340,
    costUsd: 0.0412,
    status: 'anomaly',
    anomalyReason: 'Token count 4.2× above 30-day baseline (avg: 1,148 tokens). Possible prompt injection or runaway context.',
    prompt: 'Analyze the following Q1 revenue data and provide a forecast for Q2 with confidence intervals. Include breakdown by channel (email, SMS, push).\n\n[LARGE DATA PAYLOAD — 4,200 tokens of CSV data]',
    response: 'Based on Q1 performance:\n\n**Q2 Forecast (90% CI):**\n- Email: $2.4M–$2.8M (+12% YoY)\n- SMS: $890K–$1.1M (+34% YoY)\n- Push: $340K–$420K (+8% YoY)\n\n**Total Q2 Projection: $3.63M–$4.32M**\n\nKey drivers: SMS channel showing strongest growth momentum...',
  },
  {
    id: 'tr-003',
    timestamp: '2026-04-12 10:02:44',
    user: 'priya.sharma@klaviyo.com',
    project: 'churn-predictor',
    model: 'gemini-2.0-flash-001',
    promptTokens: 890,
    completionTokens: 210,
    latencyMs: 1340,
    costUsd: 0.0011,
    status: 'pii_redacted',
    piiFields: ['customer_email', 'customer_name', 'phone_number'],
    prompt: 'Classify the following customer as churn risk (high/medium/low) based on their activity:\n\nCustomer: [REDACTED — email]\nName: [REDACTED — name]\nLast purchase: 47 days ago\nLifetime value: $1,240\nEmail opens (last 30d): 0\nSMS clicks (last 30d): 1',
    response: 'Churn Risk: **HIGH**\n\nRationale:\n- 47-day purchase gap exceeds 30-day median for this segment\n- Zero email engagement in 30 days is a strong churn signal\n- LTV of $1,240 makes this a high-priority save candidate\n\nRecommended action: Trigger win-back flow with 15% discount offer.',
  },
  {
    id: 'tr-004',
    timestamp: '2026-04-12 10:15:18',
    user: 'tom.rivera@klaviyo.com',
    project: 'revenue-forecast-bot',
    model: 'gemini-2.0-flash-001',
    promptTokens: 620,
    completionTokens: 180,
    latencyMs: 980,
    costUsd: 0.0008,
    status: 'success',
    prompt: 'Summarize the key revenue trends from the attached weekly report in 3 bullet points for executive review.',
    response: '• Email revenue up 18% WoW, driven by re-engagement campaign launched Monday\n• SMS conversion rate hit 4.2% — highest in 6 months\n• Cart abandonment recovery flow generated $42K this week (+$8K vs prior week)',
  },
  {
    id: 'tr-005',
    timestamp: '2026-04-12 10:28:55',
    user: 'sarah.chen@klaviyo.com',
    project: 'email-campaign-optimizer',
    model: 'gemini-2.0-flash-001',
    promptTokens: 340,
    completionTokens: 0,
    latencyMs: 4200,
    costUsd: 0,
    status: 'error',
    anomalyReason: 'Request timed out after 4.2s. Vertex AI endpoint returned 503. Auto-retry queued.',
    prompt: 'Generate A/B test variants for the following email subject line: "Summer sale — up to 40% off"',
    response: '[No response — request failed]',
  },
];

const STATUS_CONFIG: Record<TraceStatus, { label: string; color: string; bg: string; icon: string }> = {
  success:      { label: 'Success',      color: '#9FE870', bg: 'rgba(159,232,112,0.08)', icon: '✓' },
  anomaly:      { label: 'Anomaly',      color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  icon: '⚠' },
  pii_redacted: { label: 'PII Redacted', color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', icon: '⊘' },
  error:        { label: 'Error',        color: '#ff4444', bg: 'rgba(255,68,68,0.08)',   icon: '⊗' },
};

export default function LLMObservabilityMVP() {
  const [selectedTrace, setSelectedTrace] = useState<LLMTrace | null>(TRACES[0]);
  const [filterStatus, setFilterStatus] = useState<TraceStatus | 'all'>('all');

  const filtered = filterStatus === 'all' ? TRACES : TRACES.filter(t => t.status === filterStatus);

  const totalCost = TRACES.reduce((s, t) => s + t.costUsd, 0);
  const totalTokens = TRACES.reduce((s, t) => s + t.promptTokens + t.completionTokens, 0);
  const avgLatency = Math.round(TRACES.reduce((s, t) => s + t.latencyMs, 0) / TRACES.length);
  const anomalyCount = TRACES.filter(t => t.status === 'anomaly' || t.status === 'error').length;

  return (
    <div style={{ flex: 1, padding: '32px', overflowY: 'auto', background: 'var(--bg-primary)' }}>
      <div style={{ maxWidth: '1100px' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.10em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '4px', background: 'rgba(159,232,112,0.12)', border: '1px solid rgba(159,232,112,0.30)', color: '#3a7a1a' }}>Phase 2 — Intelligence</span>
            <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '4px', background: 'rgba(96,165,250,0.10)', border: '1px solid rgba(96,165,250,0.25)', color: '#60a5fa' }}>MVP Prototype</span>
          </div>
          <h1 style={{ color: 'var(--text-primary)', fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '6px' }}>LLM Observability</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Every prompt, response, token count, latency, and cost captured per automation and per user. Powered by Cloud Logging + BigQuery on GCP.</p>
        </div>

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Total Traces (today)', value: TRACES.length.toString(), sub: '+12% vs yesterday', color: '#9FE870' },
            { label: 'Total Tokens', value: totalTokens.toLocaleString(), sub: 'across all projects', color: '#60a5fa' },
            { label: 'Avg Latency', value: `${avgLatency}ms`, sub: 'p50 across models', color: '#a78bfa' },
            { label: 'Anomalies', value: anomalyCount.toString(), sub: 'require review', color: anomalyCount > 0 ? '#f59e0b' : '#9FE870' },
          ].map(k => (
            <div key={k.label} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px 18px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{k.label}</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: k.color, marginBottom: '2px' }}>{k.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Cost attribution bar */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px 20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cost Attribution by Project (today)</span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#9FE870' }}>${totalCost.toFixed(4)} total</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {[
              { project: 'revenue-forecast-bot', cost: 0.0412, color: '#60a5fa' },
              { project: 'email-campaign-optimizer', cost: 0.0026, color: '#9FE870' },
              { project: 'churn-predictor', cost: 0.0011, color: '#a78bfa' },
            ].map(p => {
              const pct = Math.round((p.cost / totalCost) * 100);
              return (
                <div key={p.project} style={{ flex: pct, minWidth: '40px' }}>
                  <div style={{ height: '8px', background: p.color, borderRadius: '4px', marginBottom: '4px', opacity: 0.8 }} />
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.project}</div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: p.color }}>${p.cost.toFixed(4)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter row */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {(['all', 'success', 'anomaly', 'pii_redacted', 'error'] as const).map(s => {
            const cfg = s === 'all' ? null : STATUS_CONFIG[s];
            const count = s === 'all' ? TRACES.length : TRACES.filter(t => t.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                style={{
                  padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                  background: filterStatus === s ? (cfg?.bg || 'rgba(255,255,255,0.10)') : 'transparent',
                  border: `1px solid ${filterStatus === s ? (cfg?.color + '50' || 'rgba(255,255,255,0.25)') : 'rgba(255,255,255,0.12)'}`,
                  color: filterStatus === s ? (cfg?.color || '#fff') : 'var(--text-muted)',
                }}
              >
                {s === 'all' ? `All (${count})` : `${STATUS_CONFIG[s].label} (${count})`}
              </button>
            );
          })}
        </div>

        {/* Two-panel: trace list + detail */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '16px', alignItems: 'start' }}>
          {/* Trace list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filtered.map(t => {
              const cfg = STATUS_CONFIG[t.status];
              const isSelected = selectedTrace?.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTrace(t)}
                  style={{
                    textAlign: 'left', padding: '12px 14px', borderRadius: '8px', cursor: 'pointer',
                    background: isSelected ? cfg.bg : 'var(--bg-secondary)',
                    border: `1px solid ${isSelected ? cfg.color + '40' : 'var(--border-color)'}`,
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: cfg.color }}>{cfg.icon} {cfg.label}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{t.id}</span>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{t.timestamp.split(' ')[1]}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '500', marginBottom: '4px' }}>{t.project}</div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>{t.user.split('@')[0]}</span>
                    <span>{t.model.replace('gemini-2.0-flash-001', 'Gemini 2.0 Flash').replace('gemini-2.0-pro-001', 'Gemini 2.0 Pro')}</span>
                    <span>{(t.promptTokens + t.completionTokens).toLocaleString()} tok</span>
                    <span>{t.latencyMs}ms</span>
                    <span>${t.costUsd.toFixed(4)}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Trace detail */}
          <div style={{ position: 'sticky', top: '20px' }}>
            {selectedTrace ? (
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                {/* Trace header */}
                <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: STATUS_CONFIG[selectedTrace.status].color }}>{STATUS_CONFIG[selectedTrace.status].icon} {STATUS_CONFIG[selectedTrace.status].label}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{selectedTrace.id}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                    {[
                      ['Project', selectedTrace.project],
                      ['User', selectedTrace.user],
                      ['Model', selectedTrace.model],
                      ['Timestamp', selectedTrace.timestamp],
                      ['Prompt tokens', selectedTrace.promptTokens.toLocaleString()],
                      ['Completion tokens', selectedTrace.completionTokens.toLocaleString()],
                      ['Latency', `${selectedTrace.latencyMs}ms`],
                      ['Cost', `$${selectedTrace.costUsd.toFixed(4)}`],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '1px' }}>{k}</div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Anomaly / PII alert */}
                {(selectedTrace.anomalyReason || selectedTrace.piiFields) && (
                  <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border-color)', background: selectedTrace.status === 'anomaly' || selectedTrace.status === 'error' ? 'rgba(245,158,11,0.06)' : 'rgba(167,139,250,0.06)' }}>
                    {selectedTrace.anomalyReason && (
                      <p style={{ fontSize: '12px', color: selectedTrace.status === 'error' ? '#ff4444' : '#f59e0b', margin: 0, lineHeight: '1.5' }}>⚠ {selectedTrace.anomalyReason}</p>
                    )}
                    {selectedTrace.piiFields && (
                      <p style={{ fontSize: '12px', color: '#a78bfa', margin: 0, lineHeight: '1.5' }}>⊘ PII fields redacted before sending to model: <strong>{selectedTrace.piiFields.join(', ')}</strong></p>
                    )}
                  </div>
                )}

                {/* Prompt */}
                <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Prompt</div>
                  <div style={{ background: 'var(--bg-primary)', borderRadius: '6px', padding: '10px 12px', fontSize: '12px', color: 'rgba(255,255,255,0.70)', lineHeight: '1.6', maxHeight: '120px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>{selectedTrace.prompt}</div>
                </div>

                {/* Response */}
                <div style={{ padding: '14px 18px' }}>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Response</div>
                  <div style={{ background: 'var(--bg-primary)', borderRadius: '6px', padding: '10px 12px', fontSize: '12px', color: '#9FE870', lineHeight: '1.6', maxHeight: '120px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>{selectedTrace.response}</div>
                </div>
              </div>
            ) : (
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '40px 20px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Select a trace to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
