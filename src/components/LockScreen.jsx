import React, { useState, useCallback } from 'react';
import { Delete } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

export default function LockScreen({ role, onSuccess, onBack }) {
  const { t } = useLang();
  const [pin, setPin]       = useState('');
  const [error, setError]   = useState('');
  const [shake, setShake]   = useState(false);
  const [loading, setLoading] = useState(false);

  const handleKey = useCallback(async (key) => {
    if (loading) return;
    if (key === 'del') { setPin(p => p.slice(0, -1)); setError(''); return; }

    const newPin = pin + key;
    setPin(newPin);
    setError('');

    if (newPin.length >= 4) {
      setLoading(true);
      const ok = await onSuccess(newPin);
      setLoading(false);
      if (!ok) {
        setShake(true);
        setPin('');
        setError(t('Wrong PIN. Try again.'));
        setTimeout(() => setShake(false), 450);
      }
    }
  }, [pin, loading, onSuccess, t]);

  const keys = ['1','2','3','4','5','6','7','8','9','','0','del'];
  const isAdmin = role === 'admin';
  const grad = isAdmin
    ? 'linear-gradient(135deg,#7c3aed,#a855f7)'
    : 'linear-gradient(135deg,#059669,#34d399)';
  const glow = isAdmin ? 'rgba(124,58,237,0.3)' : 'rgba(5,150,105,0.25)';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 28,
      background: 'var(--mesh)',
      gap: 32,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 24,
          margin: '0 auto 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: grad, fontSize: 32,
          boxShadow: `0 12px 36px ${glow}`,
          transition: 'transform 0.2s',
          transform: loading ? 'scale(0.95)' : 'scale(1)',
        }}>
          {loading ? '⏳' : isAdmin ? '🔐' : '👁️'}
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--t1)', fontFamily: 'var(--font-num)', letterSpacing: '-0.5px' }}>
          {isAdmin ? 'Admin Access' : 'Papa — Viewer'}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--t3)', marginTop: 6, fontWeight: 500 }}>
          {loading ? 'Verifying…' : 'Enter your PIN to continue'}
        </p>
        {error && (
          <p style={{ fontSize: 13, color: 'var(--rose)', marginTop: 10, fontWeight: 600 }}>
            {error}
          </p>
        )}
      </div>

      {/* PIN Dots */}
      <div className={`pin-dots ${shake ? 'shake' : ''}`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`pin-dot ${i < pin.length ? 'filled' : ''}`}
            style={{ '--violet-glow': glow }}
          />
        ))}
      </div>

      {/* Keypad */}
      <div className="keypad">
        {keys.map((key, i) => {
          if (key === '') return <div key={i} className="key key-empty" />;
          if (key === 'del') return (
            <button key={i} className="key del" onClick={() => handleKey('del')} disabled={loading}>
              <Delete size={18} />
            </button>
          );
          return (
            <button
              key={i}
              className="key"
              onClick={() => handleKey(key)}
              disabled={pin.length >= 4 || loading}
            >
              {key}
            </button>
          );
        })}
      </div>

      <button
        className="btn btn-ghost btn-sm"
        onClick={onBack}
        style={{ marginTop: -8 }}
      >
        ← Back
      </button>
    </div>
  );
}
