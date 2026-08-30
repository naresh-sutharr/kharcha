import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../utils/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { hashPin, verifyPin } from '../utils/crypto';

const AuthContext = createContext(null);
const DEFAULT_ADMIN_PIN = '1234';
const DEFAULT_VIEWER_PIN = '0000';
const LOCK_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// ─────────────────────────────────────────────────────────
//  FAST PIN strategy:
//  1. Check localStorage (instant, ~0ms)
//  2. If not cached, fetch from Firestore once and cache it
//  3. PIN changes: write to BOTH localStorage AND Firestore
// ─────────────────────────────────────────────────────────
const PIN_CACHE_KEY = (role) => `hk_pin_${role}`;

async function getPinHash(role) {
  // Step 1: try localStorage (instant)
  const cached = localStorage.getItem(PIN_CACHE_KEY(role));
  if (cached) return cached;

  // Step 2: fetch from Firestore (only on very first launch)
  try {
    const snap = await getDoc(doc(db, 'config', `${role}_pin`));
    if (snap.exists()) {
      const hash = snap.data().hash;
      localStorage.setItem(PIN_CACHE_KEY(role), hash); // cache it
      return hash;
    }
  } catch (_) { /* network unavailable — fall through to default */ }

  // Step 3: first-ever launch — create default PIN
  const defaultPin = role === 'admin' ? DEFAULT_ADMIN_PIN : DEFAULT_VIEWER_PIN;
  const hash = await hashPin(defaultPin);
  localStorage.setItem(PIN_CACHE_KEY(role), hash);
  // Write to Firestore in background (don't await — don't block login)
  setDoc(doc(db, 'config', `${role}_pin`), { hash }).catch(() => {});
  return hash;
}

async function setPinHash(role, hash) {
  // Write to localStorage immediately (instant for this device)
  localStorage.setItem(PIN_CACHE_KEY(role), hash);
  // Write to Firestore for cross-device sync
  await setDoc(doc(db, 'config', `${role}_pin`), { hash });
}

// Pre-warm: fetch and cache PINs in background on app start
async function prewarmPins() {
  await Promise.allSettled([getPinHash('admin'), getPinHash('viewer')]);
}

export function AuthProvider({ children }) {
  const [role, setRole]           = useState(null);
  const [initialized, setInitialized] = useState(false);
  const lockTimer = useRef(null);

  useEffect(() => {
    setInitialized(true);
    // Pre-fetch and cache both PINs silently in background
    prewarmPins();
  }, []);

  const resetLockTimer = useCallback(() => {
    if (lockTimer.current) clearTimeout(lockTimer.current);
    if (role) {
      lockTimer.current = setTimeout(() => setRole(null), LOCK_TIMEOUT);
    }
  }, [role]);

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

  // INSTANT login — uses cached localStorage hash
  async function loginAsAdmin(pin) {
    const hash = await getPinHash('admin');
    const ok   = await verifyPin(pin, hash);
    if (ok) { setRole('admin'); return true; }
    return false;
  }

  async function loginAsViewer(pin) {
    const hash = await getPinHash('viewer');
    const ok   = await verifyPin(pin, hash);
    if (ok) { setRole('viewer'); return true; }
    return false;
  }

  async function changePin(forRole, oldPin, newPin) {
    const hash  = await getPinHash(forRole);
    const valid = await verifyPin(oldPin, hash);
    if (!valid) return { ok: false, error: 'Old PIN is incorrect' };
    if (newPin.length < 4) return { ok: false, error: 'PIN must be at least 4 digits' };
    const newHash = await hashPin(newPin);
    await setPinHash(forRole, newHash); // updates both localStorage & Firestore
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
