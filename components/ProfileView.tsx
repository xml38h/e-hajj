import React, { useEffect, useMemo, useState } from 'react';
import { PilgrimProfile, TranslationSet, Language } from '../types';
import { getEmergencyBrief } from '../services/geminiService';

function safeLocale(lang: Language): string | undefined {
  // Prefer explicit locale strings for consistent formatting.
  switch (lang) {
    case Language.AR:
      return 'ar';
    case Language.EN:
      return 'en';
    case Language.UR:
      return 'ur';
    case Language.ID:
      return 'id';
    default:
      return undefined;
  }
}

function formatDateTime(iso: string | undefined, locale?: string) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString(locale);
  } catch {
    return iso;
  }
}

function toStringArray(v: any): string[] {
  if (Array.isArray(v)) return v.filter(Boolean).map((x) => String(x).trim()).filter(Boolean);
  if (typeof v === 'string') {
    const s = v.trim();
    if (!s) return [];
    if (s.includes(',')) return s.split(',').map((x) => x.trim()).filter(Boolean);
    return [s];
  }
  return [];
}

function buildFallbackSummary(profile: PilgrimProfile, t: TranslationSet, locale?: string) {
  const chronic = toStringArray((profile as any)?.medicalHistory?.chronicDiseases);

  const meds = Array.isArray((profile as any)?.medicationHistory) ? (profile as any).medicationHistory : [];
  const medsText = meds
    .map((m: any) => `${m?.name || ''} ${m?.dosage || ''} (${m?.frequency || ''})`.trim())
    .filter(Boolean)
    .join(' | ');

  const latestBP = ((profile as any)?.vitalSigns?.bloodPressureReadings || [])
    .slice()
    .sort((a: any, b: any) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime())[0];

  const latestSugar = ((profile as any)?.vitalSigns?.bloodSugarReadings || [])
    .slice()
    .sort((a: any, b: any) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime())[0];

  const lines: string[] = [];

  if (chronic.length) lines.push(`- ${t.summaryChronic}: ${chronic.join(', ')}`);
  if (medsText) lines.push(`- ${t.summaryMeds}: ${medsText}`);

  if (latestBP) {
    lines.push(
      `- ${t.summaryLatestBP}: ${latestBP.systolic}/${latestBP.diastolic} mmHg (${formatDateTime(
        latestBP.measuredAt,
        locale
      )})`
    );
  }

  if (latestSugar) {
    lines.push(
      `- ${t.summaryLatestSugar}: ${latestSugar.value} ${latestSugar.unit} (${formatDateTime(
        latestSugar.measuredAt,
        locale
      )})`
    );
  }

  return lines.length ? lines.join('\n') : t.noMedicalSummaryAvailable;
}

/** Small chip UI */
const Chip: React.FC<{ text: string; tone?: 'normal' | 'danger' }> = ({ text, tone = 'normal' }) => (
  <span
    className={[
      'text-sm px-2 py-0.5 rounded border font-medium',
      tone === 'danger' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-gray-100 text-gray-700 border-gray-200',
    ].join(' ')}
  >
    {text}
  </span>
);

