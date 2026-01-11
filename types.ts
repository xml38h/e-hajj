export enum Language {
  AR = 'ar',
  EN = 'en',
  UR = 'ur',
  ID = 'id',
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

/** Reading history types */
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

/** Vital signs store multiple readings with date/time */
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

  emergencyContactName: string; // اسم الحملة / مسؤول الحملة
  emergencyPhone: string; // رقم الحملة
  redCrescentPhone?: string; // رقم الهلال الأحمر

  heightCm?: number;
  weightKg?: number;
  bmi?: number;

  dateOfBirth?: string; // ISO مثل: "1998-05-21"
  ageYears?: number;

  medicalHistory: MedicalHistory;
  medicationHistory: Medication[];
  vitalSigns: VitalSigns;

  securityCode: string;
}

export interface TranslationSet {
  // General / App
  title: string;
  language: string;
  close: string;
  back: string;
  verify: string;

  // Sections
  personalData: string;
  medicalHistory: string;
  medications: string;
  vitalSigns: string;

  // Buttons / Actions
  editProfile: string;
  shareProfile: string;
  callEmergency: string;
  shareLocation: string;

  // Security
  enterSecurityCode: string;
  securityPrompt: string;
  accessGranted: string;

  // Medical labels
  chronicDiseases: string;
  allergies: string;
  surgeries: string;
  bloodType: string;
  bloodPressure: string;
  bloodSugar: string;

  // Demographics labels
  labelName: string;
  labelIdPassport: string;
  labelNationality: string;
  labelDob: string;
  labelAge: string;
  labelHeight: string;
  labelWeight: string;
  labelBmi: string;
  yearsUnit: string;
  cmUnit: string;
  kgUnit: string;

  // Emergency summary (AI)
  emergencySummaryAI: string;
  analyzingMedicalData: string;
  noMedicalSummaryAvailable: string;
  summaryChronic: string; // e.g. "Chronic"
  summaryMeds: string; // e.g. "Meds"
  summaryLatestBP: string; // e.g. "Latest BP"
  summaryLatestSugar: string; // e.g. "Latest Sugar"

  // Vital history UI
  tapToViewHistory: string;
  noSugarReadings: string;
  noBpReadings: string;
  pulseLabel: string;

  // Emergency contact card
  emergencyContact: string;
  campaignPhoneLabel: string;
  redCrescentPhoneLabel: string;

  // QR / instructions (used elsewhere)
  scanInstructions: string;
  shareProfileLabel?: string; // backward/optional if older components expect different key
}
