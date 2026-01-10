import React, { useRef, useState } from 'react';
import { PilgrimProfile, TranslationSet } from '../types';

interface EditProfileProps {
  profile: PilgrimProfile;
  onSave: (updatedProfile: PilgrimProfile) => void;
  onCancel: () => void;
  t: TranslationSet;
  isRtl: boolean;
}

/** ✅ Chip: لاحظ ما نستقبل key هنا نهائياً */
const Chip: React.FC<{ text: string; onRemove: () => void }> = ({ text, onRemove }) => (
  <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-2xl">
    <span className="text-sm text-gray-700">{text}</span>
    <button
      type="button"
      onClick={onRemove}
      className="w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-500 hover:bg-gray-100"
      title="Remove"
    >
      ×
    </button>
  </div>
);

const EditProfile: React.FC<EditProfileProps> = ({ profile, onSave, onCancel, t, isRtl }) => {
  // 🔹 Refs لكل الحقول
  const fullNameRef = useRef<HTMLInputElement>(null);
  const nationalityRef = useRef<HTMLInputElement>(null);
  const passportRef = useRef<HTMLInputElement>(null);
  const emergencyRef = useRef<HTMLInputElement>(null);
  const bloodTypeRef = useRef<HTMLSelectElement>(null);
  const redCrescentRef = useRef<HTMLInputElement>(null);

  // ✅ height/weight + DOB
  const heightRef = useRef<HTMLInputElement>(null);
  const weightRef = useRef<HTMLInputElement>(null);
  const dobRef = useRef<HTMLInputElement>(null);

  const bpRef = useRef<HTMLInputElement>(null);
  const sugarRef = useRef<HTMLInputElement>(null);

  const [sugarUnit, setSugarUnit] = useState<'mg/dL' | 'mmol/L'>('mg/dL');

  // ✅ Medical Draft (multi)
  const [medicalDraft, setMedicalDraft] = useState<{
    chronicDiseases: string[];
    allergies: string[];
    previousSurgeries: string[];
  }>(() => {
    const m = (profile as any).medicalHistory;
    return {
      chronicDiseases: Array.isArray(m?.chronicDiseases) ? m.chronicDiseases : [],
      allergies: Array.isArray(m?.allergies) ? m.allergies : [],
      previousSurgeries: Array.isArray(m?.previousSurgeries) ? m.previousSurgeries : [],
    };
  });

  const [chronicInput, setChronicInput] = useState('');
  const [allergyInput, setAllergyInput] = useState('');
  const [surgeryInput, setSurgeryInput] = useState('');

  const addChronic = () => {
    const v = chronicInput.trim();
    if (!v) return;
    setMedicalDraft((prev) => ({ ...prev, chronicDiseases: [...prev.chronicDiseases, v] }));
    setChronicInput('');
  };

  const addAllergy = () => {
    const v = allergyInput.trim();
    if (!v) return;
    setMedicalDraft((prev) => ({ ...prev, allergies: [...prev.allergies, v] }));
    setAllergyInput('');
  };

  const addSurgery = () => {
    const v = surgeryInput.trim();
    if (!v) return;
    setMedicalDraft((prev) => ({ ...prev, previousSurgeries: [...prev.previousSurgeries, v] }));
    setSurgeryInput('');
  };

  // ✅ Medication History (multi)
  const [medicationHistory, setMedicationHistory] = useState<
    { name: string; dosage: string; frequency: string }[]
  >(() => {
    const mh = (profile as any).medicationHistory;
    return Array.isArray(mh) ? mh : [];
  });

  const Input = ({
    label,
    defaultValue,
    inputRef,
    placeholder,
  }: {
    label: string;
    defaultValue?: string;
    inputRef: React.RefObject<HTMLInputElement>;
    placeholder?: string;
  }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-gray-500">{label}</label>
      <input
        ref={inputRef}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800"
      />
    </div>
  );

  const handleSave = () => {
    const updatedProfile: PilgrimProfile = {
      ...profile,
      fullName: fullNameRef.current?.value || '',
      nationality: nationalityRef.current?.value || '',
      passportId: passportRef.current?.value || '',
      emergencyPhone: emergencyRef.current?.value || '',
      vitalSigns: {
        ...profile.vitalSigns,
        bloodType: bloodTypeRef.current?.value || profile.vitalSigns.bloodType,
      },
    };

    // ✅ الهلال الأحمر
    const rc = redCrescentRef.current?.value?.trim();
    (updatedProfile as any).redCrescentPhone = rc ? rc : undefined;

    // ✅ DOB + age
    const dob = dobRef.current?.value?.trim(); // "YYYY-MM-DD"
    if (dob) {
      (updatedProfile as any).dateOfBirth = dob;

      const birth = new Date(dob);
      const today = new Date();

      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

      (updatedProfile as any).ageYears = age;
    }

    // ✅ Height/Weight + BMI
    const heightCm = Number(heightRef.current?.value);
    const weightKg = Number(weightRef.current?.value);

    if (Number.isFinite(heightCm) && heightRef.current?.value !== '') (updatedProfile as any).heightCm = heightCm;
    if (Number.isFinite(weightKg) && weightRef.current?.value !== '') (updatedProfile as any).weightKg = weightKg;

    if (
      Number.isFinite(heightCm) &&
      Number.isFinite(weightKg) &&
      heightRef.current?.value !== '' &&
      weightRef.current?.value !== '' &&
      heightCm > 0
    ) {
      const hM = heightCm / 100;
      const bmi = weightKg / (hM * hM);
      (updatedProfile as any).bmi = Math.round(bmi * 10) / 10;
    }

    // ✅ Medical History (multi)
    (updatedProfile as any).medicalHistory = medicalDraft;

    // ✅ Medication History (multi) + تنظيف صفوف فاضية
    (updatedProfile as any).medicationHistory = medicationHistory.filter(
      (m) =>
        (m?.name || '').trim() !== '' ||
        (m?.dosage || '').trim() !== '' ||
        (m?.frequency || '').trim() !== ''
    );

    // ✅ ضغط
    const bpVal = bpRef.current?.value?.trim() || '';
    if (bpVal) {
      const match = bpVal.match(/^(\d{2,3})\/(\d{2,3})$/);
      if (match) {
        updatedProfile.vitalSigns.bloodPressureReadings = [
          {
            systolic: +match[1],
            diastolic: +match[2],
            measuredAt: new Date().toISOString(),
          },
          ...(profile.vitalSigns.bloodPressureReadings ?? []),
        ];
      }
    }

    // ✅ سكر
    const sugarRaw = sugarRef.current?.value?.trim();
    if (sugarRaw) {
      const sugarVal = Number(sugarRaw);
      if (Number.isFinite(sugarVal)) {
        updatedProfile.vitalSigns.bloodSugarReadings = [
          {
            value: sugarVal,
            unit: sugarUnit,
            measuredAt: new Date().toISOString(),
          },
          ...(profile.vitalSigns.bloodSugarReadings ?? []),
        ];
      }
    }

    updatedProfile.vitalSigns.lastUpdated = new Date().toISOString();

    onSave(updatedProfile);
  };

  return (
    <div className={`space-y-6 pb-20 ${isRtl ? 'rtl' : ''}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">{t.editProfile}</h2>
        <button onClick={onCancel} className="text-gray-400 font-medium">
          {t.close}
        </button>
      </div>

      {/* البيانات الشخصية */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
        <h3 className="font-bold text-emerald-700 border-b pb-2">{t.personalData}</h3>
        <Input label="الاسم الكامل" inputRef={fullNameRef} defaultValue={profile.fullName} />
        <Input label="الجنسية" inputRef={nationalityRef} defaultValue={profile.nationality} />
        <Input label="رقم الجواز" inputRef={passportRef} defaultValue={profile.passportId} />
        <Input label="رقم الطوارئ" inputRef={emergencyRef} defaultValue={profile.emergencyPhone} />

        <Input
          label="رقم الهلال الأحمر"
          inputRef={redCrescentRef}
          defaultValue={(profile as any).redCrescentPhone ?? ''}
          placeholder="مثال: 997 أو رقم مخصص"
        />

        {/* ✅ Height & Weight */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">الطول</label>
            <div className="flex items-center gap-2">
              <input
                ref={heightRef}
                defaultValue={(profile as any).heightCm != null ? String((profile as any).heightCm) : ''}
                placeholder="170"
                className="flex-1 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800"
              />
              <span className="text-sm font-bold text-gray-500 whitespace-nowrap">cm</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">الوزن</label>
            <div className="flex items-center gap-2">
              <input
                ref={weightRef}
                defaultValue={(profile as any).weightKg != null ? String((profile as any).weightKg) : ''}
                placeholder="75"
                className="flex-1 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800"
              />
              <span className="text-sm font-bold text-gray-500 whitespace-nowrap">kg</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500">تاريخ الميلاد</label>
          <input
            ref={dobRef}
            type="date"
            defaultValue={(profile as any).dateOfBirth ?? ''}
            className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800"
          />
        </div>

        {(profile as any).bmi != null && (
          <div className="text-sm text-gray-600">
            BMI الحالي: <span className="font-bold">{(profile as any).bmi}</span>
          </div>
        )}
      </div>

      {/* ✅ التاريخ الطبي (متعدد) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-5">
        <h3 className="font-bold text-emerald-700 border-b pb-2">{t.medicalHistory}</h3>

        {/* Chronic */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500">{t.chronicDiseases}</label>
          <div className="flex gap-2">
            <input
              value={chronicInput}
              onChange={(e) => setChronicInput(e.target.value)}
              placeholder="مثال: السكري"
              className="flex-1 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800"
            />
            <button
              type="button"
              onClick={addChronic}
              className="px-4 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
            >
              +
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {medicalDraft.chronicDiseases.map((x: string, i: number) => (
              <Chip
                key={`${x}-${i}`}
                text={x}
                onRemove={() =>
                  setMedicalDraft((prev) => {
                    const next = prev.chronicDiseases.filter((_, idx) => idx !== i);
                    return { ...prev, chronicDiseases: next };
                  })
                }
              />
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500">{t.allergies}</label>
          <div className="flex gap-2">
            <input
              value={allergyInput}
              onChange={(e) => setAllergyInput(e.target.value)}
              placeholder="مثال: البنسلين"
              className="flex-1 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800"
            />
            <button
              type="button"
              onClick={addAllergy}
              className="px-4 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
            >
              +
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {medicalDraft.allergies.map((x: string, i: number) => (
              <Chip
                key={`${x}-${i}`}
                text={x}
                onRemove={() =>
                  setMedicalDraft((prev) => {
                    const next = prev.allergies.filter((_, idx) => idx !== i);
                    return { ...prev, allergies: next };
                  })
                }
              />
            ))}
          </div>
        </div>

        {/* Surgeries */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500">{t.surgeries}</label>
          <div className="flex gap-2">
            <input
              value={surgeryInput}
              onChange={(e) => setSurgeryInput(e.target.value)}
              placeholder="مثال: استئصال الزائدة"
              className="flex-1 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800"
            />
            <button
              type="button"
              onClick={addSurgery}
              className="px-4 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
            >
              +
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {medicalDraft.previousSurgeries.map((x: string, i: number) => (
              <Chip
                key={`${x}-${i}`}
                text={x}
                onRemove={() =>
                  setMedicalDraft((prev) => {
                    const next = prev.previousSurgeries.filter((_, idx) => idx !== i);
                    return { ...prev, previousSurgeries: next };
                  })
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* ✅ التاريخ الدوائي (متعدد) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
        <h3 className="font-bold text-emerald-700 border-b pb-2">{t.medications}</h3>

        <button
          type="button"
          onClick={() => setMedicationHistory((prev) => [...prev, { name: '', dosage: '', frequency: '' }])}
          className="w-full bg-emerald-50 text-emerald-700 py-3 rounded-2xl font-bold hover:bg-emerald-100"
        >
          + Add Medication
        </button>

        <div className="space-y-3">
          {medicationHistory.map((med, idx) => (
            <div key={`med-${idx}`} className="rounded-2xl border border-gray-100 p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  value={med.name}
                  onChange={(e) => {
                    const v = e.target.value;
                    setMedicationHistory((prev) => {
                      const next = [...prev];
                      next[idx] = { ...next[idx], name: v };
                      return next;
                    });
                  }}
                  placeholder="Medication name"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />

                <input
                  value={med.dosage}
                  onChange={(e) => {
                    const v = e.target.value;
                    setMedicationHistory((prev) => {
                      const next = [...prev];
                      next[idx] = { ...next[idx], dosage: v };
                      return next;
                    });
                  }}
                  placeholder="Dose (e.g., 500 mg)"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />

                <input
                  value={med.frequency}
                  onChange={(e) => {
                    const v = e.target.value;
                    setMedicationHistory((prev) => {
                      const next = [...prev];
                      next[idx] = { ...next[idx], frequency: v };
                      return next;
                    });
                  }}
                  placeholder="Frequency (e.g., BID)"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end mt-3">
                <button
                  type="button"
                  onClick={() =>
                    setMedicationHistory((prev) => {
                      const next = [...prev];
                      next.splice(idx, 1);
                      return next;
                    })
                  }
                  className="px-4 py-2 rounded-xl bg-red-50 text-red-700 font-bold hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* العلامات الحيوية */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
        <h3 className="font-bold text-emerald-700 border-b pb-2">{t.vitalSigns}</h3>

        {/* ✅ Blood Type select */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500">{t.bloodType}</label>
          <select
            ref={bloodTypeRef}
            defaultValue={profile.vitalSigns?.bloodType || ''}
            className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800 bg-white"
          >
            <option value="" disabled>
              اختر فصيلة الدم
            </option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500">إضافة قراءة ضغط</label>

          <div className="flex items-center gap-2">
            <input
              ref={bpRef}
              defaultValue=""
              placeholder="120/80"
              className="flex-1 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800"
            />
            <span className="text-sm font-bold text-gray-500 whitespace-nowrap">mmHg</span>
          </div>

          <div className="text-[11px] text-gray-400">مثال: 120/80</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="إضافة قراءة سكر" inputRef={sugarRef} placeholder="110" />
          <select
            value={sugarUnit}
            onChange={(e) => setSugarUnit(e.target.value as any)}
            className="border p-3 rounded-xl"
          >
            <option value="mg/dL">mg/dL</option>
            <option value="mmol/L">mmol/L</option>
          </select>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur border-t flex gap-3">
        <button onClick={handleSave} className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold">
          حفظ التغييرات
        </button>
        <button onClick={onCancel} className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold">
          {t.back}
        </button>
      </div>
    </div>
  );
};

export default EditProfile;
