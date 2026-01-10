
import React from 'react';
import { Language } from '../types';

interface LanguageSwitcherProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ currentLang, onLanguageChange }) => {
  const langs = [
    { code: Language.AR, label: "العربية" },
    { code: Language.EN, label: "English" },
    { code: Language.UR, label: "اردو" },
    { code: Language.ID, label: "Bahasa" }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {langs.map((l) => (
        <button
          key={l.code}
          onClick={() => onLanguageChange(l.code)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            currentLang === l.code
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
