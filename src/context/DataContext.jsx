import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { translateToHindi } from '../utils/translate';
import { notifyExpense, notifyReceived } from '../utils/notify';

const DataContext = createContext(null);

export const CATEGORIES = [
  { id: 'food',    label: 'Food',         emoji: '🍔' },
  { id: 'college', label: 'College/Fees', emoji: '🏫' },
  { id: 'books',   label: 'Books',        emoji: '📚' },
  { id: 'rent',    label: 'Rent',         emoji: '🏠' },
  { id: 'travel',  label: 'Travel',       emoji: '🚌' },
  { id: 'medical', label: 'Medical',      emoji: '💊' },
  { id: 'misc',    label: 'Misc',         emoji: '🗂️' },
];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function DataProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [queries, setQueries]           = useState({});
  const [loading, setLoading]           = useState(true);

  // ─── Real-time Transactions listener ───────────────────────
  useEffect(() => {
    const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setTransactions(txs);
      setLoading(false);
    }, (err) => {
      console.error('TX listener error:', err);
      setLoading(false);
    });
    return unsub;
  }, []);

  // ─── Real-time Queries listener ────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'queries'), (snapshot) => {
      const qs = {};
      snapshot.docs.forEach(d => { qs[d.id] = d.data().thread || []; });
      setQueries(qs);
    }, (err) => console.error('Queries listener error:', err));
    return unsub;
  }, []);

  // ─── CRUD ──────────────────────────────────────────────────
  async function addTransaction(data) {
    const id = generateId();
    
    // Background translation to not block the UI completely
    let note_hi = '';
    if (data.note) {
      try {
        note_hi = await translateToHindi(data.note);
      } catch(e) {}
    }

    const tx = {
      createdAt: new Date().toISOString(),
      date:      data.date     || new Date().toISOString().split('T')[0],
      time:      data.time     || new Date().toTimeString().slice(0, 5),
      type:      data.type,
      amount:    Number(data.amount),
      category:  data.category || 'misc',
      note:      data.note     || '',
      note_hi,
      receipt:   data.receipt  || null,
    };
    
    await setDoc(doc(db, 'transactions', id), tx);

    // Send push notification to Papa via ntfy.sh
    if (data.type === 'debit')  notifyExpense(data.amount, data.category, data.note);
    if (data.type === 'credit') notifyReceived(data.amount, data.note);
    if (data.type === 'fixed')  notifyExpense(data.amount, data.category, data.note);

    return { id, ...tx };
  }

  async function editTransaction(id, data) {
    const payload = { ...data, amount: Number(data.amount) };
    
    if (data.note !== undefined) {
      if (data.note) {
        try {
          payload.note_hi = await translateToHindi(data.note);
        } catch(e) {
          payload.note_hi = '';
        }
      } else {
        payload.note_hi = '';
      }
    }
    
    await setDoc(doc(db, 'transactions', id), payload, { merge: true });
  }

  async function deleteTransaction(id) {
    await deleteDoc(doc(db, 'transactions', id));
    await deleteDoc(doc(db, 'queries', id));
  }

  async function addQuery(txId, from, text) {
    const thread    = queries[txId] || [];
    const newThread = [...thread, { from, text, time: new Date().toISOString() }];
    await setDoc(doc(db, 'queries', txId), { thread: newThread });
  }

  function getMonthTransactions(year, month) {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }

  function getCarryOverBalance(year, month) {
    const pastTxs = transactions.filter(t => {
      const d = new Date(t.date);
      if (d.getFullYear() < year) return true;
      if (d.getFullYear() === year && d.getMonth() < month) return true;
      return false;
    });
    const { received, spent } = getStats(pastTxs);
    return received - spent;
  }

  function getStats(txList) {
    const received = txList.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
    const spent    = txList.filter(t => t.type === 'debit').reduce((s,  t) => s + t.amount, 0);
    const fixed    = txList.filter(t => t.type === 'fixed').reduce((s,  t) => s + t.amount, 0);
    return { received, spent, fixed, balance: received - spent };
  }

  async function clearAllData() {
    for (const t of transactions) await deleteDoc(doc(db, 'transactions', t.id));
    for (const id of Object.keys(queries)) await deleteDoc(doc(db, 'queries', id));
  }

  // ─── Never block — render immediately, data streams in ──────
  return (
    <DataContext.Provider value={{
      transactions, queries,
      addTransaction, editTransaction, deleteTransaction,
      addQuery, getMonthTransactions, getCarryOverBalance, getStats, clearAllData, CATEGORIES,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
