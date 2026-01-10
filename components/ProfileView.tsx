
import React, { useEffect, useState } from 'react';
import { PilgrimProfile, TranslationSet, Language } from '../types';
import { getEmergencyBrief } from '../services/geminiService';

interface ProfileViewProps {
  profile: PilgrimProfile;
  t: TranslationSet;
  isRtl: boolean;
  currentLang: Language;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, t, isRtl, currentLang }) => {
  const [aiSummary, setAiSummary] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoadingAi(true);
      const summary = await getEmergencyBrief(profile, currentLang);
      setAiSummary(summary);
      setLoadingAi(false);
    };
    fetchSummary();
  }, [profile, currentLang]);

  const Section = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
      <div className={`flex items-center gap-2 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <div className="text-emerald-600">{icon}</div>
        <h3 className="font-bold text-gray-800">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );

  const DataRow = ({ label, value, badge = false }: { label: string, value: string | string[], badge?: boolean }) => (
    <div className={`flex flex-col ${isRtl ? 'items-end text-right' : 'items-start text-left'}`}>
      <span className="text-xs text-gray-400 uppercase font-semibold">{label}</span>
      {Array.isArray(value) ? (
        <div className={`flex flex-wrap gap-1 mt-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
          {value.map((v, i) => (
            <span key={i} className={`text-sm px-2 py-0.5 rounded ${badge ? 'bg-red-50 text-red-600 border border-red-100 font-medium' : 'bg-gray-100 text-gray-700'}`}>
              {v}
            </span>
          ))}
        </div>
      ) : (
        <span className={`text-gray-800 font-medium ${badge ? 'text-lg text-emerald-700' : ''}`}>{value}</span>
      )}
    </div>
  );

  return (
    <div className={`pb-24 ${isRtl ? 'rtl' : ''}`}>
      {/* Critical Alert Area (AI Summary) */}
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-xl">
        <div className={`flex items-center gap-2 mb-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span className="font-bold text-amber-800 text-sm">Emergency Summary (AI)</span>
        </div>
        <p className="text-sm text-amber-900 leading-relaxed italic">
          {loadingAi ? "Analyzing medical data..." : aiSummary}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section title={t.personalData} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}>
          <DataRow label="Name" value={profile.fullName} />
          <DataRow label="ID / Passport" value={profile.passportId} />
          <DataRow label="Nationality" value={profile.nationality} />
        </Section>

        <Section title={t.vitalSigns} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}>
          <div className="grid grid-cols-2 gap-4">
            <DataRow label={t.bloodType} value={profile.vitalSigns.bloodType} badge />
            <DataRow label={t.bloodPressure} value={profile.vitalSigns.bloodPressure} />
            <DataRow label={t.bloodSugar} value={profile.vitalSigns.bloodSugar} />
          </div>
        </Section>

        <Section title={t.medicalHistory} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.675.337a4 4 0 01-2.574.345l-1.311-.262a2 2 0 00-1.01.033L4 16.188V21h4.166l1.073-1.073a2 2 0 00.586-1.414V17a2 2 0 114 0v1.514a2 2 0 00.586 1.414L15.414 21H20v-4.572l-.572-.572z" /></svg>}>
          <DataRow label={t.chronicDiseases} value={profile.medicalHistory.chronicDiseases} />
          <DataRow label={t.allergies} value={profile.medicalHistory.allergies} badge />
          <DataRow label={t.surgeries} value={profile.medicalHistory.previousSurgeries} />
        </Section>

        <Section title={t.medications} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.675.337a4 4 0 01-2.574.345l-1.311-.262a2 2 0 00-1.01.033L4 16.188V21h4.166l1.073-1.073a2 2 0 00.586-1.414V17a2 2 0 114 0v1.514a2 2 0 00.586 1.414L15.414 21H20v-4.572l-.572-.572z" /></svg>}>
          {profile.medicationHistory.map((m, i) => (
            <div key={i} className="bg-gray-50 p-2 rounded flex justify-between items-center text-sm">
              <span className="font-bold text-gray-700">{m.name}</span>
              <span className="text-gray-500">{m.dosage} - {m.frequency}</span>
            </div>
          ))}
        </Section>
      </div>

      <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex flex-col items-center gap-3 mt-4">
        <h4 className="font-bold text-emerald-800">{t.emergencyContact}</h4>
        <div className="text-center">
          <p className="text-gray-700 font-medium">{profile.emergencyContactName}</p>
          <p className="text-emerald-600 text-lg font-bold">{profile.emergencyPhone}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
