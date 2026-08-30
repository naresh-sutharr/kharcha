import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { hashPin, verifyPin } from '../utils/crypto';

// ─────────────────────────────────────────────────────────────────
//  AUTH — 100% local, zero network calls. Instant login always.
//  Hardcoded defaults: Admin=3120, Papa=9660
//  PIN changes are saved to localStorage on this device.
// ─────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);
const LOCK_TIMEOUT = 10 * 60 * 1000; // 10 minutes

const PINS = {
  admin:  { key: 'hk_admin_hash',  default: '3120' },
  viewer: { key: 'hk_viewer_hash', default: '9660' },
};

// Get PIN hash from localStorage — if not set, hash the default and store it
async function getPinHash(role) {
  const { key, default: def } = PINS[role];
  const stored = localStorage.getItem(key);
  if (stored) return stored;
  const hash = await hashPin(def);
  localStorage.setItem(key, hash);
  return hash;
}

// Pre-hash and cache both PINs at startup (runs once, ~5ms)
async function initPins() {
  await getPinHash('admin');
  await getPinHash('viewer');
}

export function AuthProvider({ children }) {
  const [role, setRole] = useState(null);
  const lockTimer = useRef(null);

  useEffect(() => { initPins(); }, []);

  const resetLockTimer = useCallback(() => {
    if (lockTimer.current) clearTimeout(lockTimer.current);
    if (role) lockTimer.current = setTimeout(() => setRole(null), LOCK_TIMEOUT);
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

  async function loginAsAdmin(pin) {
    const hash = await getPinHash('admin');
    const ok = await verifyPin(pin, hash);
    if (ok) { setRole('admin'); return true; }
    return false;
  }

  async function loginAsViewer(pin) {
    const hash = await getPinHash('viewer');
    const ok = await verifyPin(pin, hash);
    if (ok) { setRole('viewer'); return true; }
    return false;
  }

  async function changePin(forRole, oldPin, newPin) {
    const hash = await getPinHash(forRole);
    const valid = await verifyPin(oldPin, hash);
    if (!valid) return { ok: false, error: 'Old PIN is incorrect' };
    if (newPin.length < 4) return { ok: false, error: 'PIN must be at least 4 digits' };
    const newHash = await hashPin(newPin);
    localStorage.setItem(PINS[forRole].key, newHash);
    return { ok: true };
  }

  function logout() { setRole(null); }

  return (
    <AuthContext.Provider value={{ role, initialized: true, loginAsAdmin, loginAsViewer, changePin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
