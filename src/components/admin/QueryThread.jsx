import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { formatDate, formatCurrency } from '../../utils/export';
import { CATEGORIES } from '../../context/DataContext';
import { Send, MessageCircle } from 'lucide-react';

export default function QueryThread() {
  const { transactions, queries, addQuery } = useData();
  const [replyText, setReplyText] = useState({});

  const txsWithQueries = transactions.filter(t => (queries[t.id] || []).length > 0);

  function sendReply(txId) {
    const text = replyText[txId]?.trim();
    if (!text) return;
    addQuery(txId, 'admin', text);
    setReplyText(r => ({ ...r, [txId]: '' }));
  }

  return (
    <div className="page">
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Papa's Questions</h1>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Reply to queries on your transactions</p>

      {txsWithQueries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <p style={{ fontWeight: 700, fontSize: 16 }}>No queries yet!</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Papa hasn't asked any questions</p>
        </div>
      ) : (
        txsWithQueries.map(tx => {
          const cat = CATEGORIES.find(c => c.id === tx.category) || CATEGORIES[CATEGORIES.length - 1];
          const thread = queries[tx.id] || [];
          return (
            <div key={tx.id} className="glass" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
              {/* Transaction Header */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{cat.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{tx.note || cat.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(tx.date)}</div>
                  </div>
                </div>
                <span style={{ fontWeight: 800, fontSize: 15, color: tx.type === 'credit' ? 'var(--green)' : 'var(--red)' }}>
                  {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
              </div>

              {/* Chat Thread */}
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {thread.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.from === 'admin' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>
                      {msg.from === 'admin' ? '🎓 You' : '👨‍💼 Papa'}
                    </div>
                    <div className={`query-bubble ${msg.from}`}>{msg.text}</div>
                  </div>
                ))}
              </div>

              {/* Reply Input */}
              <div style={{ padding: '0 16px 16px', display: 'flex', gap: 8 }}>
                <input
                  className="input"
                  placeholder="Type your reply..."
                  value={replyText[tx.id] || ''}
                  onChange={e => setReplyText(r => ({ ...r, [tx.id]: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && sendReply(tx.id)}
                  style={{ flex: 1 }}
                />
                <button className="btn btn-primary btn-sm" onClick={() => sendReply(tx.id)} style={{ padding: '10px 14px' }}>
                  <Send size={15} />
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
