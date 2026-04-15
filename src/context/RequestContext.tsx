import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type RequestStatus = 'provisioning' | 'complete' | 'failed';

export interface ProvisionRequest {
  id: string;
  submittedBy: string;
  submittedByEmail: string;
  submittedAt: string;
  projectName: string;
  team: string;
  environment: 'dev' | 'stage';
  costCenter: string;
  serviceCombo: string;
  justification: string;
  status: RequestStatus;
  gcpProjectId?: string;
  cloudRunUrl?: string;
  wifPool?: string;
  kongWorkspace?: string;
  cloudSqlInstance?: string;
  githubRepo?: string;
  estimatedMonthlyCost: number;
}

const INITIAL_REQUESTS: ProvisionRequest[] = [
  {
    id: 'req-001',
    submittedBy: 'Sarah Chen',
    submittedByEmail: 'sarah.chen@klaviyo.com',
    submittedAt: '2026-04-05T09:15:00Z',
    projectName: 'email-campaign-optimizer',
    team: 'Marketing Ops',
    environment: 'dev',
    costCenter: 'CC-4421',
    serviceCombo: 'AI Automation + Database',
    justification: 'Automate weekly email campaign performance analysis using Gemini to generate optimization recommendations.',
    status: 'provisioning',
    estimatedMonthlyCost: 42,
  },
  {
    id: 'req-002',
    submittedBy: 'James Okafor',
    submittedByEmail: 'james.okafor@klaviyo.com',
    submittedAt: '2026-04-04T14:30:00Z',
    projectName: 'growth-ab-test-analyzer',
    team: 'Growth',
    environment: 'stage',
    costCenter: 'CC-3310',
    serviceCombo: 'AI Automation + Event-Driven',
    justification: 'Run nightly A/B test result analysis and auto-generate Slack summaries for the growth team.',
    status: 'complete',
    gcpProjectId: 'klv-growth-ab-stg-7732',
    cloudRunUrl: 'https://growth-ab-xyz789-uc.a.run.app',
    wifPool: 'projects/klv-growth-ab-stg-7732/locations/global/workloadIdentityPools/citizen-dev-pool',
    kongWorkspace: 'cdp-growth-ab-test-analyzer-stage',
    githubRepo: 'klaviyo-citizen-dev/growth-ab-test-analyzer',
    estimatedMonthlyCost: 38,
  },
  {
    id: 'req-003',
    submittedBy: 'Priya Sharma',
    submittedByEmail: 'priya.sharma@klaviyo.com',
    submittedAt: '2026-04-03T11:00:00Z',
    projectName: 'churn-prediction-pipeline',
    team: 'Data Analytics',
    environment: 'stage',
    costCenter: 'CC-5502',
    serviceCombo: 'Data Pipeline',
    justification: 'Daily churn prediction model run to flag at-risk accounts for CS team intervention.',
    status: 'complete',
    gcpProjectId: 'klv-churn-pred-stg-8821',
    cloudRunUrl: 'https://churn-pred-abc123-uc.a.run.app',
    wifPool: 'projects/klv-churn-pred-stg-8821/locations/global/workloadIdentityPools/citizen-dev-pool',
    kongWorkspace: 'cdp-churn-prediction-pipeline-stage',
    cloudSqlInstance: 'klv-churn-pred-stg-8821:us-central1:cdp-db',
    githubRepo: 'klaviyo-citizen-dev/churn-prediction-pipeline',
    estimatedMonthlyCost: 67,
  },
  {
    id: 'req-004',
    submittedBy: 'Sarah Chen',
    submittedByEmail: 'sarah.chen@klaviyo.com',
    submittedAt: '2026-04-06T08:00:00Z',
    projectName: 'revenue-forecast-bot',
    team: 'Marketing Ops',
    environment: 'dev',
    costCenter: 'CC-4421',
    serviceCombo: 'AI Automation — Stateless',
    justification: 'Weekly revenue forecasting automation using Gemini to analyze pipeline data and generate board-ready summaries.',
    status: 'complete',
    gcpProjectId: 'klv-revenue-forecast-dev-4401',
    cloudRunUrl: 'https://revenue-forecast-def456-uc.a.run.app',
    wifPool: 'projects/klv-revenue-forecast-dev-4401/locations/global/workloadIdentityPools/citizen-dev-pool',
    kongWorkspace: 'cdp-revenue-forecast-bot-dev',
    githubRepo: 'klaviyo-citizen-dev/revenue-forecast-bot',
    estimatedMonthlyCost: 55,
  },
  {
    id: 'req-005',
    submittedBy: 'Sarah Chen',
    submittedByEmail: 'sarah.chen@klaviyo.com',
    submittedAt: '2026-04-02T10:00:00Z',
    projectName: 'sms-content-generator',
    team: 'Marketing Ops',
    environment: 'dev',
    costCenter: 'CC-4421',
    serviceCombo: 'AI Automation — Stateless',
    justification: 'Generate SMS campaign copy variants using Gemini Flash for rapid A/B testing.',
    status: 'failed',
    estimatedMonthlyCost: 28,
  },
];

interface RequestContextType {
  requests: ProvisionRequest[];
  addRequest: (req: ProvisionRequest) => void;
  updateRequest: (id: string, updates: Partial<ProvisionRequest>) => void;
}

const RequestContext = createContext<RequestContextType | null>(null);

export function RequestProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<ProvisionRequest[]>(INITIAL_REQUESTS);

  const addRequest = (req: ProvisionRequest) => {
    setRequests(prev => [req, ...prev]);
  };

  const updateRequest = (id: string, updates: Partial<ProvisionRequest>) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  return (
    <RequestContext.Provider value={{ requests, addRequest, updateRequest }}>
      {children}
    </RequestContext.Provider>
  );
}

export function useRequests() {
  const ctx = useContext(RequestContext);
  if (!ctx) throw new Error('useRequests must be used within RequestProvider');
  return ctx;
}
