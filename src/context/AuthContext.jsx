import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { storage } from '../utils/storage';
import { hashPin, verifyPin } from '../utils/crypto';

const AuthContext = createContext(null);
const DEFAULT_ADMIN_PIN = '1234';
const DEFAULT_VIEWER_PIN = '0000';
const LOCK_TIMEOUT = 3 * 60 * 1000; // 3 minutes

export function AuthProvider({ children }) {
  const [role, setRole] = useState(null); // 'admin' | 'viewer' | null
  const [initialized, setInitialized] = useState(false);
  const lockTimer = useRef(null);

  // Initialize default PINs on first launch
  useEffect(() => {
    async function init() {
      if (!storage.get('admin_pin_hash')) {
        storage.set('admin_pin_hash', await hashPin(DEFAULT_ADMIN_PIN));
      }
      if (!storage.get('viewer_pin_hash')) {
        storage.set('viewer_pin_hash', await hashPin(DEFAULT_VIEWER_PIN));
      }
      setInitialized(true);
    }
    init();
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
    const hash = storage.get('admin_pin_hash');
    const ok = await verifyPin(pin, hash);
    if (ok) { setRole('admin'); return true; }
    return false;
  }

  async function loginAsViewer(pin) {
    const hash = storage.get('viewer_pin_hash');
    const ok = await verifyPin(pin, hash);
    if (ok) { setRole('viewer'); return true; }
    return false;
  }

  async function changePin(forRole, oldPin, newPin) {
    const hashKey = forRole === 'admin' ? 'admin_pin_hash' : 'viewer_pin_hash';
    const hash = storage.get(hashKey);
    const valid = await verifyPin(oldPin, hash);
    if (!valid) return { ok: false, error: 'Old PIN is incorrect' };
    if (newPin.length < 4) return { ok: false, error: 'PIN must be at least 4 digits' };
    storage.set(hashKey, await hashPin(newPin));
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
