import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../utils/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { hashPin, verifyPin } from '../utils/crypto';

const AuthContext = createContext(null);
const DEFAULT_ADMIN_PIN = '1234';
const DEFAULT_VIEWER_PIN = '0000';
const LOCK_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// Store PINs in Firestore so they sync across ALL devices
async function getOrCreatePinHash(role) {
  const pinDocRef = doc(db, 'config', `${role}_pin`);
  const snap = await getDoc(pinDocRef);
  if (snap.exists()) {
    return snap.data().hash;
  }
  // First time — create default PIN in Firestore
  const defaultPin = role === 'admin' ? DEFAULT_ADMIN_PIN : DEFAULT_VIEWER_PIN;
  const hash = await hashPin(defaultPin);
  await setDoc(pinDocRef, { hash });
  return hash;
}

export function AuthProvider({ children }) {
  const [role, setRole] = useState(null); // 'admin' | 'viewer' | null
  const [initialized, setInitialized] = useState(false);
  const lockTimer = useRef(null);

  useEffect(() => {
    // Just mark as initialized — PIN hashes are fetched on-demand from Firestore
    setInitialized(true);
  }, []);

  const resetLockTimer = useCallback(() => {
    if (lockTimer.current) clearTimeout(lockTimer.current);
    if (role) {
      lockTimer.current = setTimeout(() => { setRole(null); }, LOCK_TIMEOUT);
    }
  }, [role]);

  // Auto-lock on inactivity
  useEffect(() => {
    if (!role) return;
    const events = ['mousemove', 'keydown', 'touchstart', 'click', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetLockTimer, { passive: true }));
    resetLockTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetLockTimer));
      if (lockTimer.current) clearTimeout(lockTimer.current);
    };
  }, [role, resetLockTimer]);

  async function loginAsAdmin(pin) {
    const hash = await getOrCreatePinHash('admin');
    const ok = await verifyPin(pin, hash);
    if (ok) { setRole('admin'); return true; }
    return false;
  }

  async function loginAsViewer(pin) {
    const hash = await getOrCreatePinHash('viewer');
    const ok = await verifyPin(pin, hash);
    if (ok) { setRole('viewer'); return true; }
    return false;
  }

  async function changePin(forRole, oldPin, newPin) {
    const hash = await getOrCreatePinHash(forRole);
    const valid = await verifyPin(oldPin, hash);
    if (!valid) return { ok: false, error: 'Old PIN is incorrect' };
    if (newPin.length < 4) return { ok: false, error: 'PIN must be at least 4 digits' };
    const newHash = await hashPin(newPin);
    // Save new PIN hash to Firestore — syncs to ALL devices instantly
    await setDoc(doc(db, 'config', `${forRole}_pin`), { hash: newHash });
    return { ok: true };
  }

  function logout() { setRole(null); }

  return (
    <AuthContext.Provider value={{ role, initialized, loginAsAdmin, loginAsViewer, changePin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
