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
import { ChevronLeft, ChevronRight, Languages, RefreshCcw } from 'lucide-react';

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
        <div style={{
          background: 'url(/viewer-bg.png) center/cover no-repeat',
          margin: '0 -16px 20px',
          padding: '40px 20px 30px',
          borderRadius: '0 0 32px 32px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          position: 'relative'
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.85) 100%)', borderRadius: '0 0 32px 32px' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>{t("Papa's View") || "Papa's View"} 👁️</p>
                <h1 style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--font-num)', letterSpacing: '-0.5px', color: '#fff' }}>Hisab-Kitab</h1>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => window.location.reload(true)} className="btn-icon" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '8px', boxShadow: 'none' }}>
                  <RefreshCcw size={16} />
                </button>
                <button className="btn-icon" onClick={toggleLanguage} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '8px 12px', boxShadow: 'none', fontWeight: 800 }}>
                  {lang === 'en' ? 'अ' : 'A'}
                </button>
                <button className="btn-icon" onClick={logout} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '8px 14px', boxShadow: 'none', fontWeight: 700, fontSize: 12 }}>
                  {t("Lock") || "Lock"}
                </button>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginBottom: 4 }}>{t("Remaining Balance")}</p>
                <div style={{ fontSize: 34, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-num)', lineHeight: 1 }}>₹{stats.balance.toLocaleString('en-IN')}</div>
              </div>
            </div>
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
        <div style={{ marginBottom: 20 }}>
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
