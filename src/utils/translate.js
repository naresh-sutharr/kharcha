/**
 * Free translation service using MyMemory API.
 * Limit: 500 words/day (free tier).
 */
export async function translateToHindi(text) {
  if (!text || !text.trim()) return '';
  
  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|hi`
    );
    const data = await response.json();
    
    // Check if valid response
    if (data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }
    return text; // fallback to original if API fails
  } catch (err) {
    console.error('Translation failed:', err);
    return text; // fallback
  }
}
