import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Shield, Trash2, Info } from 'lucide-react';

export default function Settings() {
  const { changePin, logout } = useAuth();
  const { clearAllData } = useData();
  const [form, setForm] = useState({ role: 'admin', oldPin: '', newPin: '', confirmPin: '' });
  const [msg, setMsg] = useState({ text: '', error: false });
  const [clearConfirm, setClearConfirm] = useState(false);

  async function handleChangePin() {
    if (form.newPin !== form.confirmPin) { setMsg({ text: 'New PINs do not match', error: true }); return; }
    if (form.newPin.length < 4) { setMsg({ text: 'PIN must be at least 4 digits', error: true }); return; }
    const result = await changePin(form.role, form.oldPin, form.newPin);
    if (result.ok) {
      setMsg({ text: 'PIN updated successfully! ✓', error: false });
      setForm(f => ({ ...f, oldPin: '', newPin: '', confirmPin: '' }));
    } else {
      setMsg({ text: result.error, error: true });
    }
  }

  function handleClear() {
    if (clearConfirm) { clearAllData(); logout(); }
    else setClearConfirm(true);
  }

  return (
    <div className="page">
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Settings</h1>

      {/* Change PIN */}
      <div className="glass" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <Shield size={20} color="var(--accent)" />
          <h2 style={{ fontWeight: 700, fontSize: 16 }}>Change PIN</h2>
        </div>

        <div className="input-group" style={{ marginBottom: 12 }}>
          <label>Change PIN for</label>
          <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
            <option value="admin">Admin (Student)</option>
            <option value="viewer">Viewer (Papa)</option>
          </select>
        </div>

        <div className="input-group" style={{ marginBottom: 12 }}>
          <label>Current PIN</label>
          <input className="input" type="password" inputMode="numeric" placeholder="••••" maxLength={6} value={form.oldPin} onChange={e => setForm(f => ({ ...f, oldPin: e.target.value }))} />
        </div>
        <div className="input-group" style={{ marginBottom: 12 }}>
          <label>New PIN</label>
          <input className="input" type="password" inputMode="numeric" placeholder="••••" maxLength={6} value={form.newPin} onChange={e => setForm(f => ({ ...f, newPin: e.target.value }))} />
        </div>
        <div className="input-group" style={{ marginBottom: 16 }}>
          <label>Confirm New PIN</label>
          <input className="input" type="password" inputMode="numeric" placeholder="••••" maxLength={6} value={form.confirmPin} onChange={e => setForm(f => ({ ...f, confirmPin: e.target.value }))} />
        </div>

        {msg.text && <p style={{ fontSize: 13, fontWeight: 600, color: msg.error ? 'var(--red)' : 'var(--green)', marginBottom: 12 }}>{msg.text}</p>}

        <button className="btn btn-primary btn-full" onClick={handleChangePin}>Update PIN</button>
      </div>

      {/* App Info */}
      <div className="glass" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <Info size={20} color="var(--accent)" />
          <h2 style={{ fontWeight: 700, fontSize: 16 }}>About</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[['App', 'Family Ledger (Hisab-Kitab)'], ['Version', '1.0.0'], ['Default Admin PIN', '1234'], ['Default Viewer PIN', '0000']].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{k}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass" style={{ padding: 20, border: '1.5px solid rgba(239,68,68,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <Trash2 size={20} color="var(--red)" />
          <h2 style={{ fontWeight: 700, fontSize: 16, color: 'var(--red)' }}>Danger Zone</h2>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>This will permanently delete all transactions and queries. This action cannot be undone.</p>
        <button className="btn btn-danger btn-full" onClick={handleClear}>
          {clearConfirm ? '⚠️ Are you sure? Tap again to confirm' : 'Clear All Data'}
        </button>
      </div>
    </div>
  );
}
