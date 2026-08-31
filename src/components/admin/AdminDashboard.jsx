import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import AddEntryDrawer from './AddEntryDrawer';
import ReceiptModal from '../shared/ReceiptModal';
import TransactionCard from '../shared/TransactionCard';
import { formatCurrency } from '../../utils/export';
import { Bell, ChevronLeft, ChevronRight, Plus, ArrowDownLeft, ArrowUpRight, TrendingDown, TrendingUp, Wallet } from 'lucide-react';

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 600;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(step);
      else setDisplay(value);
    };
    requestAnimationFrame(step);
  }, [value]);
  return <span>₹{display.toLocaleString('en-IN')}</span>;
}

export default function AdminDashboard({ onTabChange }) {
  const { transactions, queries, getMonthTransactions, getCarryOverBalance, getStats, CATEGORIES } = useData();
  const { logout } = useAuth();
  const { t, lang } = useLang();
  
  const now = new Date();
  const [viewYear, setViewYear]   = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [filterCat, setFilterCat] = useState('all');
  const [selectedTx, setSelectedTx] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerType, setDrawerType] = useState(null);

  const carryOver = getCarryOverBalance(viewYear, viewMonth);
  const monthTxs  = getMonthTransactions(viewYear, viewMonth);
  const stats     = getStats(monthTxs);

  const totalAvailable = carryOver + stats.received;
  const currentBalance = totalAvailable - stats.spent;
  const prevMonthTxs = getMonthTransactions(viewYear === now.getFullYear() && viewMonth === 0 ? viewYear-1 : viewYear, viewMonth === 0 ? 11 : viewMonth-1);
  const prevStats = getStats(prevMonthTxs);
  const spentDiff = prevStats.spent > 0 ? (((stats.spent - prevStats.spent) / prevStats.spent) * 100).toFixed(0) : null;

  const CATS     = [{ id:'all', label:'All', emoji:'📋' }, ...CATEGORIES];
  const filtered = monthTxs.filter(t => filterCat === 'all' || t.category === filterCat);
  const recent   = filtered.slice(0, 5);

  const monthLabel = new Date(viewYear, viewMonth).toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-IN', { month: 'long', year: 'numeric' });
  const pendingQ   = Object.values(queries).flat().filter(q => q.from === 'viewer').length;

  const pctSpent  = totalAvailable > 0 ? Math.min((stats.spent / totalAvailable) * 100, 100) : 0;
  const pctLeft   = 100 - pctSpent;

  function prevMonth() { if (viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1); }
  function nextMonth() { if (viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1); }

  const greeting = now.getHours() < 12 ? t('Good Morning') : now.getHours() < 17 ? t('Good Afternoon') : t('Good Evening');

  return (
    <>
      <div className="page">
        {/* ═══ HERO STRIP ═══ */}
        <div className="page-hero">
          {/* Top bar */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, position:'relative', zIndex:1 }}>
            <div>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.65)', fontWeight:500, marginBottom:2 }}>{greeting} 👋</p>
              <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', letterSpacing:'-0.4px', fontFamily:'var(--font-num)' }}>Hisab-Kitab</h1>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              {pendingQ > 0 && (
                <button onClick={()=>onTabChange('queries')} className="btn-icon" style={{ background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.3)', color:'#fff', position:'relative' }}>
                  <Bell size={17} />
                  <span style={{ position:'absolute', top:-4, right:-4, width:17, height:17, borderRadius:'50%', background:'#ef4444', fontSize:9, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid white' }}>{pendingQ}</span>
                </button>
              )}
              <button onClick={logout} className="btn-icon" style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)', color:'#fff', fontSize:12, padding:'8px 14px', borderRadius:10, fontFamily:'var(--font)', fontWeight:600 }}>
                {t('Lock')}
              </button>
            </div>
          </div>

          {/* Balance Hero Card */}
          <div className="page-hero-card" style={{ position:'relative', zIndex:1 }}>
            <p style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.65)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>Remaining Balance</p>
            <div style={{ fontSize:38, fontWeight:800, color:'#fff', fontFamily:'var(--font-num)', letterSpacing:'-1px', lineHeight:1 }}>
              <AnimatedNumber value={currentBalance} />
            </div>

            {/* Progress bar */}
            <div style={{ marginTop:14, marginBottom:10 }}>
              <div style={{ width:'100%', height:5, background:'rgba(255,255,255,0.2)', borderRadius:999, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${pctLeft}%`, background:'rgba(255,255,255,0.85)', borderRadius:999, transition:'width 0.8s var(--ease)' }} />
              </div>
            </div>

            {/* Quick stats row */}
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <div className="stat-pill"><ArrowDownLeft size={11}/> Rcvd ₹{stats.received.toLocaleString('en-IN')}</div>
              {carryOver > 0 && <div className="stat-pill">👛 Last Month ₹{carryOver.toLocaleString('en-IN')}</div>}
              <div className="stat-pill"><ArrowUpRight size={11}/> Spent ₹{stats.spent.toLocaleString('en-IN')}</div>
              {stats.fixed > 0 && <div className="stat-pill" style={{ background:'rgba(2,132,199,0.3)', borderColor:'rgba(2,132,199,0.4)' }}>🏠 Fixed ₹{stats.fixed.toLocaleString('en-IN')}</div>}
              {spentDiff !== null && (
                <div className="stat-pill" style={{ background: Number(spentDiff)>0 ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)' }}>
                  {Number(spentDiff)>0 ? '↑' : '↓'} {Math.abs(spentDiff)}% vs last month
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══ QUICK ACTIONS ═══ */}
        <div style={{ padding:'0 16px', marginTop:16, marginBottom:16 }}>
          <div style={{ display:'flex', gap:10 }}>
            <button className="qa-btn" onClick={()=>{ setDrawerType('credit'); setShowDrawer(true); }}>
              <div className="qa-icon" style={{ background:'rgba(5,150,105,0.1)' }}>💰</div>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--t1)' }}>{t("Received")}</span>
              <span style={{ fontSize:10, color:'var(--t3)', fontWeight:500 }}>{t("from Papa")}</span>
            </button>
            <button className="qa-btn" onClick={()=>{ setDrawerType('debit'); setShowDrawer(true); }}>
              <div className="qa-icon" style={{ background:'rgba(225,29,72,0.08)' }}>💸</div>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--t1)' }}>{t("Expense")}</span>
              <span style={{ fontSize:10, color:'var(--t3)', fontWeight:500 }}>{t("add spending")}</span>
            </button>
            <button className="qa-btn" onClick={()=>onTabChange('transactions')}>
              <div className="qa-icon" style={{ background:'rgba(124,58,237,0.08)' }}>📋</div>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--t1)' }}>{t("Records")}</span>
              <span style={{ fontSize:10, color:'var(--t3)', fontWeight:500 }}>{t("all entries")}</span>
            </button>
          </div>
        </div>

        <div className="page-inner">
          {/* ═══ PAPA ALERT ═══ */}
          {pendingQ > 0 && (
            <button onClick={()=>onTabChange('queries')} style={{
              display:'flex', alignItems:'center', gap:12, width:'100%',
              padding:'13px 16px', marginBottom:16, borderRadius:'var(--r)',
              background:'rgba(239,68,68,0.07)', border:'1.5px solid rgba(239,68,68,0.2)',
              cursor:'pointer', textAlign:'left',
            }}>
              <span style={{ fontSize:22 }}>🔔</span>
              <div>
                <div style={{ fontWeight:700, fontSize:13.5, color:'var(--rose)' }}>{pendingQ} {t(pendingQ>1?'questions from Papa':'question from Papa')}</div>
                <div style={{ fontSize:11, color:'var(--t3)', marginTop:1 }}>{t("Tap to view & reply →")}</div>
              </div>
            </button>
          )}

          {/* ═══ HEALTH BAR ═══ */}
          <div className="card" style={{ padding:'15px 18px', marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <span style={{ fontSize:13, fontWeight:700, color:'var(--t1)' }}>{t("Spending Health")}</span>
              <span style={{ fontSize:11, fontWeight:700,
                color: pctSpent>85?'var(--rose)': pctSpent>60?'var(--amber)':'var(--emerald)',
                background: pctSpent>85?'var(--rose-bg)': pctSpent>60?'var(--amber-bg)':'var(--emerald-bg)',
                padding:'3px 10px', borderRadius:999,
                border: `1px solid ${pctSpent>85?'var(--rose-bdr)':pctSpent>60?'var(--amber-bdr)':'var(--emerald-bdr)'}`,
              }}>
                {pctSpent>85?t('⚠ Over Budget'):pctSpent>60?t('↑ High'):t('✓ On Track')}
              </span>
            </div>
            <div className="health-bar-track">
              <div className="health-bar-fill" style={{ width:`${pctSpent}%`,
                background:`linear-gradient(90deg, var(--emerald), ${pctSpent>85?'var(--rose)':pctSpent>60?'var(--amber)':'var(--emerald-2)'})`,
              }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:7 }}>
              <span style={{ fontSize:10.5, color:'var(--t3)' }}>₹0</span>
              <span style={{ fontSize:11, color:'var(--t3)', fontWeight:600 }}>{pctSpent.toFixed(0)}% {t('used')} (₹{totalAvailable.toLocaleString('en-IN')})</span>
              <span style={{ fontSize:10.5, color:'var(--t3)' }}>{t("Budget")}</span>
            </div>
          </div>

          {/* ═══ MONTH NAVIGATOR ═══ */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, padding:'10px 14px', borderRadius:'var(--r)', background:'var(--surface)', border:'1px solid var(--border)', boxShadow:'var(--shadow-sm)' }}>
            <button className="btn-icon" onClick={prevMonth} style={{ padding:6, boxShadow:'none' }}><ChevronLeft size={16}/></button>
            <span style={{ fontWeight:700, fontSize:14, color:'var(--t1)', letterSpacing:'-0.2px' }}>{monthLabel}</span>
            <button className="btn-icon" onClick={nextMonth} style={{ padding:6, boxShadow:'none' }} disabled={viewYear===now.getFullYear()&&viewMonth===now.getMonth()}><ChevronRight size={16}/></button>
          </div>

          {/* ═══ CATEGORY FILTER ═══ */}
          <div className="chip-row" style={{ marginBottom:14 }}>
            {CATS.map(c=>(
              <button key={c.id} className={`chip ${filterCat===c.id?'active':''}`} onClick={()=>setFilterCat(c.id)}>
                {c.emoji} {t(c.label)}
              </button>
            ))}
          </div>

          {/* ═══ TRANSACTION LIST ═══ */}
          <div className="section-header">
            <span className="section-title">{t("Transactions")}</span>
            <span style={{ fontSize:11, color:'var(--t3)', fontWeight:600, background:'var(--violet-light)', padding:'3px 10px', borderRadius:999, color:'var(--violet)' }}>{filtered.length} {t("entries")}</span>
          </div>

          <div className="card" style={{ overflow:'hidden' }}>
            {filtered.length === 0 ? (
              <div style={{ padding:'48px 20px', textAlign:'center' }}>
                <div style={{ fontSize:42, marginBottom:10 }}>📭</div>
                <p style={{ fontWeight:700, fontSize:15, color:'var(--t1)' }}>{t("No entries yet")}</p>
                <p style={{ fontSize:13, color:'var(--t3)', marginTop:4 }}>{t("Use the quick actions above to add one")}</p>
              </div>
            ) : filtered.map((tx,i)=>(
              <React.Fragment key={tx.id}>
                <TransactionCard tx={tx} queries={queries[tx.id]||[]} onTap={setSelectedTx} isViewer={false}/>
                {i<filtered.length-1 && <div style={{ height:1, background:'var(--border)', margin:'0 16px' }}/>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* FAB */}
      <button className="fab" onClick={()=>{setDrawerType(null);setShowDrawer(true);}} aria-label="Add">
        <Plus size={24}/>
      </button>

      {selectedTx && <ReceiptModal tx={selectedTx} onClose={()=>setSelectedTx(null)}/>}
      {showDrawer  && <AddEntryDrawer onClose={()=>{setShowDrawer(false);setDrawerType(null);}} defaultType={drawerType}/>}
    </>
  );
}
