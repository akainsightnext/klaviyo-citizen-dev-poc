import { useState } from 'react';

type EnvStatus = 'healthy' | 'deploying' | 'failed';
type EnvTier = 'dev' | 'stage';

interface Environment {
  id: string;
  project: string;
  tier: EnvTier;
  status: EnvStatus;
  version: string;
  deployedAt: string;
  deployedBy: string;
  cloudRun: string;
  cloudSql: string;
  canPromote: boolean;
  blockedReason?: string;
}

const TIER_CONFIG: Record<EnvTier, { label: string; color: string; bg: string; border: string; description: string }> = {
  dev:   { label: 'Dev',   color: '#9FE870', bg: 'rgba(159,232,112,0.08)', border: 'rgba(159,232,112,0.25)', description: 'Instant sandbox — auto-provisioned on request' },
  stage: { label: 'Stage', color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.25)', description: 'Pre-production validation — mirrors prod config' },
};

const STATUS_CONFIG: Record<EnvStatus, { label: string; color: string; icon: string }> = {
  healthy:   { label: 'Healthy',     color: '#9FE870', icon: '●' },
  deploying: { label: 'Deploying…',  color: '#60a5fa', icon: '◌' },
  failed:    { label: 'Failed',      color: '#ff4444', icon: '⊗' },
};

const INITIAL_ENVS: Environment[] = [
  { id: 'e1', project: 'email-campaign-optimizer', tier: 'dev',   status: 'healthy',   version: 'v1.4.2-dev.8',  deployedAt: '10:22', deployedBy: 'sarah.chen',  cloudRun: 'email-opt-dev',   cloudSql: 'db-dev-sm',   canPromote: true },
  { id: 'e2', project: 'email-campaign-optimizer', tier: 'stage', status: 'healthy',   version: 'v1.4.1',        deployedAt: '09:15', deployedBy: 'CI/CD',       cloudRun: 'email-opt-stage', cloudSql: 'db-stage-std', canPromote: false },

  { id: 'e3', project: 'revenue-forecast-bot',     tier: 'dev',   status: 'deploying', version: 'v2.1.0-dev.3',  deployedAt: '10:31', deployedBy: 'sarah.chen',  cloudRun: 'rev-bot-dev',     cloudSql: 'db-dev-sm',   canPromote: false, blockedReason: 'Deployment in progress' },
  { id: 'e4', project: 'revenue-forecast-bot',     tier: 'stage', status: 'failed',    version: 'v2.0.9',        deployedAt: '09:44', deployedBy: 'CI/CD',       cloudRun: 'rev-bot-stage',   cloudSql: 'db-stage-std', canPromote: false, blockedReason: 'Test suite failed — 3 integration tests failing' },

  { id: 'e5', project: 'churn-prediction-pipeline', tier: 'dev',  status: 'healthy',   version: 'v0.3.1-dev.1',  deployedAt: '10:05', deployedBy: 'priya.sharma', cloudRun: 'churn-dev',       cloudSql: 'db-dev-sm',   canPromote: true },
  { id: 'e6', project: 'churn-prediction-pipeline', tier: 'stage', status: 'healthy',  version: 'v0.3.0',        deployedAt: '08:50', deployedBy: 'CI/CD',        cloudRun: 'churn-stage',     cloudSql: 'db-stage-std', canPromote: false },
];

const PROJECTS = ['email-campaign-optimizer', 'revenue-forecast-bot', 'churn-prediction-pipeline'];
const TIERS: EnvTier[] = ['dev', 'stage'];

