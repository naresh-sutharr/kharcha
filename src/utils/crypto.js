// SHA-256 PIN hashing using Web Crypto API
const SALT = 'family_ledger_v1_salt_2024';

export async function hashPin(pin) {
  const data = new TextEncoder().encode(pin + SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPin(pin, hash) {
  const computed = await hashPin(pin);
  return computed === hash;
}
