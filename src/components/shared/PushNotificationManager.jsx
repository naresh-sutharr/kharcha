import React, { useEffect, useState } from 'react';
import { db } from '../../utils/firebase';
import { doc, setDoc } from 'firebase/firestore';

const PUBLIC_KEY = 'BNC1YDmTGe5iizK2wu3yFPbunos2VV2ztmNjAT5r4GhfC0NLrGs8BsIrUy4W7JpG6lEO1DJmuAjwoUZzgHi4nQc';

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationManager({ role }) {
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (role !== 'viewer') return;
    
    // Only ask if not already subscribed
    async function checkSubscription() {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
      
      const registration = await navigator.serviceWorker.ready;
      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) {
        setSubscribed(true);
        // Ensure it's in firestore
        await saveSubscriptionToFirestore(existingSub);
      }
    }
    
    checkSubscription();
  }, [role]);

  async function saveSubscriptionToFirestore(subscription) {
    try {
      await setDoc(doc(db, 'users', 'papa'), {
        pushSubscription: JSON.parse(JSON.stringify(subscription))
      }, { merge: true });
    } catch (e) {
      console.error('Error saving subscription', e);
    }
  }

  async function subscribe() {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return alert('Notifications blocked!');

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(PUBLIC_KEY)
      });

      await saveSubscriptionToFirestore(subscription);
      setSubscribed(true);
      alert('Notifications Enabled! 🎉');
    } catch (e) {
      console.error('Push subscription failed:', e);
      alert('Error enabling notifications');
    }
  }

  if (role !== 'viewer' || subscribed) return null;

  return (
    <div style={{ padding: '12px 16px', background: '#ecfdf5', borderBottom: '1px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ fontSize: 13, color: '#047857', fontWeight: 600 }}>Enable Push Notifications to get instant updates</div>
      <button onClick={subscribe} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Allow</button>
    </div>
  );
}
