/**
 * Lightweight Type-Safe Localization Engine for FieldNote
 * 
 * Supports:
 * - English (en-US)
 * - Telugu (te-IN) with Noto Sans Telugu shaping
 * - Hindi (hi-IN) with Noto Sans Devanagari shaping
 */

import { useSettingsStore } from './stores/settingsStore';

export type SupportedLanguage = 'en-US' | 'te-IN' | 'hi-IN';

export const TRANSLATIONS = {
  'en-US': {
    // Navigation
    navCapture: 'Capture',
    navReports: 'Reports',
    navTasks: 'Tasks',
    navMore: 'More',
    // Top Bar & Branding
    appName: 'FieldNote',
    offlineStatus: 'OFFLINE CORE',
    daylightMode: 'Daylight Mode',
    darkMode: 'Dark Mode',
    // Capture Home
    whatHappened: 'What happened today?',
    recentReports: 'Recent Reports',
    handsFree: 'Hands-free voice detection',
    cameraOcr: 'Camera OCR',
    importFiles: 'Import Hub',
    qrScanner: 'QR / Barcode',
    // Recording
    recordingState: 'RECORDING',
    pause: 'Pause',
    resume: 'Resume',
    finish: 'Finish & Compile',
    // Priority & Status
    highPriority: 'High Priority',
    criticalPriority: 'Critical Priority',
    inReview: 'In Review',
    verified: 'Verified',
    openActions: 'Open Actions',
    completed: 'Completed',
    // More Modules
    weeklyRollup: 'Weekly Field Summary',
    weeklyRollupDesc: 'Site rollup, recurring hazard counts, and manager dashboard',
    officeKit: 'Office Kit Bridge',
    officeKitDesc: 'Phone ⇄ Laptop sync, file drop zone, and manager console',
    privacyTrust: 'Privacy & Security Vault',
    privacyTrustDesc: 'AES-GCM encryption, app lock, redaction, and hash verification',
    templatesGlossary: 'Templates & Glossary',
    templatesGlossaryDesc: '5 category templates, custom builder, and glossary spell-check',
    aboutApp: 'About FieldNote',
    aboutAppDesc: 'System build specs, offline engine status, and cryptographic seal',
    languageSetting: 'Language & Field Script',
    themeSetting: 'Display Theme',
    demoTour: 'Demo Tour',
  },
  'te-IN': {
    // Navigation
    navCapture: 'క్యాప్చర్',
    navReports: 'నివేదికలు',
    navTasks: 'పనులు',
    navMore: 'మరిన్ని',
    // Top Bar & Branding
    appName: 'ఫీల్డ్‌నోట్',
    offlineStatus: 'ఆఫ్‌లైన్ కోర్',
    daylightMode: 'డేలైట్ మోడ్',
    darkMode: 'డార్క్ మోడ్',
    // Capture Home
    whatHappened: 'ఈరోజు ఫీల్డ్‌లో ఏమి జరిగింది?',
    recentReports: 'ఇటీవలి నివేదికలు',
    handsFree: 'హ్యాండ్స్-ఫ్రీ వాయిస్ డిటెక్షన్',
    cameraOcr: 'కెమెరా OCR',
    importFiles: 'దిగుమతి హబ్',
    qrScanner: 'QR / బార్‌కోడ్',
    // Recording
    recordingState: 'రికార్డింగ్ జరుగుతోంది',
    pause: 'పాజ్ చేయండి',
    resume: 'పునఃప్రారంభించండి',
    finish: 'పూర్తి చేసి కంపైల్ చేయండి',
    // Priority & Status
    highPriority: 'అత్యధిక ప్రాధాన్యత',
    criticalPriority: 'కీలక ప్రాధాన్యత',
    inReview: 'సమీక్షలో ఉంది',
    verified: 'ధృవీకరించబడింది',
    openActions: 'మిగిలిన పనులు',
    completed: 'పూర్తయింది',
    // More Modules
    weeklyRollup: 'వారపు ఫీల్డ్ సారాంశం',
    weeklyRollupDesc: 'సైట్ రోలప్, పునరావృత సమస్యలు మరియు మేనేజర్ డాష్‌బోర్డ్',
    officeKit: 'ఆఫీస్ కిట్ బ్రిడ్జ్',
    officeKitDesc: 'ఫోన్ ⇄ ల్యాప్‌టాప్ బదిలీ, ఫైల్ డ్రాప్ జోన్ మరియు కన్సోల్',
    privacyTrust: 'గోప్యత & భద్రతా వాల్ట్',
    privacyTrustDesc: 'AES-GCM ఎన్‌క్రిప్షన్, యాప్ లాక్, రెడాక్షన్ మరియు హ్యాష్ ధృవీకరణ',
    templatesGlossary: 'టెంప్లేట్లు & పదకోశం',
    templatesGlossaryDesc: '5 కేటగిరీ టెంప్లేట్లు, కస్టమ్ బిల్డర్ మరియు స్పెల్లింగ్ సవరణ',
    aboutApp: 'ఫీల్డ్‌నోట్ గురించి',
    aboutAppDesc: 'సిస్టమ్ వివరాలు, ఆఫ్‌లైన్ ఇంజిన్ స్థితి మరియు క్రిప్టో సీల్',
    languageSetting: 'భాష మరియు లిపి',
    themeSetting: 'థీమ్ ఎంపిక',
    demoTour: 'డెమో టూర్',
  },
  'hi-IN': {
    // Navigation
    navCapture: 'कैप्चर',
    navReports: 'रिपोर्ट्स',
    navTasks: 'कार्य',
    navMore: 'अधिक',
    // Top Bar & Branding
    appName: 'फील्डनोट',
    offlineStatus: 'ऑफलाइन कोर',
    daylightMode: 'डेलाइट मोड',
    darkMode: 'डार्क मोड',
    // Capture Home
    whatHappened: 'आज फील्ड में क्या हुआ?',
    recentReports: 'हालिया रिपोर्ट्स',
    handsFree: 'हैंड्स-फ्री वॉयस डिटेक्शन',
    cameraOcr: 'कैमरा OCR',
    importFiles: 'आयात हब',
    qrScanner: 'QR / बारकोड',
    // Recording
    recordingState: 'रिकॉर्डिंग जारी है',
    pause: 'रोकें',
    resume: 'फिर से शुरू करें',
    finish: 'समाप्त और संकलित करें',
    // Priority & Status
    highPriority: 'उच्च प्राथमिकता',
    criticalPriority: 'अति महत्वपूर्ण',
    inReview: 'समीक्षाधीन',
    verified: 'सत्यापित',
    openActions: 'खुले कार्य',
    completed: 'पूर्ण',
    // More Modules
    weeklyRollup: 'साप्ताहिक फील्ड सारांश',
    weeklyRollupDesc: 'साइट रोलअप, आवर्ती समस्याएं और प्रबंधक डैशबोर्ड',
    officeKit: 'ऑफिस किट ब्रिज',
    officeKitDesc: 'फोन ⇄ लैपटॉप ट्रांसफर, फाइल ड्रॉप ज़ोन और कंसोल',
    privacyTrust: 'गोपनीयता और सुरक्षा वॉल्ट',
    privacyTrustDesc: 'AES-GCM एन्क्रिप्शन, ऐप लॉक, रेडैक्शन और हैश सत्यापन',
    templatesGlossary: 'टेम्प्लेट्स और शब्दावली',
    templatesGlossaryDesc: '5 श्रेणी टेम्प्लेट्स, कस्टम बिल्डर और वर्तनी सुधार',
    aboutApp: 'फील्डनोट के बारे में',
    aboutAppDesc: 'सिस्टम विनिर्देश, ऑफलाइन इंजन स्थिति और क्रिप्टो सील',
    languageSetting: 'भाषा और लिपि',
    themeSetting: 'थीम चयन',
    demoTour: 'डेमो टूर',
  },
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS['en-US'];

/**
 * Hook to retrieve the current language and translator function
 */
export function useTranslation() {
  const preferredLanguage = useSettingsStore((s) => s.settings.preferredLanguage) || 'en-US';
  const lang: SupportedLanguage = preferredLanguage in TRANSLATIONS ? preferredLanguage : 'en-US';

  const t = (key: TranslationKey): string => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS['en-US'];
    return dict[key] || TRANSLATIONS['en-US'][key] || key;
  };

  return { t, language: lang };
}
