import React from 'react';
import { formatCurrency, formatDate } from '../../utils/export';
import { MessageCircle, Receipt } from 'lucide-react';
import { CATEGORIES } from '../../context/DataContext';
import { useLang } from '../../context/LanguageContext';

export default function TransactionCard({ tx, queries = [], onTap, onFlag, isViewer }) {
  const { lang, t } = useLang();
  const cat = CATEGORIES.find(c => c.id === tx.category) || CATEGORIES[CATEGORIES.length - 1];
  const isCredit = tx.type === 'credit';
  const hasQuery = queries.length > 0;
  const unanswered = hasQuery && queries.some(q => q.from === 'viewer' && !queries.find(r => r.from === 'admin' && r.time > q.time));

  const displayNote = lang === 'hi' && tx.note_hi ? tx.note_hi : tx.note;
  const title = isCredit ? t("Received from Papa") : (displayNote || t(cat.label));

  return (
    <div
      className={`tx-card ${isCredit ? 'credit' : 'debit'}`}
      onClick={() => onTap && onTap(tx)}
    >
      {/* Icon */}
      <div className="tx-icon" style={{
        background: isCredit ? 'var(--emerald-bg)' : 'rgba(0,0,0,0.04)',
        border: `1px solid ${isCredit ? 'var(--emerald-bdr)' : 'rgba(0,0,0,0.06)'}`,
      }}>
        <span>{isCredit ? '💰' : cat.emoji}</span>
      </div>

      {/* Info */}
      <div className="tx-info">
        <div className="tx-title">{title}</div>
        <div className="tx-meta">
          <span>{formatDate(tx.date)}</span>
          <span style={{ margin:'0 4px' }}>·</span>
          <span style={{ background: isCredit ? 'var(--emerald-bg)' : 'var(--rose-bg)', color: isCredit ? 'var(--emerald)' : 'var(--rose)', padding:'1px 7px', borderRadius:999, fontWeight:600 }}>
            {t(isCredit ? cat.label !== 'Misc' ? cat.label : 'Credit' : cat.label)}
          </span>
          {tx.receipt && <><span style={{ margin:'0 4px' }}>·</span><Receipt size={10} style={{ display:'inline', verticalAlign:'middle', color:'var(--violet)' }}/></>}
        </div>
      </div>

      {/* Amount + actions */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
        <span className={`tx-amount ${isCredit ? 'credit' : 'debit'}`}>
          {isCredit ? '+' : '−'}{formatCurrency(tx.amount)}
        </span>
        {isViewer ? (
          <button
            onClick={e => { e.stopPropagation(); onFlag && onFlag(tx); }}
            style={{ fontSize:11, color:'var(--violet)', background:'var(--violet-light)', border:'1px solid rgba(124,58,237,0.15)', borderRadius:8, padding:'3px 8px', cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontFamily:'var(--font)', fontWeight:600 }}
          >
            <MessageCircle size={11}/> {hasQuery ? queries.length : t('Ask')}
          </button>
        ) : hasQuery && (
          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background: unanswered ? 'var(--rose)' : 'var(--emerald)' }}/>
            <span style={{ fontSize:10.5, color:'var(--t3)', fontWeight:600 }}>{queries.length}</span>
          </div>
        )}
      </div>
    </div>
  );
}
