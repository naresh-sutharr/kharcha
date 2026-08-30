import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLang } from '../../context/LanguageContext';
import TransactionCard from '../shared/TransactionCard';
import ReceiptModal from '../shared/ReceiptModal';
import QueryDesk from './QueryDesk';
import { useAuth } from '../../context/AuthContext';
import {
  ChevronLeft, ChevronRight, RefreshCcw, LogOut,
  ArrowDownLeft, ArrowUpRight, TrendingUp, TrendingDown, Bell, BellOff
} from 'lucide-react';
import { NTFY_TOPIC } from '../../utils/notify';

// Animated counting number
function CountUp({ value }) {
  const [display, setDisplay] = React.useState(value);
  React.useEffect(() => {
    let start = null;
    const from = display;
    const to = value;
    const dur = 500;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (to - from) * ease));
      if (p < 1) requestAnimationFrame(step);
      else setDisplay(to);
    };
    requestAnimationFrame(step);
  }, [value]);
  return <span>₹{display.toLocaleString('en-IN')}</span>;
}

export default function ViewerDashboard({ onTabChange }) {
  const { getMonthTransactions, getStats, queries } = useData();
  const { logout } = useAuth();
  const { lang, toggleLanguage, t } = useLang();

  const now = new Date();
  const [viewYear,  setViewYear]  = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedTx, setSelectedTx] = useState(null);
  const [flagTx, setFlagTx]         = useState(null);
  const [showTopic, setShowTopic]   = useState(false);

  const monthTxs  = getMonthTransactions(viewYear, viewMonth);
  const stats     = getStats(monthTxs);
  const allStats  = getStats(getMonthTransactions(now.getFullYear(), now.getMonth()));

  const monthLabel = new Date(viewYear, viewMonth).toLocaleString(
    lang === 'hi' ? 'hi-IN' : 'en-IN',
    { month: 'long', year: 'numeric' }
  );

  const pctSpent = stats.received > 0
    ? Math.min((stats.spent / stats.received) * 100, 100)
    : 0;

  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const greeting = now.getHours() < 12 ? 'Suprabhat' : now.getHours() < 17 ? 'Namaskar' : 'Shubh Sandhya';

  return (
    <>
      <div className="page" style={{ paddingTop: 0 }}>

        {/* ══ HERO HEADER — Warm aesthetic with image ══ */}
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '0 0 32px 32px',
          marginBottom: 0,
        }}>
          {/* Hero image */}
          <img
            src="/papa-hero.png"
            alt="hero"
            style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }}
          />
          {/* Warm gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(20,10,5,0.25) 0%, rgba(10,5,2,0.78) 100%)',
          }} />

          {/* Top bar */}
          <div style={{ position:'absolute', top:0, left:0, right:0, padding:'44px 20px 0', zIndex:2 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <p style={{ fontSize:11, color:'rgba(255,255,255,0.7)', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:2 }}>
                  {greeting} 🙏
                </p>
                <h1 style={{ fontSize:22, fontWeight:900, color:'#fff', fontFamily:'var(--font-num)', letterSpacing:'-0.4px' }}>
                  Papa's View
                </h1>
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <button
                  onClick={() => setShowTopic(s => !s)}
                  title="Notifications Setup"
                  style={{ width:36, height:36, borderRadius:12, background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}
                >
                  <Bell size={15} />
                </button>
                <button
                  onClick={toggleLanguage}
                  style={{ height:36, padding:'0 13px', borderRadius:12, background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', color:'#fff', fontWeight:800, fontSize:14, cursor:'pointer' }}
                >
                  {lang === 'en' ? 'अ' : 'A'}
                </button>
                <button
                  onClick={() => window.location.reload()}
                  style={{ width:36, height:36, borderRadius:12, background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}
                >
                  <RefreshCcw size={15} />
                </button>
                <button
                  onClick={logout}
                  style={{ height:36, padding:'0 12px', borderRadius:12, background:'rgba(239,68,68,0.25)', border:'1px solid rgba(239,68,68,0.4)', color:'#fca5a5', fontWeight:700, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}
                >
                  <LogOut size={12} /> Lock
                </button>
              </div>
            </div>
          </div>

          {/* Balance over image */}
          <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'0 20px 24px', zIndex:2 }}>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.65)', fontWeight:600, marginBottom:4, letterSpacing:'0.05em' }}>
              {isCurrentMonth ? 'Is Mahine Ka' : monthLabel} — Bachha Paisa
            </p>
            <div style={{ fontSize:40, fontWeight:900, color:'#fff', fontFamily:'var(--font-num)', lineHeight:1, letterSpacing:'-1px' }}>
              <CountUp value={stats.balance} />
            </div>
          </div>
        </div>

        {/* ══ NOTIFICATION SETUP BANNER ══ */}
        {showTopic && (
          <div style={{ margin:'16px 16px 0', padding:'16px', borderRadius:16, background:'#fffbeb', border:'1.5px solid #fde68a', boxShadow:'0 2px 12px rgba(245,158,11,0.15)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <Bell size={16} color="#d97706" />
              <span style={{ fontSize:14, fontWeight:800, color:'#92400e' }}>Notification Setup Karo</span>
            </div>
            <p style={{ fontSize:13, color:'#78350f', lineHeight:1.6, marginBottom:10 }}>
              📱 Papa ke phone pe <b>"ntfy"</b> app download karo (Play Store / App Store se) aur yeh topic add karo:
            </p>
            <div style={{ background:'#fff', border:'1.5px solid #fde68a', borderRadius:10, padding:'10px 14px', fontFamily:'monospace', fontSize:14, fontWeight:700, color:'#1c1917', userSelect:'all', marginBottom:10 }}>
              {NTFY_TOPIC}
            </div>
            <p style={{ fontSize:12, color:'#92400e' }}>
              Uske baad jab bhi Naresh kuch add kare, turant notification aayegi! 🔔
            </p>
            <button onClick={() => setShowTopic(false)} style={{ marginTop:10, fontSize:12, color:'#d97706', fontWeight:700, background:'none', border:'none', cursor:'pointer', padding:0 }}>
              ✕ Band karo
            </button>
          </div>
        )}

        {/* ══ FLOAT-UP STAT CARDS ══ */}
        <div style={{ padding:'16px 16px 0' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
            {/* Received */}
            <div style={{ background:'#fff', borderRadius:20, padding:'16px', boxShadow:'0 4px 20px rgba(5,150,105,0.12)', border:'1.5px solid rgba(5,150,105,0.15)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ fontSize:11, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.08em' }}>{t('Received')}</span>
                <div style={{ width:30, height:30, borderRadius:9, background:'rgba(5,150,105,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <ArrowDownLeft size={15} color="#059669" />
                </div>
              </div>
              <div style={{ fontSize:21, fontWeight:800, color:'#059669', fontFamily:'var(--font-num)', letterSpacing:'-0.5px' }}>
                ₹{stats.received.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize:11, color:'#9ca3af', marginTop:3, fontWeight:500 }}>{t('This month')}</div>
            </div>

            {/* Spent */}
            <div style={{ background:'#fff', borderRadius:20, padding:'16px', boxShadow:'0 4px 20px rgba(225,29,72,0.1)', border:'1.5px solid rgba(225,29,72,0.13)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ fontSize:11, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.08em' }}>{t('Spent')}</span>
                <div style={{ width:30, height:30, borderRadius:9, background:'rgba(225,29,72,0.08)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <ArrowUpRight size={15} color="#e11d48" />
                </div>
              </div>
              <div style={{ fontSize:21, fontWeight:800, color:'#e11d48', fontFamily:'var(--font-num)', letterSpacing:'-0.5px' }}>
                ₹{stats.spent.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize:11, color:'#9ca3af', marginTop:3, fontWeight:500 }}>{t('This month')}</div>
            </div>
          </div>

          {/* ══ SPENDING HEALTH BAR ══ */}
          <div style={{ background:'#fff', borderRadius:16, padding:'14px 16px', marginBottom:16, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid var(--border)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <span style={{ fontSize:13, fontWeight:700, color:'var(--t1)' }}>Kharch ka Haal</span>
              <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:999,
                color: pctSpent > 85 ? '#dc2626' : pctSpent > 60 ? '#d97706' : '#059669',
                background: pctSpent > 85 ? '#fee2e2' : pctSpent > 60 ? '#fef3c7' : '#d1fae5',
              }}>
                {pctSpent > 85 ? '⚠ Zyada' : pctSpent > 60 ? '↑ Theek hai' : '✓ Sahi chal raha'}
              </span>
            </div>
            <div style={{ width:'100%', height:8, background:'#f3f4f6', borderRadius:999, overflow:'hidden' }}>
              <div style={{
                height:'100%', borderRadius:999, width:`${pctSpent}%`,
                background: pctSpent > 85 ? 'linear-gradient(90deg,#f59e0b,#dc2626)' : 'linear-gradient(90deg,#34d399,#059669)',
                transition:'width 0.8s ease',
              }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
              <span style={{ fontSize:10, color:'var(--t3)' }}>₹0</span>
              <span style={{ fontSize:11, color:'var(--t3)', fontWeight:600 }}>{pctSpent.toFixed(0)}% of ₹{stats.received.toLocaleString('en-IN')} used</span>
              <span style={{ fontSize:10, color:'var(--t3)' }}>Budget</span>
            </div>
          </div>

          {/* ══ MONTH NAVIGATOR ══ */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, padding:'10px 14px', borderRadius:14, background:'#fff', boxShadow:'0 2px 10px rgba(0,0,0,0.06)', border:'1px solid var(--border)' }}>
            <button onClick={prevMonth} style={{ width:32, height:32, borderRadius:10, background:'var(--violet-light)', border:'none', color:'var(--violet)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <ChevronLeft size={17} />
            </button>
            <span style={{ fontWeight:800, fontSize:15, color:'var(--t1)', fontFamily:'var(--font-num)' }}>{monthLabel}</span>
            <button onClick={nextMonth} style={{ width:32, height:32, borderRadius:10, background:'var(--violet-light)', border:'none', color:'var(--violet)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <ChevronRight size={17} />
            </button>
          </div>

          {/* ══ TRANSACTION LIST ══ */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <span style={{ fontSize:16, fontWeight:800, color:'var(--t1)', letterSpacing:'-0.3px' }}>{t('Transactions')}</span>
            <span style={{ fontSize:12, color:'var(--violet)', background:'var(--violet-light)', padding:'4px 12px', borderRadius:999, fontWeight:700 }}>
              {monthTxs.length} {t('entries')}
            </span>
          </div>

          <div className="card" style={{ overflow:'hidden', marginBottom:20 }}>
            {monthTxs.length === 0 ? (
              <div style={{ padding:'48px 20px', textAlign:'center' }}>
                <div style={{ fontSize:44, marginBottom:12 }}>📭</div>
                <p style={{ fontWeight:700, fontSize:16, color:'var(--t1)' }}>{t('No entries yet')}</p>
                <p style={{ fontSize:13, color:'var(--t3)', marginTop:4 }}>Abhi koi entry nahi hai</p>
              </div>
            ) : monthTxs.map((tx, i) => (
              <React.Fragment key={tx.id}>
                <TransactionCard
                  tx={tx}
                  queries={queries[tx.id] || []}
                  onTap={setSelectedTx}
                  onFlag={setFlagTx}
                  isViewer={true}
                />
                {i < monthTxs.length - 1 && <div style={{ height:1, background:'var(--border)', margin:'0 16px' }} />}
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
