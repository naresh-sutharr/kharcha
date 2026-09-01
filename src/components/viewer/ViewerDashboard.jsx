import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLang } from '../../context/LanguageContext';
import TransactionCard from '../shared/TransactionCard';
import ReceiptModal from '../shared/ReceiptModal';
import QueryDesk from './QueryDesk';
import { useAuth } from '../../context/AuthContext';
import {
  ChevronLeft, ChevronRight, RefreshCcw, LogOut,
  ArrowDownLeft, ArrowUpRight, Bell, List, BarChart2
} from 'lucide-react';

// Animated count-up number
function CountUp({ value, prefix = '₹' }) {
  const [display, setDisplay] = React.useState(value);
  React.useEffect(() => {
    const from = display;
    const dur = 600;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (value - from) * ease));
      if (p < 1) requestAnimationFrame(step);
      else setDisplay(value);
    };
    requestAnimationFrame(step);
  }, [value]);
  return <span>{prefix}{display.toLocaleString('en-IN')}</span>;
}

export default function ViewerDashboard({ onTabChange }) {
  const { getMonthTransactions, getStats, getCarryOverBalance, queries, transactions } = useData();
  const { logout } = useAuth();
  const { lang, toggleLanguage, t } = useLang();

  const now = new Date();
  const [viewYear,  setViewYear]  = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedTx, setSelectedTx] = useState(null);
  const [flagTx,    setFlagTx]    = useState(null);
  const [showNotif, setShowNotif] = useState(false);

  const carryOver = getCarryOverBalance(viewYear, viewMonth);
  const monthTxs = getMonthTransactions(viewYear, viewMonth).filter(t => t.type !== 'fixed');
  const stats    = getStats(monthTxs);
  const totalAvailable = carryOver + stats.received;
  const currentBalance = totalAvailable - stats.spent;
  
  const pctSpent = totalAvailable > 0
    ? Math.min((stats.spent / totalAvailable) * 100, 100)
    : 0;

  const monthLabel = new Date(viewYear, viewMonth).toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-IN', { month: 'long', year: 'numeric' });
  const greeting   = now.getHours() < 12 ? t('Good Morning') : now.getHours() < 17 ? t('Good Afternoon') : t('Good Evening');

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  return (
    <>
      <div className="page" style={{ paddingTop: 0 }}>

        {/* ══ PREMIUM HERO ══ */}
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '0 0 36px 36px', marginBottom: 0 }}>
          {/* Background image */}
          <img
            src="/papa-hero.png"
            alt=""
            style={{ width: '100%', height: 210, objectFit: 'cover', display: 'block' }}
          />
          {/* Gradient overlay — warm amber-to-white */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(15,10,5,0.3) 0%, rgba(5,3,1,0.82) 100%)',
          }} />

          {/* Top bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '44px 18px 0', zIndex: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 2 }}>
                  {greeting}
                </p>
                <h1 style={{ fontSize: 23, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-num)', letterSpacing: '-0.4px' }}>
                  {t("Papa's Dashboard")}
                </h1>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setShowNotif(s => !s)}
                  style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Bell size={15} />
                </button>
                <button
                  onClick={toggleLanguage}
                  style={{ height: 36, padding: '0 12px', borderRadius: 11, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}
                >
                  {lang === 'en' ? 'अ' : 'A'}
                </button>
                <button
                  onClick={() => window.location.reload()}
                  style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <RefreshCcw size={14} />
                </button>
                <button
                  onClick={logout}
                  style={{ height: 36, padding: '0 12px', borderRadius: 11, background: 'rgba(220,38,38,0.25)', border: '1px solid rgba(220,38,38,0.4)', color: '#fca5a5', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  <LogOut size={12} /> {t('Lock')}
                </button>
              </div>
            </div>
          </div>

          {/* Balance */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 20px 22px', zIndex: 2 }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginBottom: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {t("Balance — ")} {monthLabel}
            </p>
            <div style={{ fontSize: 42, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-num)', lineHeight: 1, letterSpacing: '-1.5px' }}>
              <CountUp value={currentBalance} />
            </div>
          </div>
        </div>


        <div style={{ padding: '12px 16px 0' }}>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div style={{ background: '#fff', borderRadius: 18, padding: '16px', boxShadow: '0 4px 18px rgba(5,150,105,0.1)', border: '1.5px solid rgba(5,150,105,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t("Received")}</span>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(5,150,105,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowDownLeft size={14} color="#059669" />
                </div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#059669', fontFamily: 'var(--font-num)', letterSpacing: '-0.5px' }}>
                ₹{stats.received.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 3, fontWeight: 500 }}>
                {t("This month")} {carryOver > 0 ? `+ ₹${carryOver} prev` : ''}
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 18, padding: '16px', boxShadow: '0 4px 18px rgba(225,29,72,0.08)', border: '1.5px solid rgba(225,29,72,0.12)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t("Spent")}</span>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(225,29,72,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowUpRight size={14} color="#e11d48" />
                </div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#e11d48', fontFamily: 'var(--font-num)', letterSpacing: '-0.5px' }}>
                ₹{stats.spent.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 3, fontWeight: 500 }}>{t("This month")}</div>
            </div>
            
            {stats.fixed > 0 && (
              <div style={{ gridColumn: '1 / -1', background: '#fff', borderRadius: 18, padding: '14px 16px', boxShadow: '0 4px 18px rgba(2,132,199,0.08)', border: '1.5px solid rgba(2,132,199,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(2,132,199,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 11 }}>🏠</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t("Fixed (Rent/Fees)")}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, marginLeft: 28 }}>{t("Paid this month")}</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#0284c7', fontFamily: 'var(--font-num)', letterSpacing: '-0.3px' }}>
                  ₹{stats.fixed.toLocaleString('en-IN')}
                </div>
              </div>
            )}
          </div>

          {/* Spending bar */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', marginBottom: 14, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>{t("Spending Health")}</span>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                color: pctSpent > 85 ? '#dc2626' : pctSpent > 60 ? '#d97706' : '#059669',
                background: pctSpent > 85 ? '#fee2e2' : pctSpent > 60 ? '#fef3c7' : '#d1fae5',
              }}>
                {pctSpent > 85 ? t('⚠ Over Budget') : pctSpent > 60 ? t('↑ High') : t('✓ On Track')}
              </span>
            </div>
            <div style={{ width: '100%', height: 7, background: '#f3f4f6', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 999, width: `${pctSpent}%`,
                background: pctSpent > 85
                  ? 'linear-gradient(90deg,#f59e0b,#dc2626)'
                  : 'linear-gradient(90deg,#34d399,#059669)',
                transition: 'width 0.8s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 10, color: 'var(--t3)' }}>₹0</span>
              <span style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 600 }}>{pctSpent.toFixed(0)}% {lang === 'hi' ? 'खर्च' : 'used'} (₹{totalAvailable.toLocaleString('en-IN')})</span>
              <span style={{ fontSize: 10, color: 'var(--t3)' }}>{t("Budget")}</span>
            </div>
          </div>

          {/* Month picker */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, padding: '10px 14px', borderRadius: 14, background: '#fff', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
            <button onClick={prevMonth} style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--violet-light)', border: 'none', color: 'var(--violet)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronLeft size={17} />
            </button>
            <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--t1)', fontFamily: 'var(--font-num)' }}>{monthLabel}</span>
            <button onClick={nextMonth} style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--violet-light)', border: 'none', color: 'var(--violet)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRight size={17} />
            </button>
          </div>

          {/* Transactions for that month */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)' }}>{t("Transactions")}</span>
            <span style={{ fontSize: 12, color: 'var(--violet)', background: 'var(--violet-light)', padding: '3px 11px', borderRadius: 999, fontWeight: 700 }}>
              {monthTxs.length} {t("entries")}
            </span>
          </div>
          <div className="card" style={{ overflow: 'hidden', marginBottom: 20 }}>
            {monthTxs.length === 0 ? (
              <div style={{ padding: '44px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 42, marginBottom: 10 }}>📭</div>
                <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--t1)' }}>{t("No entries yet")}</p>
                <p style={{ fontSize: 13, color: 'var(--t3)', marginTop: 4 }}>{t("No transactions this month")}</p>
              </div>
            ) : monthTxs.map((tx, i) => (
              <React.Fragment key={tx.id}>
                <TransactionCard tx={tx} queries={queries[tx.id] || []} onTap={setSelectedTx} onFlag={setFlagTx} isViewer={true} />
                {i < monthTxs.length - 1 && <div style={{ height: 1, background: 'var(--border)', margin: '0 16px' }} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {selectedTx && <ReceiptModal tx={selectedTx} onClose={() => setSelectedTx(null)} />}
      {flagTx     && <QueryDesk   tx={flagTx}     onClose={() => setFlagTx(null)} />}
    </>
  );
}
