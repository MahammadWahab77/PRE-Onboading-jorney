import React, { useEffect, useState, useRef } from 'react';
import { Volume2, VolumeX, RotateCcw, Waves, Sparkles } from 'lucide-react';
import { useOnboarding } from '../context/OnboardingContext';

interface VoiceGuideProps {
  text: string;
  language?: string;
  autoPlay?: boolean;
}

export const VoiceGuide: React.FC<VoiceGuideProps> = ({ text, language, autoPlay = true }) => {
  const { state, toggleMuteVoice } = useOnboarding();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const hasInteractedRef = useRef(false);

  const currentLang = language || state.selectedLanguage || 'en-IN';

  useEffect(() => {
    const markInteracted = () => {
      hasInteractedRef.current = true;
    };
    window.addEventListener('click', markInteracted, { once: true });
    window.addEventListener('touchstart', markInteracted, { once: true });
    window.addEventListener('keydown', markInteracted, { once: true });
    return () => {
      window.removeEventListener('click', markInteracted);
      window.removeEventListener('touchstart', markInteracted);
      window.removeEventListener('keydown', markInteracted);
    };
  }, []);

  const speak = () => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    if (state.mutedVoice) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLang;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const langPrefix = currentLang.slice(0, 2).toLowerCase();
    
    const matchingVoice = voices.find(
      (v) => v.lang.toLowerCase().includes(langPrefix) || (langPrefix === 'te' && v.name.toLowerCase().includes('telugu'))
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [text, currentLang]);

  useEffect(() => {
    if (autoPlay && hasInteractedRef.current && !state.mutedVoice) {
      const timer = setTimeout(speak, 350);
      return () => clearTimeout(timer);
    }
  }, [text, currentLang, autoPlay, state.mutedVoice]);

  if (!isSupported) return null;

  const langNames: Record<string, string> = {
    'en-IN': 'English Guide',
    'te-IN': 'తెలుగు మార్గదర్శి',
    'hi-IN': 'हिंदी मार्गदर्शक',
    'ta-IN': 'தமிழ் வழிகாட்டி',
    'kn-IN': 'ಕನ್ನಡ మార్గదర్శి',
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-6 bg-white border-2 border-[#E5E2D9] rounded-[1.5rem] p-4 sm:p-5 shadow-xs text-[#2D3A3A] transition-all select-none">
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className={`relative flex items-center justify-center w-11 h-11 rounded-xl shrink-0 transition-colors ${isPlaying ? 'bg-[#0B4A99] text-white shadow-md shadow-blue-900/20' : 'bg-[#FFF8EB] text-[#E8AF30] border border-[#E5E2D9]'}`}>
            <Waves className={`w-5 h-5 ${isPlaying ? 'animate-bounce' : ''}`} />
            {isPlaying && <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-ping" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B4A99]">
                {langNames[currentLang] || 'Voice Guide'}
              </span>
              {isPlaying && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                  Speaking
                </span>
              )}
            </div>
            <p className="text-sm font-serif italic text-[#5D5852] mt-0.5 leading-snug">
              "{text}"
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={speak}
            disabled={state.mutedVoice}
            title="Replay voice explanation"
            className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#E5E2D9] hover:border-[#0B4A99] hover:bg-blue-50 text-[#5D5852] hover:text-[#0B4A99] transition-all disabled:opacity-40 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={toggleMuteVoice}
            title={state.mutedVoice ? 'Unmute voice' : 'Mute voice'}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${state.mutedVoice ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-[#FAF9F6] border-[#E5E2D9] hover:border-[#2D3A3A] text-[#5D5852]'}`}
          >
            {state.mutedVoice ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#0B4A99]" />}
          </button>
        </div>
      </div>
    </div>
  );
};
