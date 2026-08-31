/**
 * Free translation service using MyMemory API.
 * Limit: 500 words/day (free tier).
 */
export async function translateToHindi(text) {
  if (!text || !text.trim()) return '';
  
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data[0]) {
      return data[0].map(item => item[0]).join('');
    }
    return text;
  } catch (err) {
    console.error('Translation failed:', err);
    return text;
  }
}
