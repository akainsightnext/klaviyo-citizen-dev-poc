import { useState } from 'react';

interface ProjectMetric {
  project: string;
  owner: string;
  team: string;
  activeEnvs: number;
  llmCallsToday: number;
  tokensToday: number;
  costToday: number;
  costMtd: number;
  costBudget: number;
  deployments: number;
  status: 'healthy' | 'over_budget' | 'anomaly';
}

interface WeeklyPoint {
  day: string;
  cost: number;
  calls: number;
}

const PROJECTS: ProjectMetric[] = [
  { project: 'email-campaign-optimizer', owner: 'sarah.chen', team: 'Marketing Ops', activeEnvs: 4, llmCallsToday: 847, tokensToday: 124_300, costToday: 0.89, costMtd: 18.40, costBudget: 50, deployments: 12, status: 'healthy' },
  { project: 'revenue-forecast-bot',     owner: 'james.okafor', team: 'Revenue Ops', activeEnvs: 3, llmCallsToday: 312, tokensToday: 98_200, costToday: 1.24, costMtd: 31.20, costBudget: 40, anomaly: true, deployments: 7, status: 'anomaly' } as ProjectMetric,
  { project: 'churn-predictor',          owner: 'priya.sharma', team: 'Data Science', activeEnvs: 3, llmCallsToday: 228, tokensToday: 41_400, costToday: 0.32, costMtd: 8.10, costBudget: 30, deployments: 5, status: 'healthy' },
];

const WEEKLY: WeeklyPoint[] = [
  { day: 'Mon', cost: 1.82, calls: 1120 },
  { day: 'Tue', cost: 2.14, calls: 1340 },
  { day: 'Wed', cost: 1.97, calls: 1210 },
  { day: 'Thu', cost: 2.45, calls: 1580 },
  { day: 'Fri', cost: 2.45, calls: 1387 },
];

const STATUS_CONFIG = {
  healthy:     { label: 'Healthy',      color: '#9FE870', icon: '●' },
  over_budget: { label: 'Over Budget',  color: '#ff4444', icon: '⊗' },
  anomaly:     { label: 'Anomaly',      color: '#f59e0b', icon: '⚠' },
};

const maxCost = Math.max(...WEEKLY.map(w => w.cost));
const maxCalls = Math.max(...WEEKLY.map(w => w.calls));

