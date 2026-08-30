import webpush from 'web-push';

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BNC1YDmTGe5iizK2wu3yFPbunos2VV2ztmNjAT5r4GhfC0NLrGs8BsIrUy4W7JpG6lEO1DJmuAjwoUZzgHi4nQc';
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'NQqvDekNubRE9OIHrXGSB2GKgFNenvrFVVTkviOM01I';
const PROJECT_ID = 'project-2f69f'; // From your firebase config

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  PUBLIC_KEY,
  PRIVATE_KEY
);

// Helper to parse Firestore REST format to normal JSON
function parseFirestoreValue(value) {
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.mapValue) {
    const obj = {};
    for (const [k, v] of Object.entries(value.mapValue.fields)) {
      obj[k] = parseFirestoreValue(v);
    }
    return obj;
  }
  return value;
}

export default async function handler(req, res) {
  try {
    // Fetch Papa's subscription directly from Firestore REST API
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/papa`);
    const data = await response.json();
    
    if (!data.fields || !data.fields.pushSubscription) {
      return res.status(404).json({ message: 'No subscription found in Firestore for papa' });
    }

    const subscription = parseFirestoreValue(data.fields.pushSubscription);

    // Funny/Nice random messages for the CRON job
    const messages = [
      "🙏 Swagat hai Naresh ke Hisab Kitab app me!",
      "😊 Papa, aaj ka din kaisa raha? App khol ke dashboard dekhiye.",
      "✨ Kharcha App par aapka swagat hai!",
      "💸 Apne transactions check karne ke liye app check karein."
    ];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];

    const payload = {
      title: "Daily Update",
      message: randomMsg
    };

    await webpush.sendNotification(subscription, JSON.stringify(payload));
    res.status(200).json({ success: true, message: 'Cron notification sent successfully!' });
  } catch (error) {
    console.error('Error in cron notify:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
