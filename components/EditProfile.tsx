import React, { useRef, useState } from 'react';
import { PilgrimProfile, TranslationSet } from '../types';

interface EditProfileProps {
  profile: PilgrimProfile;
  onSave: (updatedProfile: PilgrimProfile) => void;
  onCancel: () => void;
  t: TranslationSet;
  isRtl: boolean;
}

const EditProfile: React.FC<EditProfileProps> = ({ profile, onSave, onCancel, t, isRtl }) => {
  // 🔹 Refs لكل الحقول
  const fullNameRef = useRef<HTMLInputElement>(null);
  const nationalityRef = useRef<HTMLInputElement>(null);
  const passportRef = useRef<HTMLInputElement>(null);
  const emergencyRef = useRef<HTMLInputElement>(null);
  const bloodTypeRef = useRef<HTMLInputElement>(null);
const redCrescentRef = useRef<HTMLInputElement>(null);

  // ✅ NEW: height/weight
  const heightRef = useRef<HTMLInputElement>(null);
  const weightRef = useRef<HTMLInputElement>(null);
const dobRef = useRef<HTMLInputElement>(null);

  const bpRef = useRef<HTMLInputElement>(null);
  const sugarRef = useRef<HTMLInputElement>(null);

  const [sugarUnit, setSugarUnit] = useState<'mg/dL' | 'mmol/L'>('mg/dL');

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
const dob = dobRef.current?.value?.trim(); // "YYYY-MM-DD"
if (dob) {
  updatedProfile.dateOfBirth = dob;
const rc = redCrescentRef.current?.value?.trim();
updatedProfile.redCrescentPhone = rc ? rc : undefined;

  // حساب العمر بالسنوات
  const birth = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

  updatedProfile.ageYears = age;
}

    // ✅ NEW: height/weight + BMI
    const heightCm = Number(heightRef.current?.value);
    const weightKg = Number(weightRef.current?.value);

    if (Number.isFinite(heightCm)) updatedProfile.heightCm = heightCm;
    if (Number.isFinite(weightKg)) updatedProfile.weightKg = weightKg;

    if (Number.isFinite(heightCm) && Number.isFinite(weightKg) && heightCm > 0) {
      const hM = heightCm / 100;
      const bmi = weightKg / (hM * hM);
      updatedProfile.bmi = Math.round(bmi * 10) / 10; // رقم عشري واحد
    }

    // ضغط
    const bpVal = bpRef.current?.value.trim();
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

    // سكر
    const sugarVal = Number(sugarRef.current?.value);
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

    updatedProfile.vitalSigns.lastUpdated = new Date().toISOString();

    onSave(updatedProfile);
  };

  return (
    <div className={`space-y-6 pb-20 ${isRtl ? 'rtl' : ''}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">{t.editProfile}</h2>
        <button onClick={onCancel} className="text-gray-400 font-medium">{t.close}</button>
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
  defaultValue={profile.redCrescentPhone ?? ''}
  placeholder="مثال: 997 أو رقم مخصص"
 />

        {/* ✅ NEW: Height & Weight */}
        <div className="grid grid-cols-2 gap-3">
  {/* Height */}
  <div className="flex flex-col gap-1">
    <label className="text-xs font-bold text-gray-500">الطول</label>
    <div className="flex items-center gap-2">
      <input
        ref={heightRef}
        defaultValue={profile.heightCm != null ? String(profile.heightCm) : ''}
        placeholder="170"
        className="flex-1 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800"
      />
      <span className="text-sm font-bold text-gray-500 whitespace-nowrap">cm</span>
    </div>
  </div>

  {/* Weight */}
  <div className="flex flex-col gap-1">
    <label className="text-xs font-bold text-gray-500">الوزن</label>
    <div className="flex items-center gap-2">
      <input
        ref={weightRef}
        defaultValue={profile.weightKg != null ? String(profile.weightKg) : ''}
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
    defaultValue={profile.dateOfBirth ?? ''}
    className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800"
  />
</div>


        {/* Optional: show BMI preview if exists */}
        {profile.bmi != null && (
          <div className="text-sm text-gray-600">
            BMI الحالي: <span className="font-bold">{profile.bmi}</span>
          </div>
        )}
      </div>

      {/* العلامات الحيوية */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
        <h3 className="font-bold text-emerald-700 border-b pb-2">{t.vitalSigns}</h3>

        <Input
          label="فصيلة الدم"
          inputRef={bloodTypeRef}
          defaultValue={profile.vitalSigns.bloodType}
        />

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
        <button
          onClick={handleSave}
          className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold"
        >
          حفظ التغييرات
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold"
        >
          {t.back}
        </button>
      </div>
    </div>
  );
};

export default EditProfile;
