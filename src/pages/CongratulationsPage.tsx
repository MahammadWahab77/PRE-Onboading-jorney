import React, { useState } from 'react';
import { Volume2, ArrowRight, ShieldCheck, CheckCircle2, Sparkles, Languages } from 'lucide-react';
import { useOnboarding } from '../context/OnboardingContext';
import { VoiceGuide } from '../components/VoiceGuide';
import { JourneyProgress } from '../components/JourneyProgress';

const LANGUAGES = [
  { code: 'en-IN', label: 'English', native: 'English', sample: 'Welcome to NxtWave. Let us complete your journey.' },
  { code: 'te-IN', label: 'Telugu', native: 'తెలుగు', sample: 'నెక్స్ట్‌వేవ్‌కు స్వాగతం. మీ ఆన్‌బోర్డింగ్ ప్రారంభిద్దాం.' },
  { code: 'hi-IN', label: 'Hindi', native: 'हिन्दी', sample: 'नेक्स्टवेव में आपका स्वागत है। आइए आपकी ऑनबोर्डिंग पूरी करें।' },
  { code: 'ta-IN', label: 'Tamil', native: 'தமிழ்', sample: 'நெக்ஸ்ட்வேவ் வரவேற்கிறது. உங்கள் பயணத்தை தொடங்குவோம்.' },
  { code: 'kn-IN', label: 'Kannada', native: 'ಕನ್ನಡ', sample: 'ನೆಕ್ಸ್ಟ್‌ವೇವ್‌ಗೆ ಸ್ವಾಗತ. ನಿಮ್ಮ ಆನ್‌ಬೋರ್ಡಿಂಗ್ ಪೂರ್ಣಗೊಳಿಸೋಣ.' },
];

export const CongratulationsPage: React.FC = () => {
  const { state, selectLanguage, navigate } = useOnboarding();
  const [playingCode, setPlayingCode] = useState<string | null>(null);

  const studentName = state.name || 'Student';
  const voiceMsg = `Congratulations ${studentName}. Your registration is verified. Please select your preferred language. I will guide you step by step.`;

  const handlePreviewVoice = (e: React.MouseEvent, langCode: string, sampleText: string) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(sampleText);
    utterance.lang = langCode;
    utterance.rate = 0.95;
    utterance.onstart = () => setPlayingCode(langCode);
    utterance.onend = () => setPlayingCode(null);
    utterance.onerror = () => setPlayingCode(null);

    window.speechSynthesis.speak(utterance);
  };

  const handleStartJourney = () => {
    navigate('/onboarding/payment-options');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-[#2D3A3A] select-none">
      <JourneyProgress />
      <VoiceGuide text={voiceMsg} language={state.selectedLanguage} />

      <div className="bg-white border-2 border-[#E5E2D9] rounded-[2rem] p-8 sm:p-12 shadow-sm text-center relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-[#FFF8EB] rounded-full blur-2xl pointer-events-none opacity-60" />
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-[#E8F0FE] rounded-full blur-2xl pointer-events-none opacity-60" />

        <div className="w-20 h-20 bg-[#E8F0FE] text-[#0B4A99] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-[#E5E2D9]">
          <ShieldCheck className="w-10 h-10 text-green-600" />
        </div>

        <span className="inline-block px-4 py-1.5 bg-[#E8F0FE] text-[#0B4A99] rounded-full text-xs font-bold uppercase tracking-widest mb-4">
          Identity Verified in Salesforce
        </span>

        <h1 className="text-3xl sm:text-5xl font-bold text-[#1A1A1A] mb-4 tracking-tight">
          Congratulations, {studentName}!
        </h1>

        <p className="text-[#5D5852] text-lg sm:text-xl max-w-2xl mx-auto font-serif italic mb-10 leading-relaxed">
          "Your downpayment registration has been verified. Select your preferred voice guidance language below so I can guide you page-by-page."
        </p>

        {/* Language Selection Grid */}
        <div className="mb-10">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Languages className="w-5 h-5 text-[#0B4A99]" />
            <h2 className="text-base font-bold uppercase tracking-wider text-[#1A1A1A]">
              Choose Your Voice Guide Language
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {LANGUAGES.map((lang) => {
              const isSelected = state.selectedLanguage === lang.code;
              const isPlaying = playingCode === lang.code;
              return (
                <div
                  key={lang.code}
                  onClick={() => selectLanguage(lang.code)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-between text-center min-h-[140px] relative ${
                    isSelected
                      ? 'bg-[#E8F0FE] border-[#0B4A99] shadow-md shadow-blue-900/5 ring-2 ring-[#0B4A99]/20'
                      : 'bg-white border-[#E5E2D9] hover:border-[#0B4A99] hover:bg-[#FAF9F6]'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-2.5 right-2.5 text-green-600">
                      <CheckCircle2 className="w-4 h-4 fill-green-100" />
                    </span>
                  )}
                  
                  <div className="mt-1">
                    <p className="text-2xl font-bold text-[#1A1A1A]">{lang.native}</p>
                    <p className="text-xs font-bold text-[#7A756D] mt-1">{lang.label}</p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handlePreviewVoice(e, lang.code, lang.sample)}
                    className={`mt-4 w-full py-1.5 px-2 rounded-xl text-[11px] font-bold inline-flex items-center justify-center gap-1.5 transition-colors ${
                      isPlaying
                        ? 'bg-[#0B4A99] text-white animate-pulse'
                        : isSelected
                        ? 'bg-white border border-[#0B4A99] text-[#0B4A99]'
                        : 'bg-[#FAF9F6] border border-[#E5E2D9] text-[#5D5852] hover:text-[#0B4A99]'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{isPlaying ? 'Speaking...' : 'Preview Voice'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <button
            onClick={handleStartJourney}
            className="w-full py-4 px-8 bg-[#0B4A99] hover:bg-[#093e80] text-white rounded-2xl font-bold text-lg transition-colors shadow-lg shadow-blue-900/15 flex items-center justify-center gap-3 cursor-pointer"
          >
            <span>Start My Journey</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-xs text-[#7A756D] mt-3 font-medium">
            You can change your voice assistant language at any time during the onboarding.
          </p>
        </div>
      </div>
    </div>
  );
};
