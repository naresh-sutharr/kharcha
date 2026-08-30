import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../utils/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { translateToHindi } from '../utils/translate';
import { notifyExpense, notifyReceived } from '../utils/notify';

const DataContext = createContext(null);

export const CATEGORIES = [
  { id: 'food', label: 'Food', emoji: '🍔' },
  { id: 'college', label: 'College/Fees', emoji: '🏫' },
  { id: 'books', label: 'Books', emoji: '📚' },
  { id: 'rent', label: 'Rent', emoji: '🏠' },
  { id: 'travel', label: 'Travel', emoji: '🚌' },
  { id: 'medical', label: 'Medical', emoji: '💊' },
  { id: 'misc', label: 'Misc', emoji: '🗂️' },
];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function DataProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [queries, setQueries] = useState({});
  // Start with loading=false so cached data shows INSTANTLY
  // onSnapshot will update from network in background
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // 1. Listen to Transactions in Real-Time (offline cache loads instantly)
  useEffect(() => {
    const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q,
      { includeMetadataChanges: false },
      (snapshot) => {
        const txs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setTransactions(txs);
        setLoading(false);
        setInitialized(true);
      },
      (error) => {
        console.error('Error fetching transactions:', error);
        setLoading(false);
        setInitialized(true);
      }
    );
    return () => unsubscribe();
  }, []);

  // 2. Listen to Queries in Real-Time
  useEffect(() => {
    const q = collection(db, 'queries');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const qs = {};
      snapshot.docs.forEach(d => {
        qs[d.id] = d.data().thread || [];
      });
      setQueries(qs);
    }, (error) => {
      console.error('Error fetching queries:', error);
    });
    return () => unsubscribe();
  }, []);

  async function addTransaction(data) {
    const id = generateId();
    const note_hi = data.note ? await translateToHindi(data.note) : '';
    const tx = {
      createdAt: new Date().toISOString(),
      date: data.date || new Date().toISOString().split('T')[0],
      time: data.time || new Date().toTimeString().slice(0, 5),
      type: data.type,
      amount: Number(data.amount),
      category: data.category || 'misc',
      note: data.note || '',
      note_hi,
      receipt: data.receipt || null,
    };
    await setDoc(doc(db, 'transactions', id), tx);

    // 🔔 Instant notification to Papa
    if (data.type === 'debit') {
      notifyExpense(data.amount, data.category, data.note);
    } else if (data.type === 'credit') {
      notifyReceived(data.amount, data.note);
    }

    return { id, ...tx };
  }

  async function editTransaction(id, data) {
    const updatePayload = {
      ...data,
      amount: Number(data.amount)
    };
    if (data.note !== undefined) {
      updatePayload.note_hi = data.note ? await translateToHindi(data.note) : '';
    }
    await setDoc(doc(db, 'transactions', id), updatePayload, { merge: true });
  }

  async function deleteTransaction(id) {
    await deleteDoc(doc(db, 'transactions', id));
    await deleteDoc(doc(db, 'queries', id));
  }

  async function addQuery(txId, from, text) {
    const thread = queries[txId] || [];
    const newThread = [...thread, { from, text, time: new Date().toISOString() }];
    await setDoc(doc(db, 'queries', txId), { thread: newThread });
  }

  function getMonthTransactions(year, month) {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }

  function getStats(txList) {
    const received = txList.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
    const spent = txList.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
    return { received, spent, balance: received - spent };
  }

  async function clearAllData() {
    transactions.forEach(async (t) => {
      await deleteDoc(doc(db, 'transactions', t.id));
    });
    Object.keys(queries).forEach(async (id) => {
      await deleteDoc(doc(db, 'queries', id));
    });
  }

  // Show a very brief splash ONLY on the very first load (no cached data yet)
  if (loading && !initialized) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--mesh)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12, animation: 'pulse 1.2s infinite' }}>📒</div>
          <div className="skeleton" style={{ width: 120, height: 10, margin: '0 auto', borderRadius: 6 }} />
        </div>
      </div>
    );
  }

  return (
    <DataContext.Provider value={{
      transactions, queries,
      addTransaction, editTransaction, deleteTransaction,
      addQuery, getMonthTransactions, getStats, clearAllData, CATEGORIES,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
