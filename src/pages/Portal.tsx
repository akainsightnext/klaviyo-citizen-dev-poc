import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRequests } from '../context/RequestContext';
import type { ProvisionRequest } from '../context/RequestContext';

const SERVICE_COMBOS = [
  { id: 'serverless-api', name: 'Serverless API', icon: '⚡', description: 'Cloud Run + Secret Manager', services: ['Cloud Run', 'Secret Manager', 'Cloud Logging'], estimatedCost: '$12–18/mo', useCase: 'REST APIs, webhooks, lightweight automations' },
  { id: 'serverless-api-db', name: 'Serverless API + Database', icon: '🗄️', description: 'Cloud Run + Cloud SQL (PostgreSQL)', services: ['Cloud Run', 'Cloud SQL', 'Secret Manager', 'Cloud Logging'], estimatedCost: '$45–65/mo', useCase: 'Apps that need persistent data storage' },
  { id: 'event-driven', name: 'Event-Driven Automation', icon: '📨', description: 'Cloud Run + Pub/Sub', services: ['Cloud Run', 'Pub/Sub', 'Eventarc', 'Cloud Logging'], estimatedCost: '$8–15/mo', useCase: 'Async processing, event pipelines, triggers' },
  { id: 'scheduled-job', name: 'Scheduled Job', icon: '⏰', description: 'Cloud Run + Cloud Scheduler', services: ['Cloud Run', 'Cloud Scheduler', 'Secret Manager', 'Cloud Logging'], estimatedCost: '$5–12/mo', useCase: 'Nightly reports, data syncs, periodic tasks' },
  { id: 'data-pipeline', name: 'Data Pipeline', icon: '📊', description: 'Cloud Run + BigQuery', services: ['Cloud Run', 'BigQuery', 'Cloud Storage', 'Cloud Logging'], estimatedCost: '$20–40/mo', useCase: 'ETL jobs, analytics pipelines, reporting' },
  { id: 'ai-automation', name: 'AI Automation', icon: '🤖', description: 'Cloud Run + Vertex AI (Gemini)', services: ['Cloud Run', 'Vertex AI', 'Secret Manager', 'Cloud Logging'], estimatedCost: '$15–35/mo + AI usage', useCase: 'LLM-powered automations, content generation' },
  { id: 'ai-automation-data', name: 'AI Automation + Data', icon: '🧠', description: 'Cloud Run + Vertex AI + BigQuery', services: ['Cloud Run', 'Vertex AI', 'BigQuery', 'Cloud SQL', 'Cloud Logging'], estimatedCost: '$50–90/mo + AI usage', useCase: 'AI apps with persistent data and analytics' },
];

const ENVIRONMENTS = [
  { id: 'dev', label: 'Dev', description: 'Development — iterate freely' },
  { id: 'stage', label: 'Stage', description: 'Staging — pre-production validation' },
];

const PIPELINE_STEPS = [
  { id: 1, label: 'Event published to Pub/Sub' },
  { id: 2, label: 'Eventarc routes to Cloud Workflows' },
  { id: 3, label: 'Terraform applied via Infra Manager' },
  { id: 4, label: 'Kong Workspace created via Admin API' },
  { id: 5, label: 'WIF configured — no keys generated' },
  { id: 6, label: 'Slack notification sent' },
];

interface Props { onNavigate: (page: string) => void; }