export default function PlatformAnalyticsMVP() {
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'roi'>('overview');

  const totalCostToday = PROJECTS.reduce((s, p) => s + p.costToday, 0);
  const totalCallsToday = PROJECTS.reduce((s, p) => s + p.llmCallsToday, 0);
  const totalTokensToday = PROJECTS.reduce((s, p) => s + p.tokensToday, 0);
  const totalMtd = PROJECTS.reduce((s, p) => s + p.costMtd, 0);

  return (
    <div style={{ flex: 1, padding: '32px', overflowY: 'auto', background: 'var(--bg-primary)' }}>
      <div style={{ maxWidth: '1100px' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.10em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '4px', background: 'rgba(159,232,112,0.12)', border: '1px solid rgba(159,232,112,0.30)', color: '#3a7a1a' }}>Phase 3 — Scale</span>
            <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '4px', background: 'rgba(96,165,250,0.10)', border: '1px solid rgba(96,165,250,0.25)', color: '#60a5fa' }}>MVP Prototype</span>
          </div>
          <h1 style={{ color: 'var(--text-primary)', fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '6px' }}>Platform Analytics</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Usage, cost attribution, and ROI metrics across all citizen developer projects. Powered by BigQuery + Looker Studio.</p>
        </div>

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'LLM Calls (today)', value: totalCallsToday.toLocaleString(), delta: '+14%', color: '#9FE870' },
            { label: 'Total Tokens (today)', value: (totalTokensToday / 1000).toFixed(1) + 'K', delta: '+8%', color: '#60a5fa' },
            { label: 'GCP Cost (today)', value: `$${totalCostToday.toFixed(2)}`, delta: '+22%', color: '#f59e0b' },
            { label: 'Cost MTD', value: `$${totalMtd.toFixed(2)}`, delta: 'of $120 budget', color: '#a78bfa' },
          ].map(k => (
            <div key={k.label} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px 18px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{k.label}</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: k.color, marginBottom: '2px' }}>{k.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{k.delta}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
          {(['overview', 'projects', 'roi'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 18px', background: 'transparent', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: '600',
                color: activeTab === tab ? '#9FE870' : 'var(--text-muted)',
                borderBottom: `2px solid ${activeTab === tab ? '#9FE870' : 'transparent'}`,
                marginBottom: '-1px', textTransform: 'capitalize',
              }}
            >
              {tab === 'roi' ? 'ROI Metrics' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Weekly cost + calls chart */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>This Week — Daily GCP Cost & LLM Calls</div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '120px' }}>
                {WEEKLY.map(w => (
                  <div key={w.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{ fontSize: '10px', color: '#9FE870', fontWeight: '700' }}>${w.cost}</div>
                    <div style={{ width: '100%', display: 'flex', gap: '3px', alignItems: 'flex-end', justifyContent: 'center' }}>
                      <div style={{ width: '40%', height: `${(w.cost / maxCost) * 80}px`, background: '#9FE870', borderRadius: '3px 3px 0 0', opacity: 0.8 }} />
                      <div style={{ width: '40%', height: `${(w.calls / maxCalls) * 80}px`, background: '#60a5fa', borderRadius: '3px 3px 0 0', opacity: 0.6 }} />
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{w.day}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '11px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '10px', height: '10px', background: '#9FE870', borderRadius: '2px', display: 'inline-block' }} /> GCP Cost</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '10px', height: '10px', background: '#60a5fa', borderRadius: '2px', display: 'inline-block', opacity: 0.6 }} /> LLM Calls (scaled)</span>
              </div>
            </div>

            {/* Budget utilization */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>Budget Utilization (MTD)</div>
              {PROJECTS.map(p => {
                const pct = Math.round((p.costMtd / p.costBudget) * 100);
                const barColor = pct > 90 ? '#ff4444' : pct > 70 ? '#f59e0b' : '#9FE870';
                return (
                  <div key={p.project} style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{p.project}</span>
                      <span style={{ color: barColor, fontWeight: '700' }}>${p.costMtd.toFixed(2)} / ${p.costBudget} ({pct}%)</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: barColor, borderRadius: '3px', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Projects tab */}
        {activeTab === 'projects' && (
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.8fr 0.8fr 0.7fr 0.7fr 0.7fr 0.7fr 0.6fr', padding: '10px 16px', borderBottom: '1px solid var(--border-color)', fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', gap: '8px' }}>
              <span>Project</span><span>Team</span><span>Envs</span><span>Calls</span><span>Tokens</span><span>Cost Today</span><span>Cost MTD</span><span>Status</span>
            </div>
            {PROJECTS.map((p, i) => {
              const stcfg = STATUS_CONFIG[p.status];
              return (
                <div key={p.project} style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.8fr 0.8fr 0.7fr 0.7fr 0.7fr 0.7fr 0.6fr', padding: '14px 16px', borderBottom: i < PROJECTS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', alignItems: 'center', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>{p.project}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.owner}</div>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.team}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '600' }}>{p.activeEnvs}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{p.llmCallsToday.toLocaleString()}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{(p.tokensToday / 1000).toFixed(1)}K</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '600' }}>${p.costToday.toFixed(2)}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>${p.costMtd.toFixed(2)}</span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: stcfg.color }}>{stcfg.icon} {stcfg.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* ROI tab */}
        {activeTab === 'roi' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'rgba(159,232,112,0.05)', border: '1px solid rgba(159,232,112,0.15)', borderRadius: '10px', padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#9FE870', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>Mohamed's Pillar 2 — Measurable ROI</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {[
                  { label: 'Automations Live', value: '3', sub: 'across 3 teams', color: '#9FE870' },
                  { label: 'Hours Saved / Week', value: '~28h', sub: 'est. based on task frequency', color: '#60a5fa' },
                  { label: 'Estimated Annual Value', value: '$84K+', sub: 'at $60/hr blended rate', color: '#a78bfa' },
                ].map(m => (
                  <div key={m.label} style={{ textAlign: 'center', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: m.color, marginBottom: '4px' }}>{m.value}</div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>{m.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '18px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Time-to-Value by Project</div>
                {[
                  { project: 'email-campaign-optimizer', days: 3, value: '$12K/mo est.' },
                  { project: 'revenue-forecast-bot', days: 7, value: '$8K/mo est.' },
                  { project: 'churn-predictor', days: 5, value: '$4K/mo est.' },
                ].map(r => (
                  <div key={r.project} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-primary)' }}>{r.project}</span>
                      <span style={{ color: '#9FE870', fontWeight: '600' }}>{r.value}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Dev → Prod in {r.days} days</div>
                  </div>
                ))}
              </div>

              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '18px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Platform Cost vs Value</div>
                {[
                  { label: 'GCP infrastructure (MTD)', value: `$${totalMtd.toFixed(2)}`, color: '#f59e0b' },
                  { label: 'Promevo managed service', value: '$2,500/mo', color: '#60a5fa' },
                  { label: 'Total platform cost', value: `$${(totalMtd + 2500).toFixed(2)}/mo`, color: '#ff4444' },
                  { label: 'Estimated value generated', value: '$24K+/mo', color: '#9FE870' },
                  { label: 'ROI multiple', value: '~9.5×', color: '#a78bfa' },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{r.label}</span>
                    <span style={{ color: r.color, fontWeight: '700' }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
