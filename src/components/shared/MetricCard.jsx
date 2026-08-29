import React from 'react';
import { formatCurrency } from '../../utils/export';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';

export default function MetricCard({ label, value, sub, type, className = '' }) {
  const { t } = useLang();
  const cfg = {
    received: { color:'var(--emerald)',  bg:'var(--emerald-bg)', Icon:TrendingUp  },
    spent:    { color:'var(--rose)',     bg:'var(--rose-bg)',    Icon:TrendingDown },
    balance:  { color:'var(--violet)',   bg:'var(--violet-light)',Icon:Wallet      },
  };
  const c = cfg[type] || cfg.balance;
  return (
    <div className={`card metric-card ${className}`}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
        <span className="metric-label">{t(label)}</span>
        <div className="metric-icon" style={{ background:c.bg }}>
          <c.Icon size={15} color={c.color} />
        </div>
      </div>
      <div className="metric-value" style={{ color:c.color }}>{formatCurrency(value)}</div>
      {sub && <div className="metric-sub">{t(sub)}</div>}
    </div>
  );
}
