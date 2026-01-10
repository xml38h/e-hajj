import React, { useState, useEffect } from 'react';
import { Language, PilgrimProfile } from './types';
import { TRANSLATIONS, DEFAULT_PROFILE } from './constants';
import LanguageSwitcher from './components/LanguageSwitcher';
import SecurityGate from './components/SecurityGate';
import ProfileView from './components/ProfileView';
import QrModal from './components/QrModal';
import EditProfile from './components/EditProfile';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(Language.AR);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [profile, setProfile] = useState<PilgrimProfile>(DEFAULT_PROFILE);
  const [showLocationAlert, setShowLocationAlert] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const t = TRANSLATIONS[lang];
  const isRtl = lang === Language.AR || lang === Language.UR;

  useEffect(() => {
    const savedProfile = localStorage.getItem('nuskcare_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }

    const browserLang = navigator.language.split('-')[0];
    if (Object.values(Language).includes(browserLang as Language)) {
      setLang(browserLang as Language);
    }
  }, []);

  const saveProfile = (updatedProfile: PilgrimProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem('nuskcare_profile', JSON.stringify(updatedProfile));
    setIsEditMode(false);
  };

  const handleShareLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(() => {
        setShowLocationAlert(true);
        setTimeout(() => setShowLocationAlert(false), 3000);
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t.title,
          text: `الملف الطبي للحاج: ${profile.fullName}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      setShowQr(true);
    }
  };

  // ✅ اتصال الحملة
  const handleEmergencyCall = () => {
    if (!profile.emergencyPhone) return;
    window.location.href = `tel:${profile.emergencyPhone}`;
  };

  // ✅ اتصال الهلال الأحمر
  const handleRedCrescentCall = () => {
    if (!profile.redCrescentPhone) return;
    window.location.href = `tel:${profile.redCrescentPhone}`;
  };

  return (
    <div className={`min-h-screen bg-slate-50 transition-all ${isRtl ? 'rtl' : ''}`}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 px-4 py-4 shadow-sm">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-2.5 rounded-xl text-white shadow-lg shadow-emerald-100">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05l-2.294 2.294 1.58 4.74a1 1 0 01-1.527 1.157l-4.412-2.521-4.412 2.52a1 1 0 01-1.527-1.156l1.58-4.74-2.294-2.294a1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-gray-800 leading-none">{t.title}</h1>
              <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">
                Health ID: {profile.id}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {isAuthenticated && (
              <>
                <button
                  onClick={handleNativeShare}
                  className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all border border-blue-100"
                  title="Share Link"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6a3 3 0 100-2.684m0 2.684l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>

                <button
                  onClick={() => setShowQr(true)}
                  className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all border border-emerald-100"
                  title="Show QR Code"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </button>
              </>
            )}

            {isAuthenticated && !isEditMode && (
              <button
                onClick={() => setIsEditMode(true)}
                className="p-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-all border border-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 sm:p-6">
        {!isEditMode && <LanguageSwitcher currentLang={lang} onLanguageChange={setLang} />}

        {!isAuthenticated ? (
          <SecurityGate
            correctCode={profile.securityCode}
            onSuccess={() => setIsAuthenticated(true)}
            t={t}
            isRtl={isRtl}
          />
        ) : isEditMode ? (
          <EditProfile
            profile={profile}
            onSave={saveProfile}
            onCancel={() => setIsEditMode(false)}
            t={t}
            isRtl={isRtl}
          />
        ) : (
          <ProfileView
            profile={profile}
            t={t}
            isRtl={isRtl}
            currentLang={lang}
          />
        )}
      </main>

      {/* Floating Action Buttons */}
      {isAuthenticated && !isEditMode && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-4 shadow-2xl z-40">
          {/* ✅ الاقتراح: 3 أزرار واضحة (موقع / حملة / هلال) */}
          <div className="max-w-2xl mx-auto grid grid-cols-3 gap-3">
            <button
              onClick={handleShareLocation}
              className="flex items-center justify-center gap-2 bg-slate-800 text-white py-4 rounded-2xl font-bold text-sm hover:bg-slate-900 active:scale-95 transition-all shadow-xl shadow-slate-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {t.shareLocation}
            </button>

            <button
              onClick={handleEmergencyCall}
              className="flex items-center justify-center gap-2 bg-red-600 text-white py-4 rounded-2xl font-bold text-sm hover:bg-red-700 active:scale-95 transition-all shadow-xl shadow-red-200"
              title="اتصال الحملة"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              الحملة
            </button>

            <button
              onClick={handleRedCrescentCall}
              disabled={!profile.redCrescentPhone}
              className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm active:scale-95 transition-all shadow-xl
                ${profile.redCrescentPhone
                  ? 'bg-red-700 text-white hover:bg-red-800 shadow-red-200'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-gray-100'
                }`}
              title="اتصال الهلال الأحمر"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              الهلال
            </button>
          </div>
        </div>
      )}

      {showQr && (
        <QrModal
          profileId={profile.id}
          onClose={() => setShowQr(false)}
          t={t}
          isRtl={isRtl}
        />
      )}

      {showLocationAlert && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-8 py-4 rounded-2xl text-sm font-bold z-[60] shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
          Location Shared with Health Command ✅
        </div>
      )}
    </div>
  );
};

export default App;