export default function Portal({ onNavigate }: Props) {
  const { currentUser } = useAuth();
  const { addRequest } = useRequests();

  const [selectedCombo, setSelectedCombo] = useState('');
  const [projectName, setProjectName] = useState('');
  const [teamName, setTeamName] = useState(currentUser?.team || '');
  const [environment, setEnvironment] = useState('dev');
  const [costCenter, setCostCenter] = useState('');
  const [description, setDescription] = useState('');
  const [step, setStep] = useState<'form'|'provisioning'|'complete'>('form');
  const [pipelineStep, setPipelineStep] = useState(0);

  const combo = SERVICE_COMBOS.find(c => c.id === selectedCombo);
  const canSubmit = selectedCombo && projectName && teamName && costCenter;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !combo) return;
    setStep('provisioning');
    setPipelineStep(0);
    const delays = [800, 600, 1800, 900, 700, 400];
    for (let i = 0; i < PIPELINE_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, delays[i]));
      setPipelineStep(i + 1);
    }
    const req: ProvisionRequest = {
      id: `req-${Date.now().toString(36)}`,
      submittedBy: currentUser!.name,
      submittedByEmail: currentUser!.email,
      submittedAt: new Date().toISOString(),
      projectName: projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      team: teamName,
      environment: environment as 'dev' | 'stage',
      costCenter,
      serviceCombo: combo.name,
      justification: description,
      status: 'complete',
      gcpProjectId: `klv-${projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-')}-${environment}-${Math.floor(Math.random()*9000+1000)}`,
      cloudRunUrl: `https://${projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-')}-${Math.random().toString(36).slice(2,8)}-uc.a.run.app`,
      kongWorkspace: `cdp-${projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-')}-${environment}`,
      githubRepo: `klaviyo-citizen-dev/${projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-')}`,
      wifPool: `projects/klv-${projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-')}-${environment}/locations/global/workloadIdentityPools/citizen-dev-pool`,
      estimatedMonthlyCost: 25,
    };
    addRequest(req);
    setStep('complete');
  };

  const handleReset = () => {
    setStep('form'); setSelectedCombo(''); setProjectName('');
    setTeamName(currentUser?.team || ''); setEnvironment('dev');
    setCostCenter(''); setDescription(''); setPipelineStep(0);
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-primary)' }}>
      <div style={{ padding: '28px 32px 20px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <span style={{ padding: '3px 10px', background: 'var(--kv-lime)', color: 'var(--kv-black)', borderRadius: '4px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em' }}>PHASE 2 — FOUNDATION</span>
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Request Automation Environment</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Choose a pre-built service combination. Your environment provisions automatically — no console access required.</p>
      </div>

      <div style={{ padding: '28px 32px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '28px', maxWidth: '1100px' }}>
        <div>
          {step === 'form' && (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Service Combination *</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {SERVICE_COMBOS.map(c => (
                    <div key={c.id} onClick={() => setSelectedCombo(c.id)} style={{ padding: '14px 16px', border: `2px solid ${selectedCombo === c.id ? 'var(--kv-lime)' : 'var(--border-color)'}`, borderRadius: '8px', cursor: 'pointer', background: selectedCombo === c.id ? 'var(--accent-green-dim)' : 'var(--bg-secondary)', transition: 'border-color 0.15s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '16px' }}>{c.icon}</span>
                        <span style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-primary)' }}>{c.name}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{c.description}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '6px' }}>{c.useCase}</div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-green)' }}>{c.estimatedCost}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Project Configuration</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[
                    { label: 'Project Name *', value: projectName, onChange: (v: string) => setProjectName(v.toLowerCase().replace(/[^a-z0-9-]/g, '-')), placeholder: 'e.g. churn-prediction-bot' },
                    { label: 'Team Name *', value: teamName, onChange: setTeamName, placeholder: 'e.g. Growth Engineering' },
                  ].map(f => (
                    <div key={f.label}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '5px' }}>{f.label}</label>
                      <input value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border-color)', borderRadius: '6px', fontSize: '13px', outline: 'none', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '5px' }}>Environment *</label>
                    <select value={environment} onChange={e => setEnvironment(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border-color)', borderRadius: '6px', fontSize: '13px', outline: 'none', background: 'var(--bg-primary)', color: 'var(--text-primary)', cursor: 'pointer' }}>
                      {ENVIRONMENTS.map(env => <option key={env.id} value={env.id}>{env.label} — {env.description}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '5px' }}>Cost Center *</label>
                    <input value={costCenter} onChange={e => setCostCenter(e.target.value)} placeholder="e.g. CC-4821" style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border-color)', borderRadius: '6px', fontSize: '13px', outline: 'none', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                  </div>
                </div>
                <div style={{ marginTop: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '5px' }}>Description <span style={{ fontWeight: '400', color: 'var(--text-muted)' }}>(optional)</span></label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What will this automation do?" rows={3} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border-color)', borderRadius: '6px', fontSize: '13px', outline: 'none', background: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'vertical', fontFamily: 'inherit' }} />
                </div>
              </div>

              <button type="submit" disabled={!canSubmit} style={{ padding: '12px 28px', background: canSubmit ? 'var(--kv-lime)' : 'var(--kv-gray-200)', color: canSubmit ? 'var(--kv-black)' : 'var(--kv-gray-400)', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '14px', cursor: canSubmit ? 'pointer' : 'not-allowed' }}>
                Provision Environment →
              </button>
              <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>No admin approval required — provisions automatically via Terraform</div>
            </form>
          )}

          {step === 'provisioning' && (
            <div style={{ padding: '32px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '18px', fontWeight: '800', marginBottom: '6px' }}>⚙️ Provisioning in progress...</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>{combo?.name} · {environment.toUpperCase()} · ~5–10 min</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {PIPELINE_STEPS.map((s, i) => {
                  const done = pipelineStep > i;
                  const active = pipelineStep === i;
                  return (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? 'var(--kv-lime)' : active ? 'var(--accent-orange-dim)' : 'var(--bg-tertiary)', border: `2px solid ${done ? 'var(--kv-lime)' : active ? 'var(--kv-orange)' : 'var(--border-color)'}`, fontSize: '13px', fontWeight: '700' }}>
                        {done ? '✓' : active ? '⟳' : s.id}
                      </div>
                      <span style={{ fontSize: '13px', color: done ? 'var(--text-primary)' : active ? 'var(--kv-orange)' : 'var(--text-muted)', fontWeight: done || active ? '600' : '400' }}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div style={{ padding: '32px', background: 'var(--accent-green-dim)', borderRadius: '12px', border: '2px solid var(--kv-lime)' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>✅</div>
              <div style={{ fontSize: '20px', fontWeight: '800', marginBottom: '6px' }}>Environment Provisioned</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                <code style={{ color: 'var(--accent-blue)' }}>klv-{projectName}-{environment}-xxxx</code> is ready. Slack notification sent to your workspace.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                {[
                  { label: 'GCP Project ID', value: `klv-${projectName}-${environment}-8421` },
                  { label: 'Cloud Run URL', value: `https://${projectName}.run.app` },
                  { label: 'Kong Workspace', value: `cdp-${projectName}-${environment}` },
                ].map(item => (
                  <div key={item.label} style={{ padding: '10px 12px', background: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--accent-blue)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleReset} style={{ padding: '10px 20px', background: 'var(--kv-lime)', color: 'var(--kv-black)', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>+ New Environment</button>
                <button onClick={() => onNavigate('my-requests')} style={{ padding: '10px 20px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1.5px solid var(--border-color)', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>View My Environments</button>
              </div>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ padding: '18px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>What Happens Next</div>
            {PIPELINE_STEPS.map((s, i) => (
              <div key={s.id} style={{ display: 'flex', gap: '10px', marginBottom: i < PIPELINE_STEPS.length - 1 ? '8px' : 0 }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0, marginTop: '1px' }}>{String(i + 1).padStart(2, '0')}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{s.label}</div>
              </div>
            ))}
          </div>
          {combo && (
            <div style={{ padding: '16px', background: 'var(--accent-green-dim)', borderRadius: '10px', border: '1px solid var(--kv-lime)' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>{combo.icon} {combo.name}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                {combo.services.map(s => <span key={s} style={{ padding: '2px 7px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>{s}</span>)}
              </div>
              <div style={{ fontSize: '13px', fontWeight: '700' }}>Est. {combo.estimatedCost}</div>
            </div>
          )}
          <div style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            <strong style={{ color: 'var(--text-secondary)' }}>Cost governance:</strong> Budget alerts fire at 50%, 80%, and 100% of your monthly allocation. Costs are attributed to your team in BigQuery.
          </div>
        </div>
      </div>
    </div>
  );
}
