import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLang } from '../../context/LanguageContext';
import MetricCard from '../shared/MetricCard';
import HealthBar from '../shared/HealthBar';
import TransactionCard from '../shared/TransactionCard';
import ReceiptModal from '../shared/ReceiptModal';
import QueryDesk from './QueryDesk';
import { generateWhatsAppSummary, formatCurrency } from '../../utils/export';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeft, ChevronRight, Languages } from 'lucide-react';

export default function ViewerDashboard({ onTabChange }) {
  const { getMonthTransactions, getStats, queries } = useData();
  const { logout } = useAuth();
  const { lang, toggleLanguage, t } = useLang();
  
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedTx, setSelectedTx] = useState(null);
  const [flagTx, setFlagTx] = useState(null);

  const monthTxs = getMonthTransactions(viewYear, viewMonth);
  const stats = getStats(monthTxs);
  // Optional: localizing month labels using Intl API
  const monthLabel = new Date(viewYear, viewMonth).toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-IN', { month: 'long', year: 'numeric' });

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function sendWhatsApp() {
    const url = generateWhatsAppSummary(monthTxs, monthLabel);
    window.open(url, '_blank');
  }

  return (
    <>
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="page" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 500, marginBottom: 2 }}>{t("Papa's View 👁️") || "Papa's View 👁️"}</p>
            <h1 style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-num)', letterSpacing: '-0.3px', color: 'var(--t1)' }}>Hisab-Kitab</h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-icon" onClick={toggleLanguage} style={{ padding: '8px', borderRadius: 10 }}>
              {lang === 'en' ? 'अ' : 'A'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={logout} style={{ fontSize: 12 }}>{t("Lock") || "Lock"}</button>
          </div>
        </div>

        {/* Month Picker */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', marginBottom: 16 }}>
          <button className="btn-icon" onClick={prevMonth} style={{ padding: 6, boxShadow:'none' }}><ChevronLeft size={18} /></button>
          <span style={{ fontWeight: 700, fontSize: 15, color:'var(--t1)' }}>{monthLabel}</span>
          <button className="btn-icon" onClick={nextMonth} style={{ padding: 6, boxShadow:'none' }}><ChevronRight size={18} /></button>
        </div>

        {/* Metrics */}
        <div className="grid-2" style={{ marginBottom: 12 }}>
          <MetricCard label={t("Received")} value={stats.received} type="received" sub={t("This month") || "This month"} />
          <MetricCard label={t("Spent")} value={stats.spent} type="spent" sub={t("This month") || "This month"} />
        </div>
        <MetricCard label={t("Remaining Balance")} value={stats.balance} type="balance" className="mb-12" />
        <div style={{ marginBottom: 16 }}>
          <HealthBar spent={stats.spent} received={stats.received} />
        </div>

        {/* WhatsApp Export */}
        <button className="btn btn-full" onClick={sendWhatsApp} style={{
          background: 'linear-gradient(135deg, #25D366, #128C7E)',
          color: '#fff', fontSize: 15, padding: '14px 20px', marginBottom: 20,
          borderRadius: 'var(--r)', gap: 10, border: 'none',
          boxShadow: '0 8px 24px rgba(37,211,102,0.3)',
        }}>
          <span style={{ fontSize: 20 }}>📤</span>
          {t("Send Summary on WhatsApp") || "Send Summary on WhatsApp"}
        </button>

        {/* Transaction List */}
        <div className="section-header">
          <span className="section-title">{t("Transactions")}</span>
          <span style={{ fontSize: 11, color: 'var(--violet)', background: 'var(--violet-light)', padding:'3px 10px', borderRadius:999, fontWeight:600 }}>
            {monthTxs.length} {t("entries")}
          </span>
        </div>
        <div className="card" style={{ overflow: 'hidden' }}>
          {monthTxs.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
              <p style={{ fontWeight: 600 }}>{t("No entries yet")}</p>
            </div>
          ) : (
            monthTxs.map((tx, i) => (
              <React.Fragment key={tx.id}>
                <TransactionCard
                  tx={tx}
                  queries={queries[tx.id] || []}
                  onTap={setSelectedTx}
                  onFlag={setFlagTx}
                  isViewer={true}
                />
                {i < monthTxs.length - 1 && <div style={{ height: 1, background: 'var(--border)', margin: '0 16px' }} />}
              </React.Fragment>
            ))
          )}
        </div>
      </div>

      {selectedTx && <ReceiptModal tx={selectedTx} onClose={() => setSelectedTx(null)} />}
      {flagTx && <QueryDesk tx={flagTx} onClose={() => setFlagTx(null)} />}
    </>
  );
}
