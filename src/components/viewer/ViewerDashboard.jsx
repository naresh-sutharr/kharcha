import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLang } from '../../context/LanguageContext';
import TransactionCard from '../shared/TransactionCard';
import ReceiptModal from '../shared/ReceiptModal';
import QueryDesk from './QueryDesk';
import { generateWhatsAppSummary } from '../../utils/export';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeft, ChevronRight, RefreshCcw, LogOut, Languages, ArrowDownLeft, ArrowUpRight, IndianRupee } from 'lucide-react';

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
  const monthLabel = new Date(viewYear, viewMonth).toLocaleString(
    lang === 'hi' ? 'hi-IN' : 'en-IN',
    { month: 'long', year: 'numeric' }
  );

  const pctSpent = stats.received > 0 ? Math.min((stats.spent / stats.received) * 100, 100) : 0;

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

  const greeting = now.getHours() < 12 ? 'Suprabhat' : now.getHours() < 17 ? 'Namaskar' : 'Shubh Sandhya';

  return (
    <>
      <div className="page" style={{ background: 'var(--mesh)', paddingTop: 0 }}>

        {/* ═══ PREMIUM HERO HEADER ═══ */}
        <div style={{
          background: 'linear-gradient(145deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
          padding: '52px 20px 100px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background orbs */}
          <div style={{ position:'absolute', top:-60, right:-60, width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,58,237,0.4) 0%, transparent 70%)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:-40, left:-40, width:160, height:160, borderRadius:'50%', background:'radial-gradient(circle, rgba(5,150,105,0.3) 0%, transparent 70%)', pointerEvents:'none' }} />

          {/* Topbar */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:32, position:'relative', zIndex:1 }}>
            <div>
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.55)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.18em', marginBottom:4 }}>{greeting} 🙏</p>
              <h1 style={{ fontSize:24, fontWeight:800, color:'#fff', fontFamily:'var(--font-num)', letterSpacing:'-0.5px' }}>Papa's Dashboard</h1>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => window.location.reload(true)} style={{ width:38, height:38, borderRadius:12, background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', backdropFilter:'blur(8px)' }}>
                <RefreshCcw size={15} />
              </button>
              <button onClick={toggleLanguage} style={{ height:38, padding:'0 14px', borderRadius:12, background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', color:'#fff', fontWeight:800, fontSize:14, cursor:'pointer', backdropFilter:'blur(8px)' }}>
                {lang === 'en' ? 'अ' : 'A'}
              </button>
              <button onClick={logout} style={{ height:38, padding:'0 14px', borderRadius:12, background:'rgba(239,68,68,0.2)', border:'1px solid rgba(239,68,68,0.35)', color:'#fca5a5', fontWeight:700, fontSize:12, cursor:'pointer', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', gap:6 }}>
                <LogOut size={13} /> Lock
              </button>
            </div>
          </div>

          {/* Balance Hero */}
          <div style={{ position:'relative', zIndex:1 }}>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.6)', fontWeight:600, marginBottom:6, letterSpacing:'0.05em' }}>
              {t('Remaining Balance')} — {monthLabel}
            </p>
            <div style={{ fontSize:44, fontWeight:900, color:'#fff', fontFamily:'var(--font-num)', lineHeight:1, letterSpacing:'-1px', marginBottom:20 }}>
              ₹{stats.balance.toLocaleString('en-IN')}
            </div>

            {/* Spending progress bar */}
            <div style={{ marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:11, color:'rgba(255,255,255,0.55)', fontWeight:600 }}>Spending</span>
                <span style={{ fontSize:11, color: pctSpent > 80 ? '#f87171' : '#34d399', fontWeight:700 }}>{pctSpent.toFixed(0)}% used</span>
              </div>
              <div style={{ width:'100%', height:6, background:'rgba(255,255,255,0.15)', borderRadius:999, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${pctSpent}%`, borderRadius:999, transition:'width 0.8s ease', background: pctSpent > 80 ? 'linear-gradient(90deg,#f59e0b,#ef4444)' : 'linear-gradient(90deg,#34d399,#059669)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* ═══ FLOAT-UP STAT CARDS ═══ */}
        <div style={{ padding:'0 16px', marginTop:-68, position:'relative', zIndex:2, marginBottom:20 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {/* Received */}
            <div style={{ background:'#fff', borderRadius:20, padding:'18px 16px', boxShadow:'0 8px 32px rgba(0,0,0,0.12)', border:'1px solid rgba(5,150,105,0.15)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ fontSize:11, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.08em' }}>{t('Received')}</span>
                <div style={{ width:32, height:32, borderRadius:10, background:'rgba(5,150,105,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <ArrowDownLeft size={16} color="#059669" />
                </div>
              </div>
              <div style={{ fontSize:22, fontWeight:800, color:'#059669', fontFamily:'var(--font-num)', letterSpacing:'-0.5px' }}>₹{stats.received.toLocaleString('en-IN')}</div>
              <div style={{ fontSize:11, color:'#9ca3af', marginTop:4, fontWeight:500 }}>{t('This month')}</div>
            </div>
            {/* Spent */}
            <div style={{ background:'#fff', borderRadius:20, padding:'18px 16px', boxShadow:'0 8px 32px rgba(0,0,0,0.12)', border:'1px solid rgba(225,29,72,0.15)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ fontSize:11, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.08em' }}>{t('Spent')}</span>
                <div style={{ width:32, height:32, borderRadius:10, background:'rgba(225,29,72,0.08)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <ArrowUpRight size={16} color="#e11d48" />
                </div>
              </div>
              <div style={{ fontSize:22, fontWeight:800, color:'#e11d48', fontFamily:'var(--font-num)', letterSpacing:'-0.5px' }}>₹{stats.spent.toLocaleString('en-IN')}</div>
              <div style={{ fontSize:11, color:'#9ca3af', marginTop:4, fontWeight:500 }}>{t('This month')}</div>
            </div>
          </div>
        </div>

        <div style={{ padding:'0 16px' }}>
          {/* ═══ MONTH NAVIGATOR ═══ */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, padding:'12px 16px', borderRadius:16, background:'#fff', boxShadow:'var(--shadow-sm)', border:'1px solid var(--border)' }}>
            <button onClick={prevMonth} style={{ width:34, height:34, borderRadius:10, background:'var(--violet-light)', border:'none', color:'var(--violet)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <ChevronLeft size={18} />
            </button>
            <span style={{ fontWeight:800, fontSize:15, color:'var(--t1)', fontFamily:'var(--font-num)' }}>{monthLabel}</span>
            <button onClick={nextMonth} style={{ width:34, height:34, borderRadius:10, background:'var(--violet-light)', border:'none', color:'var(--violet)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* ═══ WHATSAPP SHARE ═══ */}
          <button onClick={sendWhatsApp} style={{ width:'100%', background:'linear-gradient(135deg,#25D366,#128C7E)', color:'#fff', fontSize:15, fontWeight:700, padding:'15px 20px', marginBottom:20, borderRadius:16, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, boxShadow:'0 8px 24px rgba(37,211,102,0.3)', fontFamily:'var(--font)' }}>
            <span style={{ fontSize:20 }}>📤</span>
            {t('Send Summary on WhatsApp') || 'Send Summary on WhatsApp'}
          </button>

          {/* ═══ TRANSACTION LIST ═══ */}
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
                <TransactionCard tx={tx} queries={queries[tx.id] || []} onTap={setSelectedTx} onFlag={setFlagTx} isViewer={true} />
                {i < monthTxs.length - 1 && <div style={{ height:1, background:'var(--border)', margin:'0 16px' }} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {selectedTx && <ReceiptModal tx={selectedTx} onClose={() => setSelectedTx(null)} />}
      {flagTx && <QueryDesk tx={flagTx} onClose={() => setFlagTx(null)} />}
    </>
  );
}
