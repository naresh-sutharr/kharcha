// ============================================================
//  ntfy.sh Push Notification Utility
//  Free, instant push notifications — no server needed!
//  Topic: hisab-kitab-papa-2024
// ============================================================

const NTFY_TOPIC = 'hisab-kitab-papa-naresh-2024';
const NTFY_ADMIN_TOPIC = 'hisab-kitab-admin-naresh-2024';

// Creative Blinkit-style titles
const EXPENSE_TITLES = [
  "💸 Oops, Paise ud gaye!",
  "🛍️ Naresh ka naya Kharcha!",
  "📉 Balance thoda neeche gaya...",
  "💳 Wallet se paise gaye!",
  "🚨 Alert: Kharcha ho gaya!"
];

const RECEIVED_TITLES = [
  "🤑 Cha-ching! Paisa aa gaya!",
  "💰 Wallet heavy ho gaya!",
  "✅ Papa se fund received!",
  "🚀 Balance goes UP UP!"
];

async function sendNtfy(topic, title, message, emoji) {
  try {
    await fetch(`https://ntfy.sh/${topic}`, {
      method: 'POST',
      headers: {
        'Title': title,
        'Tags': emoji,
        'Priority': 'high',
        'Content-Type': 'text/plain',
      },
      body: message,
    });
  } catch (e) {
    console.warn('Notification send failed:', e);
  }
}

export function notifyExpense(amount, category, note) {
  const cat = category || 'misc';
  const randomTitle = EXPENSE_TITLES[Math.floor(Math.random() * EXPENSE_TITLES.length)];
  const msg = `₹${Number(amount).toLocaleString('en-IN')} kharch hua — ${cat}${note ? ` (${note})` : ''}`;
  return sendNtfy(NTFY_TOPIC, randomTitle, msg, 'money_with_wings');
}

export function notifyReceived(amount, note) {
  const randomTitle = RECEIVED_TITLES[Math.floor(Math.random() * RECEIVED_TITLES.length)];
  const msg = `₹${Number(amount).toLocaleString('en-IN')} mila!${note ? ` — ${note}` : ''}`;
  return sendNtfy(NTFY_TOPIC, randomTitle, msg, 'white_check_mark');
}

export function notifyPapaAppOpen() {
  const title = "👨‍👦 Papa is Online!";
  const msg = `Papa abhi dashboard check kar rahe hain. 👀`;
  return sendNtfy(NTFY_ADMIN_TOPIC, title, msg, 'eyes');
}

export { NTFY_TOPIC, NTFY_ADMIN_TOPIC };
