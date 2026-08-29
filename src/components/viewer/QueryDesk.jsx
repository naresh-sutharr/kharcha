import React, { useState } from 'react';
import { useData, CATEGORIES } from '../../context/DataContext';
import { formatDate, formatCurrency } from '../../utils/export';
import { X, Send } from 'lucide-react';

export default function QueryDesk({ tx, onClose }) {
  const { queries, addQuery } = useData();
  const [text, setText] = useState('');
  const thread = queries[tx?.id] || [];
  const cat = tx ? (CATEGORIES.find(c => c.id === tx.category) || CATEGORIES[CATEGORIES.length - 1]) : null;

  function sendQuery() {
    if (!text.trim()) return;
    addQuery(tx.id, 'viewer', text.trim());
    setText('');
  }

  if (!tx) return null;
  return (
    <div className="overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()} style={{ maxHeight: '85vh' }}>
        <div className="drawer-handle" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: 17 }}>Ask a Question</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>About: {tx.note || cat?.label} · {formatCurrency(tx.amount)}</p>
          </div>
          <button className="btn-icon" onClick={onClose} style={{ padding: 6 }}><X size={18} /></button>
        </div>

        {/* Thread */}
        <div style={{ minHeight: 100, maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16, padding: '4px 0' }}>
          {thread.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0', fontSize: 14 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
              Ask something about this expense
            </div>
          ) : (
            thread.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.from === 'viewer' ? 'flex-end' : 'flex-start' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>
                  {msg.from === 'viewer' ? '👨‍💼 You (Papa)' : '🎓 Student'}
                </div>
                <div className={`query-bubble ${msg.from}`}>{msg.text}</div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="input"
            placeholder="Ye kis cheez ka payment tha?"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendQuery()}
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary" onClick={sendQuery} style={{ padding: '12px 16px' }}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
