// ============================================================
//  ntfy.sh Push Notification Utility
//  Free, instant push notifications — no server needed!
//  Topic: hisab-kitab-papa-2024
// ============================================================

const NTFY_TOPIC = 'hisab-kitab-papa-naresh-2024';
const NTFY_URL = `https://ntfy.sh/${NTFY_TOPIC}`;

/**
 * Send an instant push notification to Papa's phone via ntfy.sh
 * @param {string} title - Notification title
 * @param {string} message - Notification body
 * @param {string} emoji - Priority emoji tag
 */
export async function sendNotification(title, message, emoji = '📱') {
  try {
    await fetch(NTFY_URL, {
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
    // Notification failure should never block the main app flow
    console.warn('Notification send failed:', e);
  }
}

/**
 * Notify Papa about a new expense
 */
export function notifyExpense(amount, category, note) {
  const cat = category || 'misc';
  const title = `💸 Naresh ne kharch kiya`;
  const msg = `₹${Number(amount).toLocaleString('en-IN')} — ${cat}${note ? ` (${note})` : ''}`;
  return sendNotification(title, msg, 'money_with_wings');
}

/**
 * Notify Papa about money received
 */
export function notifyReceived(amount, note) {
  const title = `✅ Naresh ko paisa mila`;
  const msg = `₹${Number(amount).toLocaleString('en-IN')}${note ? ` — ${note}` : ''}`;
  return sendNotification(title, msg, 'white_check_mark');
}

export { NTFY_TOPIC };
