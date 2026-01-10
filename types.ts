export enum Language {
  AR = 'ar',
  EN = 'en',
  UR = 'ur',
  ID = 'id'
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

/** NEW: Reading history types */
export interface BloodSugarReading {
  value: number;
  unit: 'mg/dL' | 'mmol/L';
  measuredAt: string; // ISO datetime e.g. 2026-01-10T03:20:00
  note?: string;
}

export interface BloodPressureReading {
  systolic: number;
  diastolic: number;
  measuredAt: string; // ISO datetime
  pulse?: number;
  note?: string;
}

/** UPDATED: Vital signs now store multiple readings with date/time */
export interface VitalSigns {
  bloodType: string;
  lastUpdated: string;

  bloodSugarReadings: BloodSugarReading[];
  bloodPressureReadings: BloodPressureReading[];
}

export interface MedicalHistory {
  chronicDiseases: string[];
  allergies: string[];
  previousSurgeries: string[];
}

export interface PilgrimProfile {
  id: string;
  fullName: string;
  nationality: string;
  nativeLanguage: string;
  passportId: string;
  emergencyContactName: string;      // اسم مرافق / مسؤول الحملة
emergencyPhone: string;            // رقم الحملة
redCrescentPhone?: string;         // رقم الهلال الأحمر

    // ✅ NEW
  heightCm?: number;   // الطول بالسنتيمتر
  weightKg?: number;   // الوزن بالكيلو
  bmi?: number;        // يتم حسابه تلقائياً
    // ✅ NEW
  dateOfBirth?: string; // ISO مثل: "1998-05-21"
  ageYears?: number;    // اختياري (نحسبه تلقائيًا)

  medicalHistory: MedicalHistory;
  medicationHistory: Medication[];
  vitalSigns: VitalSigns;
  securityCode: string;
}

export interface TranslationSet {
  title: string;
  personalData: string;
  medicalHistory: string;
  medications: string;
  vitalSigns: string;
  emergencyContact: string;
  callEmergency: string;
  shareLocation: string;
  enterSecurityCode: string;
  securityPrompt: string;
  accessGranted: string;
  chronicDiseases: string;
  allergies: string;
  surgeries: string;
  bloodType: string;
  bloodPressure: string;
  bloodSugar: string;
  verify: string;
  back: string;
  language: string;
  editProfile: string;
  shareProfile: string;
  scanInstructions: string;
  close: string;
}