export default function EnvironmentsMVP() {
  const [envs, setEnvs] = useState<Environment[]>(INITIAL_ENVS);
  const [selectedProject, setSelectedProject] = useState<string>('email-campaign-optimizer');
  const [promotingId, setPromotingId] = useState<string | null>(null);

  const projectEnvs = envs.filter(e => e.project === selectedProject);

  const handlePromote = (env: Environment) => {
    if (env.tier !== 'dev') return;
    setPromotingId(env.id);
    setTimeout(() => {
      setEnvs(prev => prev.map(e => {
        if (e.id === env.id) return { ...e, status: 'healthy' };
        if (e.project === env.project && e.tier === 'stage') {
          return { ...e, status: 'deploying', version: env.version.replace(/-dev\.\d+$/, ''), deployedAt: 'just now', deployedBy: 'you' };
        }
        return e;
      }));
      setPromotingId(null);
      setTimeout(() => {
        setEnvs(prev => prev.map(e => {
          if (e.project === env.project && e.tier === 'stage' && e.status === 'deploying') {
            return { ...e, status: 'healthy' };
          }
          return e;
        }));
      }, 2500);
    }, 1800);
  };

  return (
    <div style={{ flex: 1, padding: '32px', overflowY: 'auto', background: 'var(--bg-primary)' }}>
      <div style={{ maxWidth: '900px' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.10em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '4px', background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.30)', color: '#a78bfa' }}>Phase 3 — Scale</span>
            <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '4px', background: 'rgba(96,165,250,0.10)', border: '1px solid rgba(96,165,250,0.25)', color: '#60a5fa' }}>MVP Prototype</span>
          </div>
          <h1 style={{ color: 'var(--text-primary)', fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '6px' }}>Multi-Environment Ecosystem</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Every citizen developer app automatically provisioned across Dev → Stage via Cloud Deploy promotion pipelines.</p>
        </div>

        {/* Tier legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {TIERS.map((tier, i) => (
            <div key={tier} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px 16px', borderRadius: '6px', background: TIER_CONFIG[tier].bg, border: `1px solid ${TIER_CONFIG[tier].border}` }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: TIER_CONFIG[tier].color }}>{TIER_CONFIG[tier].label}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{TIER_CONFIG[tier].description}</div>
              </div>
              {i < TIERS.length - 1 && (
                <div style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '16px', marginBottom: '2px' }}>→</div>
                  <div>PR merge + tests pass</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Project tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
          {PROJECTS.map(p => (
            <button
              key={p}
              onClick={() => setSelectedProject(p)}
              style={{
                padding: '8px 16px', background: 'transparent', border: 'none', cursor: 'pointer',
                fontSize: '12px', fontWeight: '600',
                color: selectedProject === p ? '#9FE870' : 'var(--text-muted)',
                borderBottom: `2px solid ${selectedProject === p ? '#9FE870' : 'transparent'}`,
                marginBottom: '-1px',
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Environment cards — Dev and Stage side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {TIERS.map(tier => {
            const env = projectEnvs.find(e => e.tier === tier);
            if (!env) return (
              <div key={tier} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No {TIER_CONFIG[tier].label} environment</span>
              </div>
            );
            const tierCfg = TIER_CONFIG[tier];
            const statusCfg = STATUS_CONFIG[env.status];
            const isPromoting = promotingId === env.id;

            return (
              <div key={tier} style={{
                background: 'var(--bg-secondary)',
                border: `1px solid ${env.status === 'failed' ? 'rgba(255,68,68,0.35)' : tierCfg.border}`,
                borderRadius: '10px',
                overflow: 'hidden',
              }}>
                {/* Tier header */}
                <div style={{ padding: '10px 16px', background: tierCfg.bg, borderBottom: `1px solid ${tierCfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: tierCfg.color, letterSpacing: '0.04em' }}>{tierCfg.label}</span>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: statusCfg.color }}>{statusCfg.icon} {statusCfg.label}</span>
                </div>

                {/* Env details */}
                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px', fontFamily: 'JetBrains Mono, monospace' }}>{env.version}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                    {[
                      ['Deployed', env.deployedAt],
                      ['By', env.deployedBy],
                      ['Cloud Run', env.cloudRun],
                      ['Cloud SQL', env.cloudSql],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                        <span style={{ color: 'var(--text-primary)', fontFamily: (k === 'Cloud Run' || k === 'Cloud SQL') ? 'JetBrains Mono, monospace' : 'inherit', fontSize: (k === 'Cloud Run' || k === 'Cloud SQL') ? '11px' : '12px' }}>{v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Blocked reason */}
                  {env.blockedReason && (
                    <div style={{ padding: '8px 10px', background: env.status === 'failed' ? 'rgba(255,68,68,0.08)' : 'rgba(245,158,11,0.08)', borderRadius: '5px', fontSize: '11px', color: env.status === 'failed' ? '#ff4444' : '#f59e0b', marginBottom: '12px', lineHeight: '1.4' }}>
                      {env.blockedReason}
                    </div>
                  )}

                  {/* Promote button — only on dev */}
                  {tier === 'dev' && (
                    <button
                      disabled={!env.canPromote || isPromoting}
                      onClick={() => env.canPromote && !isPromoting && handlePromote(env)}
                      style={{
                        width: '100%', padding: '8px', borderRadius: '6px', border: 'none',
                        cursor: env.canPromote && !isPromoting ? 'pointer' : 'not-allowed',
                        background: env.canPromote && !isPromoting ? '#9FE870' : 'rgba(255,255,255,0.06)',
                        color: env.canPromote && !isPromoting ? '#0a0a0a' : 'rgba(255,255,255,0.25)',
                        fontSize: '12px', fontWeight: '700', transition: 'all 0.15s',
                      }}
                    >
                      {isPromoting ? '⟳ Promoting to Stage…' : 'Promote → Stage'}
                    </button>
                  )}
                  {tier === 'stage' && (
                    <div style={{ padding: '8px', borderRadius: '6px', background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)', fontSize: '11px', color: '#a78bfa', textAlign: 'center' }}>
                      Stage environment — promoted via CI/CD pipeline
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* GCP services note */}
        <div style={{ marginTop: '24px', padding: '14px 18px', background: 'rgba(159,232,112,0.05)', border: '1px solid rgba(159,232,112,0.15)', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#9FE870', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>GCP-Native, Tool-Agnostic Design</div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.6' }}>
            Infrastructure runs on GCP (Cloud Run, Cloud SQL, Cloud Deploy, BigQuery) — aligned with Klaviyo's existing GCP enterprise agreement. API enforcement runs through Klaviyo's existing Kong instance via dedicated Kong Workspaces. Terraform modules and Kong Workspace configs are the key portable artifacts that survive a cloud migration intact.
          </p>
        </div>
      </div>
    </div>
  );
}
