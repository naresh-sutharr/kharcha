import React from 'react';
import { X, Receipt } from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '../../utils/export';
import { CATEGORIES } from '../../context/DataContext';

export default function ReceiptModal({ tx, onClose }) {
  if (!tx) return null;
  const cat = CATEGORIES.find(c => c.id === tx.category) || CATEGORIES[CATEGORIES.length - 1];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 17 }}>Transaction Details</h3>
          <button className="btn-icon" onClick={onClose} style={{ padding: 6 }}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Amount */}
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: tx.type === 'credit' ? 'var(--green)' : 'var(--red)' }}>
              {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              {tx.type === 'credit' ? 'Received from Papa' : cat.label}
            </div>
          </div>

          <div className="divider" style={{ margin: '4px 0' }} />

          {[
            ['Category', `${cat.emoji} ${cat.label}`],
            ['Date', formatDate(tx.date)],
            ['Time', tx.time],
            ['Note', tx.note || '—'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{k}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', maxWidth: '60%', textAlign: 'right' }}>{v}</span>
            </div>
          ))}

          {tx.receipt && (
            <div style={{ marginTop: 8 }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Receipt size={14} /> Receipt
              </p>
              <img src={tx.receipt} alt="Receipt" className="receipt-img" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
