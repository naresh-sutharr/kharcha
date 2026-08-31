import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import TransactionCard from '../shared/TransactionCard';
import ReceiptModal from '../shared/ReceiptModal';
import AddEntryDrawer from './AddEntryDrawer';
import { Plus, Trash2, Edit2 } from 'lucide-react';

import { useLang } from '../../context/LanguageContext';

export default function TransactionFeed({ isViewer = false, isFixedOnly = false }) {
  const { transactions, queries, deleteTransaction, CATEGORIES } = useData();
  const { t } = useLang();
  const [filterCat, setFilterCat] = useState('all');
  const [filterType, setFilterType] = useState(isFixedOnly ? 'fixed' : 'all');
  const [selectedTx, setSelectedTx] = useState(null);
  const [editTx, setEditTx] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const CATS = [{ id: 'all', label: 'All', emoji: '📋' }, ...CATEGORIES];

  const filtered = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterCat !== 'all' && t.category !== filterCat) return false;
    return true;
  });

  function handleDelete(tx) {
    if (confirmDelete === tx.id) { deleteTransaction(tx.id); setConfirmDelete(null); }
    else setConfirmDelete(tx.id);
  }

  return (
    <>
      <div className="page" style={isViewer ? { paddingTop: 20 } : {}}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>{isFixedOnly ? t("Rent & Fees") : t("All Records")}</h1>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{filtered.length} {t("entries")}</span>
        </div>

        {/* Type Filter */}
        {!isFixedOnly && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {[['all','All'],['credit','Received'],['debit','Expense']].map(([v,l]) => (
              <button key={v} className={`chip ${filterType === v ? 'active' : ''}`} onClick={() => setFilterType(v)}>{t(l)}</button>
            ))}
          </div>
        )}

        {/* Category Filter */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 16 }}>
          {CATS.map(c => (
            <button key={c.id} className={`chip ${filterCat === c.id ? 'active' : ''}`} onClick={() => setFilterCat(c.id)} style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
              {c.emoji} {t(c.label)}
            </button>
          ))}
        </div>

        <div className="glass" style={{ overflow: 'hidden', marginBottom: 20 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
              <p style={{ fontWeight: 600 }}>{t("No transactions found")}</p>
            </div>
          ) : (
            filtered.map((tx, i) => (
              <React.Fragment key={tx.id}>
                <div style={{ position: 'relative' }}>
                  <TransactionCard tx={tx} queries={queries[tx.id] || []} onTap={setSelectedTx} isViewer={isViewer} />
                  {/* Edit/Delete Actions */}
                  {!isViewer && (
                    <div style={{ display: 'flex', gap: 6, padding: '0 16px 12px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setEditTx(tx); setShowDrawer(true); }} style={{ gap: 4, padding: '6px 12px', fontSize: 12 }}>
                        <Edit2 size={12} /> {t("Edit")}
                      </button>
                      <button className="btn btn-sm" onClick={() => handleDelete(tx)} style={{
                        gap: 4, padding: '6px 12px', fontSize: 12,
                        background: confirmDelete === tx.id ? 'var(--red)' : 'var(--red-bg)',
                        color: confirmDelete === tx.id ? '#fff' : 'var(--red)',
                        border: '1px solid rgba(239,68,68,0.2)',
                      }}>
                        <Trash2 size={12} /> {confirmDelete === tx.id ? t('Confirm?') : t('Delete')}
                      </button>
                    </div>
                  )}
                </div>
                {i < filtered.length - 1 && <div style={{ height: 1, background: 'var(--border)' }} />}
              </React.Fragment>
            ))
          )}
        </div>
      </div>

      {!isViewer && (
        <button className="fab" onClick={() => { setEditTx(null); setShowDrawer(true); }}><Plus size={26} /></button>
      )}

      {selectedTx && <ReceiptModal tx={selectedTx} onClose={() => setSelectedTx(null)} />}
      {showDrawer && <AddEntryDrawer onClose={() => { setShowDrawer(false); setEditTx(null); }} editTx={editTx} defaultType={isFixedOnly ? 'fixed' : 'debit'} />}
    </>
  );
}
