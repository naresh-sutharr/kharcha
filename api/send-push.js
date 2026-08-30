import webpush from 'web-push';

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BNC1YDmTGe5iizK2wu3yFPbunos2VV2ztmNjAT5r4GhfC0NLrGs8BsIrUy4W7JpG6lEO1DJmuAjwoUZzgHi4nQc';
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'NQqvDekNubRE9OIHrXGSB2GKgFNenvrFVVTkviOM01I';

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  PUBLIC_KEY,
  PRIVATE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { subscription, payload } = req.body;
    
    if (!subscription || !payload) {
      return res.status(400).json({ message: 'Subscription and payload are required' });
    }

    await webpush.sendNotification(subscription, JSON.stringify(payload));
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending push notification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
