import React, { useState, useEffect } from 'react';
import { Language, PilgrimProfile } from './types';
import { TRANSLATIONS, DEFAULT_PROFILE } from './constants';
import LanguageSwitcher from './components/LanguageSwitcher';
import SecurityGate from './components/SecurityGate';
import ProfileView from './components/ProfileView';
import QrModal from './components/QrModal';
import EditProfile from './components/EditProfile';
import redCrescentLogo from './image.png';

// ✅ Cloud (Firestore)
import { saveProfileToCloud, loadProfileFromCloud } from './services/profileStore';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(Language.AR);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [profile, setProfile] = useState<PilgrimProfile>(DEFAULT_PROFILE);
  const [showLocationAlert, setShowLocationAlert] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const logoUrl = new URL('./logo.png', import.meta.url).href;

  const t = TRANSLATIONS[lang];
  const isRtl = lang === Language.AR || lang === Language.UR;

  // ✅ helpers: encode/decode profile into URL param (UTF-8 safe)
  const encodeProfileToUrlParam = (p: PilgrimProfile) => {
    const json = JSON.stringify(p);
    const base64 = btoa(unescape(encodeURIComponent(json)));
    return encodeURIComponent(base64);
  };

  const decodeProfileFromUrlParam = (d: string): PilgrimProfile => {
    const base64 = decodeURIComponent(d);
    const json = decodeURIComponent(escape(atob(base64)));
    return JSON.parse(json);
  };

  // ✅ هذا اللي كنت تستخدمه للشير (يشتغل على أي جهاز لأن فيه d)
  const buildShareUrl = (p: PilgrimProfile) => {
    const origin = window.location.origin;
    const d = encodeProfileToUrlParam(p);
    return `${origin}/p/${encodeURIComponent(p.id)}`;
  };

  // ✅ هذا “للـ QR” فقط (رابط قصير وخفيف)
  const buildQrUrl = (p: PilgrimProfile) => {
    const origin = window.location.origin;
    return `${origin}/p/${encodeURIComponent(p.id)}`;
  };

  useEffect(() => {
    const path = window.location.pathname;

    // ✅ إذا فتحنا رابط /p/<id>
    if (path.startsWith('/p/')) {
      const idFromUrl = path.replace('/p/', '').split('?')[0];
      const url = new URL(window.location.href);
      const d = url.searchParams.get('d');

      const run = async () => {
        // 1) لو فيه d → فكّه وخلاص
        if (d) {
          try {
            const decoded = decodeProfileFromUrlParam(d);
            const finalProfile: PilgrimProfile = { ...decoded, id: idFromUrl || decoded.id };

            setProfile(finalProfile);
            localStorage.setItem('nuskcare_profile', JSON.stringify(finalProfile));
            setIsAuthenticated(true);
            setIsEditMode(false);
            return;
          } catch (e) {
            console.error('Failed to decode shared profile', e);
          }
        }

        // 2) لو ما فيه d → جرّب Firestore
        try {
          const cloudProfile = await loadProfileFromCloud(idFromUrl);
          if (cloudProfile) {
            setProfile(cloudProfile as PilgrimProfile);
            localStorage.setItem('nuskcare_profile', JSON.stringify(cloudProfile));
            setIsAuthenticated(true);
            setIsEditMode(false);
            return;
          }
        } catch (e) {
          console.error('Failed to load profile from cloud', e);
        }

        // 3) fallback: لو ما لقيناه لا محلي ولا كلاود
        const savedProfile = localStorage.getItem('nuskcare_profile');
        if (savedProfile) {
          const parsed: PilgrimProfile = JSON.parse(savedProfile);
          if (parsed.id === idFromUrl) {
            setProfile(parsed);
            setIsAuthenticated(true);
            setIsEditMode(false);
            return;
          }
        }
// ✅ محاولة تحميل من Firestore (عشان يشتغل على أي جهاز)
try {
  const cloudProfile = await loadProfileFromCloud(idFromUrl);
  if (cloudProfile) {
    setProfile(cloudProfile as any);
    localStorage.setItem('nuskcare_profile', JSON.stringify(cloudProfile));
    setIsAuthenticated(true);
    setIsEditMode(false);
    return;
  }
} catch (e) {
  console.log('Cloud load failed', e);
}

        // 4) Emergency view
        setProfile({
          ...DEFAULT_PROFILE,
          id: idFromUrl,
          fullName: 'Emergency View (No local data)',
          medicalHistory: { chronicDiseases: [], allergies: [], previousSurgeries: [] },
          medicationHistory: [],
          vitalSigns: {
            bloodType: '',
            lastUpdated: new Date().toISOString(),
            bloodSugarReadings: [],
            bloodPressureReadings: [],
          },
        });
        setIsAuthenticated(true);
        setIsEditMode(false);
      };

      run();
      return;
    }

    // الوضع العادي
    const savedProfile = localStorage.getItem('nuskcare_profile');
    if (savedProfile) setProfile(JSON.parse(savedProfile));

    const browserLang = navigator.language.split('-')[0];
    if (Object.values(Language).includes(browserLang as Language)) {
      setLang(browserLang as Language);
    }
  }, []);

  const saveProfile = async (updatedProfile: PilgrimProfile) => {
  setProfile(updatedProfile);
  localStorage.setItem('nuskcare_profile', JSON.stringify(updatedProfile));
  setIsEditMode(false);

  try {
    await saveProfileToCloud(updatedProfile as any);
  } catch (e) {
    console.log('Cloud save failed', e);
  }
};



  const handleShareLocation = async () => {
    if (!('geolocation' in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
        const shareUrl = buildShareUrl(profile);

        if (navigator.share) {
          try {
            await navigator.share({
              title: t.title,
              text: `موقع الحاج الآن: ${profile.fullName}\n\nGoogle Maps: ${mapsUrl}\n\nالملف الطبي: ${shareUrl}`,
              url: shareUrl,
            });
            return;
          } catch (e) {
            console.log('Share canceled or failed', e);
          }
        }

        const msg = `موقع الحاج الآن: ${profile.fullName}\nGoogle Maps: ${mapsUrl}\nالملف الطبي: ${shareUrl}`;
        try {
          await navigator.clipboard.writeText(msg);
          setShowLocationAlert(true);
          setTimeout(() => setShowLocationAlert(false), 3000);
        } catch {
          window.open(mapsUrl, '_blank');
        }
      },
      (err) => {
        console.log('Geolocation error', err);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleNativeShare = async () => {
    const shareUrl = buildShareUrl(profile);

    if (navigator.share) {
      try {
        await navigator.share({
          title: t.title,
          text: `الملف الطبي للحاج: ${profile.fullName}`,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      setShowQr(true);
    }
  };

  const handleEmergencyCall = () => {
    if (!profile.emergencyPhone) return;
    window.location.href = `tel:${profile.emergencyPhone}`;
  };

  const handleRedCrescentCall = () => {
    if (!profile.redCrescentPhone) return;
    window.location.href = `tel:${profile.redCrescentPhone}`;
  };

  // ✅ رابط QR القصير (بدون d)
  const qrShareUrl = buildQrUrl(profile);

  return (
    <div className={`min-h-screen bg-slate-50 transition-all ${isRtl ? 'rtl' : ''}`}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 px-4 py-4 shadow-sm">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
              <img src={logoUrl} alt="Hajj Care" className="w-14 h-18 object-contain" />
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6a3 3 0 100-2.684m0 2.684l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => setShowQr(true)}
                  className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all border border-emerald-100"
                  title="Show QR Code"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                    />
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 sm:p-6">
        {!isEditMode && <LanguageSwitcher currentLang={lang} onLanguageChange={setLang} />}

        {!isAuthenticated ? (
          <SecurityGate correctCode={profile.securityCode} onSuccess={() => setIsAuthenticated(true)} t={t} isRtl={isRtl} />
        ) : isEditMode ? (
          <EditProfile profile={profile} onSave={saveProfile} onCancel={() => setIsEditMode(false)} t={t} isRtl={isRtl} />
        ) : (
          <ProfileView profile={profile} t={t} isRtl={isRtl} currentLang={lang} />
        )}
      </main>

      {/* Floating Action Buttons */}
      {isAuthenticated && !isEditMode && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-4 shadow-2xl z-40">
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
              type="button"
              onClick={handleRedCrescentCall}
              className="flex items-center justify-center gap-2 bg-[#D61F26] text-white py-4 rounded-2xl font-bold text-sm hover:bg-[#B8181E] active:scale-95 transition-all shadow-xl shadow-red-200"
              title="الهلال الأحمر"
            >
              <img src={redCrescentLogo} alt="Saudi Red Crescent" className="h-5 w-5 object-contain" />
              الهلال
            </button>
          </div>
        </div>
      )}

      {/* ✅ QR Modal: لاحظ هنا نمرر shareUrl (القصير) */}
     {showQr && (
  <QrModal
    shareUrl={buildShareUrl(profile)}
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
