// ============================================================
//  ntfy.sh Push Notification Utility
//  Free, instant push notifications — no server needed!
//  Topic: hisab-kitab-papa-2024
// ============================================================

import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

const NTFY_ADMIN_TOPIC = 'hisab-kitab-admin-naresh-2024';

async function sendNativePush(title, message, emoji) {
  try {
    // 1. Fetch Papa's subscription from Firestore
    const papaDoc = await getDoc(doc(db, 'users', 'papa'));
    if (!papaDoc.exists()) return;
    
    const data = papaDoc.data();
    if (!data.pushSubscription) return;

    // 2. Send via our Vercel Serverless Function
    await fetch('/api/send-push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subscription: data.pushSubscription,
        payload: { title, message }
      })
    });
  } catch (e) {
    console.warn('Native Push failed:', e);
  }
}

export function notifyExpense(amount, category, note) {
  const title = `Payment Update: ₹${Number(amount).toLocaleString('en-IN')}`;
  const msg = note ? `= ${note}` : `= ${category || 'misc'}`;
  return sendNativePush(title, msg, 'money_with_wings');
}

export function notifyReceived(amount, note) {
  const title = `Received Update: ₹${Number(amount).toLocaleString('en-IN')}`;
  const msg = note ? `= ${note}` : '= Fund Received';
  return sendNativePush(title, msg, 'white_check_mark');
}

export function notifyPapaAppOpen() {
  const title = "👨‍👦 Papa is Online!";
  const msg = `Papa abhi dashboard check kar rahe hain. 👀`;
  
  // Send admin notification via ntfy (since Admin doesn't use the web push subscription)
  return fetch('https://ntfy.sh/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: NTFY_ADMIN_TOPIC,
      title: title,
      message: msg,
      tags: ['eyes'],
      priority: 4
    })
  }).catch(() => {});
}

export { NTFY_ADMIN_TOPIC };
