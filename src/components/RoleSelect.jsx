import React, { useState } from 'react';
import { ShieldCheck, Eye, Lock } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

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
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', background: '#09090b' }}>
      
      {/* Hero Image Section */}
      <div style={{ 
        position: 'absolute', top: 0, left: 0, right: 0, height: '60vh',
        backgroundImage: 'url(/hero.png)', backgroundSize: 'cover', backgroundPosition: 'center',
        animation: 'fadeIn 0.8s ease-out'
      }}>
        {/* Soft gradient overlay so the bottom sheet blends smoothly */}
        <div style={{ 
          position: 'absolute', inset: 0, 
          background: 'linear-gradient(to bottom, rgba(9,9,11,0) 40%, rgba(9,9,11,1) 100%)' 
        }} />
      </div>

      {/* Bottom Sheet Section */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'rgba(255, 255, 255, 0.96)', 
        backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
        borderRadius: '32px 32px 0 0', padding: '36px 24px 48px',
        borderTop: '1px solid rgba(255,255,255,0.8)',
        boxShadow: '0 -20px 60px rgba(0,0,0,0.2)',
        animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex', flexDirection: 'column', gap: '28px'
      }}>
        
        {/* Header with mini logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src="/logo.jpeg" alt="Logo" style={{
            width: 52, height: 52, borderRadius: 16,
            boxShadow: '0 8px 20px rgba(124,58,237,0.25)', objectFit: 'cover'
          }} />
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--t1)', fontFamily: 'var(--font-num)', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
              Hisab-Kitab
            </h1>
            <p style={{ fontSize: 13, color: 'var(--t3)', marginTop: 4, fontWeight: 500 }}>
              {t('Manage Family Finances Transparently')}
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6, marginLeft: 4 }}>
            {t('Choose your role')}
          </h2>
          
          {cards.map(c => {
            const isH = hovered === c.role;
            return (
              <button
                key={c.role}
                onClick={() => onSelectRole(c.role)}
                onMouseEnter={() => setHovered(c.role)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '18px',
                  borderRadius: 22, cursor: 'pointer', textAlign: 'left', width: '100%',
                  background: isH ? c.light : '#fff',
                  border: `1.5px solid ${isH ? c.border : 'rgba(0,0,0,0.06)'}`,
                  boxShadow: isH ? `0 8px 24px ${c.glow}` : '0 4px 12px rgba(0,0,0,0.03)',
                  transition: 'all 0.25s var(--ease)',
                }}
              >
                <div style={{
                  width: 50, height: 50, borderRadius: 16, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isH ? c.grad : c.light,
                  color: isH ? '#fff' : c.color,
                  border: `1px solid ${c.border}`,
                  transition: 'all 0.25s var(--ease)',
                }}>{c.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--t1)', fontFamily: 'var(--font-num)', letterSpacing: '-0.3px' }}>{c.title}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--t3)', marginTop: 2, fontWeight: 500 }}>{c.sub}</div>
                </div>
                <span style={{ fontSize: 22, color: isH ? c.color : 'var(--t4)', transition: 'transform 0.25s var(--ease)', transform: isH ? 'translateX(4px)' : 'none' }}>›</span>
              </button>
            );
          })}
        </div>

        {/* Security Note */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 }}>
          <Lock size={12} color="var(--t3)" />
          <p style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 600 }}>
            {t('Secured with PIN · Auto-locks after 3 min')}
          </p>
        </div>

      </div>
    </div>
  );
}
