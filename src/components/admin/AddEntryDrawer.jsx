import React, { useState, useRef } from 'react';
import { useData, CATEGORIES } from '../../context/DataContext';
import { X, Camera, Trash2 } from 'lucide-react';

const MAX_RECEIPT_SIZE = 500 * 1024; // 500KB

export default function AddEntryDrawer({ onClose, editTx, defaultType }) {
  const { addTransaction, editTransaction } = useData();
  const [type, setType] = useState(editTx?.type || defaultType || 'debit');
  const [amount, setAmount] = useState(editTx?.amount?.toString() || '');
  const [category, setCategory] = useState(editTx?.category || 'food');
  const [note, setNote] = useState(editTx?.note || '');
  const [date, setDate] = useState(editTx?.date || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(editTx?.time || new Date().toTimeString().slice(0, 5));
  const [receipt, setReceipt] = useState(editTx?.receipt || null);
  const [error, setError] = useState('');
  const fileRef = useRef();

  function handleReceipt(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_RECEIPT_SIZE) { setError('Receipt image too large (max 500KB)'); return; }
    const reader = new FileReader();
    reader.onload = ev => setReceipt(ev.target.result);
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { setError('Please enter a valid amount'); return; }
    const data = { type, amount: Number(amount), category: type === 'credit' ? 'misc' : category, note, date, time, receipt };
    if (editTx) editTransaction(editTx.id, data);
    else addTransaction(data);
    onClose();
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-handle" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontWeight: 800, fontSize: 18 }}>{editTx ? 'Edit Entry' : 'New Entry'}</h2>
          <button className="btn-icon" onClick={onClose} style={{ padding: 6 }}><X size={18} /></button>
        </div>

        {/* Type Toggle */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
          {[['debit', '💸 Expense'], ['credit', '💰 Received from Papa']].map(([t, label]) => (
            <button key={t} className="btn" onClick={() => setType(t)} style={{
              background: type === t ? (t === 'credit' ? 'var(--green)' : 'var(--red)') : 'var(--glass-bg)',
              color: type === t ? '#fff' : 'var(--text-secondary)',
              border: '1.5px solid var(--border)', padding: '12px 8px', fontSize: 13,
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div className="input-group" style={{ marginBottom: 16 }}>
          <label>Amount (₹)</label>
          <input className="input" type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} inputMode="decimal" style={{ fontSize: 24, fontWeight: 700 }} />
        </div>

        {/* Category (debit only) */}
        {type === 'debit' && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Category</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CATEGORIES.map(c => (
                <button key={c.id} className={`chip ${category === c.id ? 'active' : ''}`} onClick={() => setCategory(c.id)}>
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Note */}
        <div className="input-group" style={{ marginBottom: 16 }}>
          <label>Note / Description</label>
          <textarea className="input" placeholder="What was this for?" value={note} onChange={e => setNote(e.target.value)} rows={2} />
        </div>

        {/* Date + Time */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div className="input-group">
            <label>Date</label>
            <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Time</label>
            <input className="input" type="time" value={time} onChange={e => setTime(e.target.value)} />
          </div>
        </div>

        {/* Receipt Upload */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Receipt / Bill (optional)</label>
          {receipt ? (
            <div style={{ position: 'relative' }}>
              <img src={receipt} alt="Receipt" className="receipt-img" />
              <button className="btn-icon" onClick={() => setReceipt(null)} style={{ position: 'absolute', top: 8, right: 8, background: 'var(--red)', color: '#fff', border: 'none', padding: 6, borderRadius: 8 }}>
                <Trash2 size={14} />
              </button>
            </div>
          ) : (
            <button className="btn btn-ghost w-full" onClick={() => fileRef.current?.click()} style={{ gap: 8 }}>
              <Camera size={16} /> Attach Receipt
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleReceipt} style={{ display: 'none' }} />
        </div>

        {error && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12, fontWeight: 500 }}>{error}</p>}

        <button className="btn btn-primary btn-full" onClick={handleSave} style={{ fontSize: 16 }}>
          {editTx ? 'Save Changes' : 'Add Entry ✓'}
        </button>
      </div>
    </div>
  );
}
