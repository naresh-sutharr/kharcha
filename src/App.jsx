import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useData } from './context/DataContext';
import RoleSelect from './components/RoleSelect';
import LockScreen from './components/LockScreen';
import BottomNav from './components/shared/BottomNav';

import { notifyPapaAppOpen } from './utils/notify';

import PushNotificationManager from './components/shared/PushNotificationManager';

// Admin screens
import AdminDashboard from './components/admin/AdminDashboard';
import TransactionFeed from './components/admin/TransactionFeed';
import QueryThread from './components/admin/QueryThread';
import Settings from './components/admin/Settings';

// Viewer screens
import ViewerDashboard from './components/viewer/ViewerDashboard';
import SpendingCharts from './components/viewer/SpendingCharts';
import QueryDesk from './components/viewer/QueryDesk';

export default function App() {
  const { role, initialized, loginAsAdmin, loginAsViewer } = useAuth();
  const { queries, transactions } = useData();
  const [pendingRole, setPendingRole] = useState(null); // role being unlocked
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Notify admin when papa opens the app
  React.useEffect(() => {
    if (role === 'viewer') {
      notifyPapaAppOpen();
    }
  }, [role]);



  // Not logged in — show role select or lock screen
  if (!role) {
    if (!pendingRole) return <RoleSelect onSelectRole={r => { setPendingRole(r); setActiveTab('dashboard'); }} />;
    return (
      <LockScreen
        role={pendingRole}
        onSuccess={async (pin) => {
          const ok = pendingRole === 'admin' ? await loginAsAdmin(pin) : await loginAsViewer(pin);
          return ok;
        }}
        onBack={() => setPendingRole(null)}
      />
    );
  }

  // Count unread queries for admin badge
  const pendingQueryCount = role === 'admin'
    ? Object.values(queries).flat().filter(q => q.from === 'viewer').length
    : 0;

  // Render active screen
  function renderScreen() {
    if (role === 'admin') {
      if (activeTab === 'dashboard') return <AdminDashboard onTabChange={setActiveTab} />;
      if (activeTab === 'transactions') return <TransactionFeed />;
      if (activeTab === 'queries') return <QueryThread />;
      if (activeTab === 'settings') return <Settings />;
    }
    if (role === 'viewer') {
      if (activeTab === 'dashboard') return <ViewerDashboard onTabChange={setActiveTab} />;
      if (activeTab === 'transactions') return <TransactionFeed isViewer={true} />;
      if (activeTab === 'queries') return <AllViewerQueries />;
    }
    return null;
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <PushNotificationManager role={role} />
      {renderScreen()}
      <BottomNav role={role} active={activeTab} onChange={setActiveTab} queryCount={pendingQueryCount} />
    </div>
  );
}

// Viewer all queries screen
function AllViewerQueries() {
  const { transactions, queries, addQuery } = useData();
  const [selectedTx, setSelectedTx] = useState(null);
  const [text, setText] = useState('');

  const txsWithQueries = transactions.filter(t => (queries[t.id] || []).length > 0);
  const allTxs = transactions;

  return (
    <>
      <div className="page">
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Query Desk</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Your questions & student's replies</p>

        {txsWithQueries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
            <p style={{ fontWeight: 700, fontSize: 16 }}>No queries yet</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Tap ❓ on any transaction to ask a question</p>
          </div>
        ) : txsWithQueries.map(tx => {
          const thread = queries[tx.id] || [];
          return (
            <div key={tx.id} className="glass" style={{ padding: 16, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{tx.note || tx.category} · ₹{tx.amount.toLocaleString('en-IN')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                {thread.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.from === 'viewer' ? 'flex-end' : 'flex-start' }}>
                    <div className={`query-bubble ${msg.from}`}>{msg.text}</div>
                  </div>
                ))}
              </div>
              {/* Add follow-up */}
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="input" placeholder="Follow up..." style={{ flex: 1, fontSize: 13, padding: '8px 12px' }}
                  onKeyDown={e => { if (e.key === 'Enter' && e.target.value.trim()) { addQuery(tx.id, 'viewer', e.target.value.trim()); e.target.value = ''; } }} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
