import React from 'react';

export default function HealthBar({ spent, received }) {
  const pct = received > 0 ? Math.min((spent / received) * 100, 100) : 0;
  const color = pct > 85 ? 'var(--rose)' : pct > 60 ? 'var(--amber)' : 'var(--emerald)';
  const label = pct > 85 ? '⚠ Critical' : pct > 60 ? '↑ High' : '✓ On Track';
  return (
    <div className="card" style={{ padding:'15px 18px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <span style={{ fontSize:13, fontWeight:700, color:'var(--t1)' }}>Spending Health</span>
        <span style={{ fontSize:11, fontWeight:700, color, background:`${color}18`, padding:'3px 10px', borderRadius:999, border:`1px solid ${color}30` }}>{label}</span>
      </div>
      <div className="health-bar-track">
        <div className="health-bar-fill" style={{ width:`${pct}%`, background:`linear-gradient(90deg, var(--emerald), ${color})` }}/>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:7 }}>
        <span style={{ fontSize:10.5, color:'var(--t3)' }}>₹0</span>
        <span style={{ fontSize:11, color:'var(--t3)', fontWeight:600 }}>{pct.toFixed(0)}% used</span>
        <span style={{ fontSize:10.5, color:'var(--t3)' }}>Budget</span>
      </div>
    </div>
  );
}
