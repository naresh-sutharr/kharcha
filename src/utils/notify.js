// ============================================================
//  ntfy.sh Push Notification Utility
//  Free, instant push notifications — no server needed!
//  Topic: hisab-kitab-papa-2024
// ============================================================

const NTFY_TOPIC = 'hisab-kitab-papa-naresh-2024';
const NTFY_ADMIN_TOPIC = 'hisab-kitab-admin-naresh-2024';

// No random titles needed anymore
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
  const title = `Payment Update: ₹${Number(amount).toLocaleString('en-IN')}`;
  const msg = note ? `= ${note}` : `= ${category || 'misc'}`;
  return sendNtfy(NTFY_TOPIC, title, msg, 'money_with_wings');
}

export function notifyReceived(amount, note) {
  const title = `Received Update: ₹${Number(amount).toLocaleString('en-IN')}`;
  const msg = note ? `= ${note}` : '= Fund Received';
  return sendNtfy(NTFY_TOPIC, title, msg, 'white_check_mark');
}

export function notifyPapaAppOpen() {
  const title = "👨‍👦 Papa is Online!";
  const msg = `Papa abhi dashboard check kar rahe hain. 👀`;
  return sendNtfy(NTFY_ADMIN_TOPIC, title, msg, 'eyes');
}

export { NTFY_TOPIC, NTFY_ADMIN_TOPIC };
