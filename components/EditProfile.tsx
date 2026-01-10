
import React, { useState } from 'react';
import { PilgrimProfile, TranslationSet, Language } from '../types';

interface EditProfileProps {
  profile: PilgrimProfile;
  onSave: (updatedProfile: PilgrimProfile) => void;
  onCancel: () => void;
  t: TranslationSet;
  isRtl: boolean;
}

const EditProfile: React.FC<EditProfileProps> = ({ profile, onSave, onCancel, t, isRtl }) => {
  const [form, setForm] = useState<PilgrimProfile>(profile);

  const handleChange = (path: string, value: any) => {
    const keys = path.split('.');
    if (keys.length === 1) {
      setForm({ ...form, [keys[0]]: value });
    } else {
      setForm({
        ...form,
        [keys[0]]: { ...form[keys[0]], [keys[1]]: value }
      });
    }
  };

  const Input = ({ label, value, onChange, placeholder }: any) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-gray-500">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800"
      />
    </div>
  );

  return (
    <div className={`space-y-6 pb-20 ${isRtl ? 'rtl' : ''}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">{t.editProfile}</h2>
        <button onClick={onCancel} className="text-gray-400 font-medium">{t.close}</button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <h3 className="font-bold text-emerald-700 border-b pb-2">{t.personalData}</h3>
        <Input label="الاسم الكامل" value={form.fullName} onChange={(v) => handleChange('fullName', v)} />
        <Input label="الجنسية" value={form.nationality} onChange={(v) => handleChange('nationality', v)} />
        <Input label="رقم الجواز" value={form.passportId} onChange={(v) => handleChange('passportId', v)} />
        <Input label="رقم الطوارئ" value={form.emergencyPhone} onChange={(v) => handleChange('emergencyPhone', v)} />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <h3 className="font-bold text-emerald-700 border-b pb-2">{t.vitalSigns}</h3>
        <div className="grid grid-cols-2 gap-3">
          <Input label="فصيلة الدم" value={form.vitalSigns.bloodType} onChange={(v) => handleChange('vitalSigns.bloodType', v)} />
          <Input label="الضغط" value={form.vitalSigns.bloodPressure} onChange={(v) => handleChange('vitalSigns.bloodPressure', v)} />
        </div>
        <Input label="السكر" value={form.vitalSigns.bloodSugar} onChange={(v) => handleChange('vitalSigns.bloodSugar', v)} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t flex gap-3 z-50">
        <button
          onClick={() => onSave({...form, vitalSigns: {...form.vitalSigns, lastUpdated: new Date().toLocaleString()}})}
          className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700"
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
