import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RequestProvider } from './context/RequestContext';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import Portal from './pages/Portal';
import MyRequests from './pages/MyRequests';
import AdminApprovals from './pages/AdminApprovals';
import AdminDeployments from './pages/AdminDeployments';
import AdminUsers from './pages/AdminUsers';
import CodeReviewMVP from './pages/CodeReviewMVP';
import LLMObservabilityMVP from './pages/LLMObservabilityMVP';
import SecurityControlsMVP from './pages/SecurityControlsMVP';
import EnvironmentsMVP from './pages/EnvironmentsMVP';
import PlatformAnalyticsMVP from './pages/PlatformAnalyticsMVP';

function AppContent() {
  const { currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>(
    currentUser?.role === 'admin' ? 'admin-approvals' : 'portal'
  );

  if (!currentUser) return <Login />;

  const handleNavigate = (page: string) => setCurrentPage(page);

  const renderPage = () => {
    switch (currentPage) {
      // Phase 1 — citizen dev
      case 'portal': return <Portal onNavigate={handleNavigate} />;
      case 'my-requests': return <MyRequests onNavigate={handleNavigate} />;
      // Phase 1 — admin
      case 'admin-approvals': return <AdminApprovals />;
      case 'admin-deployments': return <AdminDeployments />;
      case 'admin-users': return <AdminUsers />;
      // Phase 2 — citizen dev (MVP)
      case 'code-review': return <CodeReviewMVP />;
      case 'observability': return <LLMObservabilityMVP />;
      // Phase 2 — admin (MVP)
      case 'security-controls': return <SecurityControlsMVP />;
      case 'llm-audit': return <LLMObservabilityMVP />;
      // Phase 3 — citizen dev (MVP)
      case 'environments': return <EnvironmentsMVP />;
      case 'analytics': return <PlatformAnalyticsMVP />;
      // Phase 3 — admin (MVP)
      case 'env-pipeline': return <EnvironmentsMVP />;
      case 'cost-dashboard': return <PlatformAnalyticsMVP />;
      default: return currentUser.role === 'admin' ? <AdminApprovals /> : <Portal onNavigate={handleNavigate} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--bg-primary)' }}>
        {renderPage()}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RequestProvider>
        <AppContent />
      </RequestProvider>
    </AuthProvider>
  );
}
