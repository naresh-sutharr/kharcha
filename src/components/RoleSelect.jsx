import React, { useState } from 'react';
import { ShieldCheck, Eye } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';

export default function RoleSelect({ onSelectRole }) {
  const { t } = useLang();
  const [hovered, setHovered] = useState(null);

  const cards = [
    {
      role: 'admin',
      icon: <ShieldCheck size={24} />,
      title: 'Admin',
      sub: t('Manage entries, expenses & settings'),
      grad: 'linear-gradient(135deg,#7c3aed,#a855f7)',
      glow: 'rgba(124,58,237,0.25)',
      light: 'rgba(124,58,237,0.07)',
      border: 'rgba(124,58,237,0.18)',
      color: '#7c3aed',
    },
    {
      role: 'viewer',
      icon: <Eye size={24} />,
      title: t('Papa — Viewer'),
      sub: t('View spending, charts & ask questions'),
      grad: 'linear-gradient(135deg,#059669,#34d399)',
      glow: 'rgba(5,150,105,0.22)',
      light: 'rgba(5,150,105,0.07)',
      border: 'rgba(5,150,105,0.18)',
      color: '#059669',
    },
  ];

  return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', padding:'32px 20px',
      background:'var(--mesh)', gap:36, position:'relative', overflow:'hidden',
    }}>
      {/* Logo */}
      <div style={{ textAlign:'center' }}>
        <img src="/logo.jpeg" alt="Hisab-Kitab" style={{
          width: 86, height: 86, borderRadius: 26, margin: '0 auto 18px',
          boxShadow: '0 12px 36px rgba(124,58,237,0.35)', objectFit: 'cover'
        }} />
        <h1 style={{ fontSize:30, fontWeight:900, color:'var(--t1)', fontFamily:'var(--font-num)', letterSpacing:'-1px', lineHeight:1 }}>
          Hisab-Kitab
        </h1>
        <p style={{ fontSize:13, color:'var(--t3)', marginTop:8, fontWeight:500 }}>
          Family Ledger · {t('Choose your role')}
        </p>
      </div>

      {/* Cards */}
      <div style={{ width:'100%', maxWidth:340, display:'flex', flexDirection:'column', gap:12 }}>
        {cards.map(c => {
          const isH = hovered === c.role;
          return (
            <button
              key={c.role}
              onClick={() => onSelectRole(c.role)}
              onMouseEnter={() => setHovered(c.role)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display:'flex', alignItems:'center', gap:16, padding:'18px 18px',
                borderRadius:18, cursor:'pointer', textAlign:'left', width:'100%',
                background: isH ? c.light : 'rgba(255,255,255,0.85)',
                border:`1.5px solid ${isH ? c.border : 'rgba(0,0,0,0.06)'}`,
                backdropFilter:'blur(20px)',
                boxShadow: isH ? `0 10px 32px ${c.glow}` : 'var(--shadow)',
                transition:'all 0.2s var(--ease)',
              }}
            >
              <div style={{
                width:50, height:50, borderRadius:14, flexShrink:0,
                display:'flex', alignItems:'center', justifyContent:'center',
                background: isH ? c.grad : c.light,
                color: isH ? '#fff' : c.color,
                border:`1px solid ${c.border}`,
                transition:'all 0.2s var(--ease)',
                boxShadow: isH ? `0 4px 16px ${c.glow}` : 'none',
              }}>{c.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15.5, fontWeight:800, color:'var(--t1)', fontFamily:'var(--font-num)', letterSpacing:'-0.3px' }}>{c.title}</div>
                <div style={{ fontSize:12, color:'var(--t3)', marginTop:3, fontWeight:500 }}>{c.sub}</div>
              </div>
              <span style={{ fontSize:18, color:isH?c.color:'var(--t4)', transition:'transform 0.2s var(--ease)', transform:isH?'translateX(3px)':'none' }}>›</span>
            </button>
          );
        })}
      </div>

      {/* Bottom note */}
      <p style={{ fontSize:11, color:'var(--t3)', textAlign:'center', fontWeight:500 }}>
        🔐 {t('Secured with PIN · Auto-locks after 3 min')}
      </p>
    </div>
  );
}
