
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

export interface VitalSigns {
  bloodSugar: string;
  bloodPressure: string;
  bloodType: string;
  lastUpdated: string;
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
  emergencyContactName: string;
  emergencyPhone: string;
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
