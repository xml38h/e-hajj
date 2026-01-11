import { Language, TranslationSet, PilgrimProfile } from './types';

export const TRANSLATIONS: Record<Language, TranslationSet> = {
  [Language.AR]: {
    title: 'Hajj Care',
    personalData: 'البيانات الشخصية',
    medicalHistory: 'التاريخ الطبي',
    medications: 'التاريخ الدوائي',
    vitalSigns: 'القياسات الحيوية',
    emergencyContact: 'جهة التواصل للطوارئ',

    callEmergency: 'اتصال بالحملة',
    shareLocation: 'مشاركة الموقع',
    enterSecurityCode: 'أدخل رمز الأمان',
    securityPrompt: 'الرجاء إدخال رمز الأمان الموجود على السوار',
    accessGranted: 'تم السماح بالدخول',

    chronicDiseases: 'الأمراض المزمنة',
    allergies: 'الحساسية',
    surgeries: 'العمليات الجراحية',
    bloodType: 'فصيلة الدم',
    bloodPressure: 'ضغط الدم',
    bloodSugar: 'مستوى السكر',

    verify: 'تحقق',
    back: 'رجوع',
    language: 'اللغة',
    editProfile: 'تعديل البيانات',
    shareProfile: 'مشاركة الملف',
    scanInstructions: 'امسح الكود للوصول السريع للملف الطبي الخاص بك',
    close: 'إغلاق',

    // Demographics labels
    labelName: 'الاسم',
    labelIdPassport: 'رقم الهوية / الجواز',
    labelNationality: 'الجنسية',
    labelDob: 'تاريخ الميلاد',
    labelAge: 'العمر',
    labelHeight: 'الطول',
    labelWeight: 'الوزن',
    labelBmi: 'مؤشر كتلة الجسم',
    yearsUnit: 'سنة',
    cmUnit: 'سم',
    kgUnit: 'كجم',

    // Emergency summary (AI)
    emergencySummaryAI: 'ملخص الطوارئ (AI)',
    analyzingMedicalData: 'جارِ تحليل البيانات الطبية...',
    noMedicalSummaryAvailable: '- لا يوجد ملخص طبي متاح.',
    summaryChronic: 'Chronic',
    summaryMeds: 'Meds',
    summaryLatestBP: 'Latest BP',
    summaryLatestSugar: 'Latest Sugar',

    // Vital history UI
    tapToViewHistory: 'اضغط لعرض السجل',
    noSugarReadings: 'لا توجد قراءات سكر',
    noBpReadings: 'لا توجد قراءات ضغط',
    pulseLabel: 'النبض',

    // Emergency contact card
    campaignPhoneLabel: 'رقم هاتف الحملة',
    redCrescentPhoneLabel: 'رقم الهلال الأحمر',
  },

  [Language.EN]: {
    title: 'Hajj Care',
    personalData: 'Demographics',
    medicalHistory: 'Medical History',
    medications: 'Medication History',
    vitalSigns: 'Vital Signs',
    emergencyContact: 'Emergency Contact',

    callEmergency: 'Call Campaign',
    shareLocation: 'Share Location',
    enterSecurityCode: 'Enter Security Code',
    securityPrompt: 'Code on the back of the bracelet',
    accessGranted: 'Access Granted',

    chronicDiseases: 'Chronic Diseases',
    allergies: 'Allergies',
    surgeries: 'Surgeries',
    bloodType: 'Blood Type',
    bloodPressure: 'Blood Pressure',
    bloodSugar: 'Blood Sugar',

    verify: 'Verify',
    back: 'Back',
    language: 'Language',
    editProfile: 'Edit Profile',
    shareProfile: 'Share Profile',
    scanInstructions: 'Scan this code for quick access to your medical records',
    close: 'Close',

    // Demographics labels
    labelName: 'Name',
    labelIdPassport: 'ID / Passport',
    labelNationality: 'Nationality',
    labelDob: 'Date of Birth',
    labelAge: 'Age',
    labelHeight: 'Height',
    labelWeight: 'Weight',
    labelBmi: 'BMI',
    yearsUnit: 'years',
    cmUnit: 'cm',
    kgUnit: 'kg',

    // Emergency summary (AI)
    emergencySummaryAI: 'Emergency Summary (AI)',
    analyzingMedicalData: 'Analyzing medical data...',
    noMedicalSummaryAvailable: '- No medical summary available.',
    summaryChronic: 'Chronic',
    summaryMeds: 'Meds',
    summaryLatestBP: 'Latest BP',
    summaryLatestSugar: 'Latest Sugar',

    // Vital history UI
    tapToViewHistory: 'Tap to view history',
    noSugarReadings: 'No blood sugar readings',
    noBpReadings: 'No blood pressure readings',
    pulseLabel: 'Pulse',

    // Emergency contact card
    campaignPhoneLabel: 'Campaign Phone',
    redCrescentPhoneLabel: 'Red Crescent',
  },

  [Language.UR]: {
    title: 'Hajj Care',
    personalData: 'ذاتی معلومات',
    medicalHistory: 'طبی تاریخ',
    medications: 'ادویات کی تفصیل',
    vitalSigns: 'وائٹل سائنز',
    emergencyContact: 'ایمرجنسی رابطہ',

    callEmergency: 'کیمپ کو کال کریں',
    shareLocation: 'لوکیشن شیئر کریں',
    enterSecurityCode: 'سیکیورٹی کوڈ درج کریں',
    securityPrompt: 'بریسلٹ کے پیچھے والا کوڈ',
    accessGranted: 'رسائی مل گئی',

    chronicDiseases: 'دائمی بیماریاں',
    allergies: 'الرجی',
    surgeries: 'سرجری',
    bloodType: 'خون کا گروپ',
    bloodPressure: 'بلڈ پریشر',
    bloodSugar: 'بلڈ شوگر',

    verify: 'تصدیق کریں',
    back: 'واپس',
    language: 'زبان',
    editProfile: 'پروفائل ایڈٹ کریں',
    shareProfile: 'پروفائل شیئر کریں',
    scanInstructions: 'طبی ریکارڈ تک فوری رسائی کے لیے اس کوڈ کو اسکین کریں',
    close: 'بند کریں',

    // Demographics labels
    labelName: 'نام',
    labelIdPassport: 'آئی ڈی / پاسپورٹ',
    labelNationality: 'قومیت',
    labelDob: 'تاریخ پیدائش',
    labelAge: 'عمر',
    labelHeight: 'قد',
    labelWeight: 'وزن',
    labelBmi: 'BMI',
    yearsUnit: 'سال',
    cmUnit: 'سینٹی میٹر',
    kgUnit: 'کلو',

    // Emergency summary (AI)
    emergencySummaryAI: 'ایمرجنسی خلاصہ (AI)',
    analyzingMedicalData: 'طبی معلومات کا تجزیہ ہو رہا ہے...',
    noMedicalSummaryAvailable: '- کوئی طبی خلاصہ دستیاب نہیں۔',
    summaryChronic: 'Chronic',
    summaryMeds: 'Meds',
    summaryLatestBP: 'Latest BP',
    summaryLatestSugar: 'Latest Sugar',

    // Vital history UI
    tapToViewHistory: 'ہسٹری دیکھنے کے لیے ٹیپ کریں',
    noSugarReadings: 'بلڈ شوگر کی کوئی ریڈنگ نہیں',
    noBpReadings: 'بلڈ پریشر کی کوئی ریڈنگ نہیں',
    pulseLabel: 'نبض',

    // Emergency contact card
    campaignPhoneLabel: 'کیمپ فون',
    redCrescentPhoneLabel: 'ریڈ کریسنٹ',
  },

  [Language.ID]: {
    title: 'Hajj Care',
    personalData: 'Data Pribadi',
    medicalHistory: 'Riwayat Medis',
    medications: 'Riwayat Obat',
    vitalSigns: 'Tanda Vital',
    emergencyContact: 'Kontak Darurat',

    callEmergency: 'Hubungi Rombongan',
    shareLocation: 'Bagikan Lokasi',
    enterSecurityCode: 'Masukkan Kode Keamanan',
    securityPrompt: 'Kode di belakang gelang',
    accessGranted: 'Akses Diberikan',

    chronicDiseases: 'Penyakit Kronis',
    allergies: 'Alergi',
    surgeries: 'Operasi',
    bloodType: 'Golongan Darah',
    bloodPressure: 'Tekanan Darah',
    bloodSugar: 'Gula Darah',

    verify: 'Verifikasi',
    back: 'Kembali',
    language: 'Bahasa',
    editProfile: 'Edit Profil',
    shareProfile: 'Bagikan Profil',
    scanInstructions: 'Pindai kode ini untuk akses cepat ke rekam medis',
    close: 'Tutup',

    // Demographics labels
    labelName: 'Nama',
    labelIdPassport: 'ID / Paspor',
    labelNationality: 'Kewarganegaraan',
    labelDob: 'Tanggal Lahir',
    labelAge: 'Usia',
    labelHeight: 'Tinggi',
    labelWeight: 'Berat',
    labelBmi: 'BMI',
    yearsUnit: 'tahun',
    cmUnit: 'cm',
    kgUnit: 'kg',

    // Emergency summary (AI)
    emergencySummaryAI: 'Ringkasan Darurat (AI)',
    analyzingMedicalData: 'Menganalisis data medis...',
    noMedicalSummaryAvailable: '- Tidak ada ringkasan medis.',
    summaryChronic: 'Chronic',
    summaryMeds: 'Meds',
    summaryLatestBP: 'Latest BP',
    summaryLatestSugar: 'Latest Sugar',

    // Vital history UI
    tapToViewHistory: 'Ketuk untuk melihat riwayat',
    noSugarReadings: 'Tidak ada catatan gula darah',
    noBpReadings: 'Tidak ada catatan tekanan darah',
    pulseLabel: 'Nadi',

    // Emergency contact card
    campaignPhoneLabel: 'Telepon Rombongan',
    redCrescentPhoneLabel: 'Palang Merah Bulan Sabit',
  },
};

export const DEFAULT_PROFILE: PilgrimProfile = {
  id: 'H-2024-' + Math.floor(1000 + Math.random() * 9000),
  fullName: 'أحمد بن عبدالله',
  nationality: 'سعودي',
  nativeLanguage: 'العربية',
  passportId: '123456789',
  emergencyContactName: 'اسم الحملة',
  emergencyPhone: '0500000000',
  securityCode: '1234',
  medicalHistory: {
    chronicDiseases: ['السكري'],
    allergies: ['البنسلين'],
    previousSurgeries: [],
  },
  medicationHistory: [{ name: 'منظم سكر', dosage: '500ملجم', frequency: 'مرتين يومياً' }],
  vitalSigns: {
    bloodType: 'O+',
    lastUpdated: new Date().toISOString(),
    bloodSugarReadings: [],
    bloodPressureReadings: [],
  },
};
