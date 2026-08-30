import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';

const LanguageContext = createContext(null);

const DICTIONARY = {
  // Roles & Login
  "Papa — Viewer": "पापा — व्यूअर",
  "Admin Access": "एडमिन एक्सेस",
  "View spending, charts & ask questions": "खर्च, चार्ट देखें और सवाल पूछें",
  "Manage entries, expenses & settings": "लेनदेन और सेटिंग्स प्रबंधित करें",
  "Choose your role": "अपनी भूमिका चुनें",
  "Enter your PIN to continue": "जारी रखने के लिए अपना पिन डालें",
  "Wrong PIN. Try again.": "गलत पिन। फिर से प्रयास करें।",
  "Back": "पीछे",
  "Default — Admin:": "डिफ़ॉल्ट — एडमिन:",
  "Papa:": "पापा:",

  // Bottom Nav
  "Home": "होम",
  "Charts": "चार्ट्स",
  "Ask": "सवाल",
  "Records": "लेनदेन",
  "Settings": "सेटिंग्स",
  "Queries": "प्रश्न",

  // Dashboard
  "Papa's Dashboard": "पापा का डैशबोर्ड",
  "Good Morning": "सुप्रभात",
  "Good Afternoon": "शुभ दोपहर",
  "Good Evening": "शुभ संध्या",
  "Balance — ": "शेष राशि — ",
  "Remaining Balance": "बची हुई राशि",
  "Received": "प्राप्त",
  "Spent": "खर्च",
  "This month": "इस महीने",
  "from Papa": "पापा से",
  "add spending": "खर्च जोड़ें",
  "all entries": "सभी रिकॉर्ड",
  "Transactions": "लेनदेन",
  "entries": "रिकॉर्ड",
  "No entries yet": "कोई लेनदेन नहीं",
  "No transactions this month": "इस महीने कोई लेनदेन नहीं",
  "Use the quick actions above to add one": "जोड़ने के लिए ऊपर दिए गए विकल्पों का उपयोग करें",
  "Received from Papa": "पापा से प्राप्त",
  "Credit": "प्राप्त",
  "Expense": "खर्च",
  "All Records": "सभी रिकॉर्ड",
  "Edit": "संपादित करें",
  "Delete": "हटाएं",
  "Confirm?": "पुष्टि करें?",
  "No transactions found": "कोई लेनदेन नहीं मिला",
  
  // Health Bar
  "Spending Health": "खर्च की स्थिति",
  "⚠ Over Budget": "⚠ बजट से बाहर",
  "↑ High": "↑ अधिक",
  "✓ On Track": "✓ सही",
  "used out of": "इस्तेमाल किया (कुल:",
  "used": "इस्तेमाल किया",
  "Budget": "बजट",
  "of": "में से",

  // Categories
  "Food": "भोजन",
  "College/Fees": "कॉलेज/फीस",
  "Books": "किताबें",
  "Rent": "किराया",
  "Travel": "यात्रा",
  "Medical": "मेडिकल",
  "Misc": "अन्य",
  "All": "सभी",

  // Misc
  "Lock": "लॉक",
  "question from Papa": "पापा का प्रश्न",
  "questions from Papa": "पापा के प्रश्न",
  "Tap to view & reply →": "देखने और उत्तर देने के लिए टैप करें →"
};

export function LanguageProvider({ children }) {
  // Default to english, but check storage
  const [lang, setLang] = useState(storage.get('lang', 'en'));

  useEffect(() => {
    storage.set('lang', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang(l => l === 'en' ? 'hi' : 'en');
  };

  const t = (text) => {
    if (lang === 'en') return text;
    return DICTIONARY[text] || text;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