interface ProfileViewProps {
  profile: PilgrimProfile;
  t: TranslationSet;
  isRtl: boolean;
  currentLang: Language;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, t, isRtl, currentLang }) => {
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Modal state for history
  const [openModal, setOpenModal] = useState<null | 'sugar' | 'bp'>(null);

  const locale = useMemo(() => safeLocale(currentLang), [currentLang]);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoadingAi(true);

      const summary = await getEmergencyBrief(profile, currentLang);
      const cleaned = String(summary || '').trim();

      const looksGeneric =
        /^here\s+is/i.test(cleaned) || /^emergency\s+summary/i.test(cleaned) || cleaned.length < 40;

      setAiSummary(looksGeneric ? buildFallbackSummary(profile, t, locale) : cleaned);

      setLoadingAi(false);
    };

    fetchSummary();
  }, [profile, currentLang, t, locale]);

  // Latest readings (sorted by measuredAt desc)
  const latestSugar = useMemo(() => {
    const arr = profile.vitalSigns?.bloodSugarReadings ?? [];
    if (!arr.length) return null;
    return arr.slice().sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime())[0];
  }, [profile.vitalSigns?.bloodSugarReadings]);

  const latestBp = useMemo(() => {
    const arr = profile.vitalSigns?.bloodPressureReadings ?? [];
    if (!arr.length) return null;
    return arr.slice().sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime())[0];
  }, [profile.vitalSigns?.bloodPressureReadings]);

  const Section = ({
    title,
    icon,
    children,
  }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
      <div className={`flex items-center gap-2 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <div className="text-emerald-600">{icon}</div>
        <h3 className="font-bold text-gray-800">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );

  const DataRow = ({
    label,
    value,
    badge = false,
  }: {
    label: string;
    value: string | string[];
    badge?: boolean;
  }) => (
    <div className={`flex flex-col ${isRtl ? 'items-end text-right' : 'items-start text-left'}`}>
      <span className="text-xs text-gray-400 uppercase font-semibold">{label}</span>

      {Array.isArray(value) ? (
        value.length ? (
          <div className={`flex flex-wrap gap-1 mt-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
            {value.map((v, i) => (
              <span key={i}>
                <Chip text={v} tone={badge ? 'danger' : 'normal'} />
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-400 font-medium">—</span>
        )
      ) : (
        <span className={`text-gray-800 font-medium ${badge ? 'text-lg text-emerald-700' : ''}`}>
          {value && value.trim() ? value : '—'}
        </span>
      )}
    </div>
  );

  // Normalize medical arrays
  const chronicList = toStringArray((profile as any)?.medicalHistory?.chronicDiseases);
  const allergyList = toStringArray((profile as any)?.medicalHistory?.allergies);
  const surgeryList = toStringArray((profile as any)?.medicalHistory?.previousSurgeries);

  // Normalize medicationHistory safely
  const medsList: Array<{ name: string; dosage: string; frequency: string }> = useMemo(() => {
    const raw = (profile as any)?.medicationHistory;
    if (!Array.isArray(raw)) return [];
    return raw
      .map((m: any) => ({
        name: String(m?.name ?? '').trim(),
        dosage: String(m?.dosage ?? '').trim(),
        frequency: String(m?.frequency ?? '').trim(),
      }))
      .filter((m) => (m.name + m.dosage + m.frequency).trim() !== '');
  }, [profile]);

  const HistoryModal = () => {
    if (!openModal) return null;

    const sugarList = (profile.vitalSigns?.bloodSugarReadings ?? [])
      .slice()
      .sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime());

    const bpList = (profile.vitalSigns?.bloodPressureReadings ?? [])
      .slice()
      .sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime());

    const isSugar = openModal === 'sugar';

    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md p-4 shadow-2xl">
          <div className={`flex justify-between items-center mb-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <h3 className="font-extrabold">{isSugar ? t.bloodSugar : t.bloodPressure}</h3>
            <button onClick={() => setOpenModal(null)} className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700">
              {t.close}
            </button>
          </div>

          <div className="space-y-2 max-h-[60vh] overflow-auto">
            {isSugar ? (
              sugarList.length ? (
                sugarList.map((r, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-3">
                    <div className={`flex justify-between items-center ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <div className="font-bold">
                        {r.value} {r.unit}
                      </div>
                      <div className="text-xs text-gray-500">{formatDateTime(r.measuredAt, locale)}</div>
                    </div>
                    {r.note && <div className="text-xs text-gray-600 mt-1">{r.note}</div>}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">{t.noSugarReadings}</div>
              )
            ) : bpList.length ? (
              bpList.map((r, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-3">
                  <div className={`flex justify-between items-center ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <div className="font-bold">
                      {r.systolic}/{r.diastolic} mmHg
                    </div>
                    <div className="text-xs text-gray-500">{formatDateTime(r.measuredAt, locale)}</div>
                  </div>
                  {r.pulse != null && <div className="text-xs text-gray-600 mt-1">{t.pulseLabel}: {r.pulse}</div>}
                  {r.note && <div className="text-xs text-gray-600 mt-1">{r.note}</div>}
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">{t.noBpReadings}</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ageText = profile.ageYears != null ? `${profile.ageYears} ${t.yearsUnit}` : '—';
  const heightText = profile.heightCm != null ? `${profile.heightCm} ${t.cmUnit}` : '—';
  const weightText = profile.weightKg != null ? `${profile.weightKg} ${t.kgUnit}` : '—';

  return (
    <div className={`pb-24 ${isRtl ? 'rtl' : ''}`}>
      {/* Critical Alert Area (AI Summary) */}
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-xl">
        <div className={`flex items-center gap-2 mb-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-bold text-amber-800 text-sm">{t.emergencySummaryAI}</span>
        </div>

        <div className="text-sm text-amber-900 leading-relaxed italic whitespace-pre-line">
          {loadingAi ? t.analyzingMedicalData : aiSummary}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Demographics */}
        <Section
          title={t.personalData}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          }
        >
          <DataRow label={t.labelName} value={profile.fullName} />
          <DataRow label={t.labelIdPassport} value={profile.passportId} />
          <DataRow label={t.labelNationality} value={profile.nationality} />
          <DataRow label={t.labelDob} value={profile.dateOfBirth ? profile.dateOfBirth : '—'} />
          <DataRow label={t.labelAge} value={ageText} />
          <DataRow label={t.labelHeight} value={heightText} />
          <DataRow label={t.labelWeight} value={weightText} />
          <DataRow label={t.labelBmi} value={profile.bmi != null ? String(profile.bmi) : '—'} />
        </Section>

        {/* Vital Signs */}
        <Section
          title={t.vitalSigns}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          }
        >
          {/* Row 1: Blood Type */}
          <div className="grid grid-cols-2 gap-4">
            <DataRow label={t.bloodType} value={profile.vitalSigns.bloodType} />
            <div />
          </div>

          {/* Row 2: BP + Sugar */}
          <div className="grid grid-cols-2 gap-4 mt-3">
            <button type="button" onClick={() => setOpenModal('bp')} className={`text-left ${isRtl ? 'text-right' : ''}`}>
              <div className="rounded-xl border border-gray-100 p-3 bg-gray-50 hover:bg-gray-100 transition">
                <span className="text-xs text-gray-400 uppercase font-semibold block">{t.bloodPressure}</span>
                <span className="text-gray-800 font-medium block mt-1">
                  {latestBp ? `${latestBp.systolic}/${latestBp.diastolic} mmHg` : '—'}
                </span>
                <span className="text-[10px] text-gray-400 mt-1 block">{t.tapToViewHistory}</span>
              </div>
            </button>

            <button type="button" onClick={() => setOpenModal('sugar')} className={`text-left ${isRtl ? 'text-right' : ''}`}>
              <div className="rounded-xl border border-gray-100 p-3 bg-gray-50 hover:bg-gray-100 transition">
                <span className="text-xs text-gray-400 uppercase font-semibold block">{t.bloodSugar}</span>
                <span className="text-gray-800 font-medium block mt-1">
                  {latestSugar ? `${latestSugar.value} ${latestSugar.unit}` : '—'}
                </span>
                <span className="text-[10px] text-gray-400 mt-1 block">{t.tapToViewHistory}</span>
              </div>
            </button>
          </div>
        </Section>

        {/* Medical history */}
        <Section
          title={t.medicalHistory}
          icon={
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5h6a2 2 0 012 2v12a2 2 0 01-2 2H9a2 2 0 01-2-2V7a2 2 0 012-2z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3h6v4H9z" />
            </svg>
          }
        >
          <DataRow label={t.chronicDiseases} value={chronicList} />
          <DataRow label={t.allergies} value={allergyList} badge />
          <DataRow label={t.surgeries} value={surgeryList} />
        </Section>

        {/* Medications */}
        <Section
          title={t.medications}
          icon={
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.9 6.5l7 7m-8.25-5.75l5.5-4.5a4 4 0 015.657 8.667l-5.5 5.5a4 4 0 01-5.657-9.157z"
              />
            </svg>
          }
        >
          {medsList.length ? (
            medsList.map((m, i) => (
              <div key={i} className="bg-gray-50 p-2 rounded flex justify-between items-center text-sm">
                <span className="font-bold text-gray-700">{m.name || '—'}</span>
                <span className="text-gray-500">
                  {(m.dosage || '—')} - {(m.frequency || '—')}
                </span>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">—</div>
          )}
        </Section>
      </div>

    {/* Emergency contact */}
<div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex flex-col items-center gap-3 mt-4">
  <h4 className="font-bold text-emerald-800">{t.emergencyContact}</h4>


        <div className="text-center space-y-2">
          <p className="text-gray-700 font-medium">{profile.emergencyContactName}</p>

          <div>
            <p className="text-[11px] text-gray-500 font-bold">{t.campaignPhoneLabel}</p>
            <p className="text-emerald-700 text-lg font-extrabold">{profile.emergencyPhone}</p>
          </div>

          <div>
            <p className="text-[11px] text-gray-500 font-bold">{t.redCrescentPhoneLabel}</p>
            <p className="text-red-700 text-lg font-extrabold">{profile.redCrescentPhone ? profile.redCrescentPhone : '—'}</p>
          </div>
        </div>
      </div>

      <HistoryModal />
    </div>
  );
};

export default ProfileView;
