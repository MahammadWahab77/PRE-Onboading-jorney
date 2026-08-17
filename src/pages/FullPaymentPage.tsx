import React from 'react';
import { ArrowRight, CheckCircle2, Calendar, RotateCcw, Banknote, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { useOnboarding } from '../context/OnboardingContext';
import { VoiceGuide } from '../components/VoiceGuide';
import { JourneyProgress } from '../components/JourneyProgress';

export const FullPaymentPage: React.FC = () => {
  const { state, navigate } = useOnboarding();

  const voiceMsg = "You selected Full Payment. Please book a convenient slot. Our team will connect with you and help you complete the remaining payment and onboarding steps.";

  const handleBookSlot = () => {
    navigate('/onboarding/slot-booking?source=full-payment');
  };

  const handleChangeOption = () => {
    navigate('/onboarding/payment-options');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-[#2D3A3A] select-none">
      <JourneyProgress />
      <VoiceGuide text={voiceMsg} language={state.selectedLanguage} />

      <div className="bg-white border-2 border-[#E5E2D9] rounded-[2rem] p-6 sm:p-12 shadow-sm text-center relative overflow-hidden">
        <div className="w-20 h-20 bg-[#E8F0FE] text-[#0B4A99] rounded-3xl flex items-center justify-center mx-auto mb-6 border border-[#0B4A99]/20 shadow-xs">
          <Banknote className="w-10 h-10" />
        </div>

        <span className="inline-block px-4 py-1.5 bg-green-100 text-green-800 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
          Full Payment Selected
        </span>

        <h1 className="text-3xl sm:text-5xl font-bold text-[#1A1A1A] mb-4 tracking-tight">
          You Selected Full Payment
        </h1>

        <p className="text-[#5D5852] text-base sm:text-lg max-w-2xl mx-auto font-serif italic mb-8 leading-relaxed">
          "Book a convenient slot with the NxtWave onboarding admissions team. They will connect with you on WhatsApp/phone to guide you through the remaining balance transfer and immediate batch confirmation."
        </p>

        {/* Summary Card */}
        <div className="max-w-xl mx-auto bg-[#FAF9F6] border-2 border-[#E5E2D9] rounded-3xl p-6 sm:p-8 mb-8 text-left">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E2D9] mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#7A756D]">Payment Path</p>
              <p className="text-xl font-bold text-[#1A1A1A] mt-0.5">Direct Balance Transfer</p>
            </div>
            <span className="px-3 py-1 bg-[#E8F0FE] text-[#0B4A99] rounded-xl text-xs font-bold">
              0% Financing Delay
            </span>
          </div>

          <h3 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A] mb-4">
            Key Benefits of this path:
          </h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-[#1A1A1A]">Faster Onboarding & Batch Access</p>
                <p className="text-xs text-[#7A756D]">Get your portal credentials and WhatsApp community invite on the same day.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-[#1A1A1A]">Direct Confirmation</p>
                <p className="text-xs text-[#7A756D]">No third-party lender approval or credit score verification required.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-[#1A1A1A]">Simple 1-to-1 Assistance</p>
                <p className="text-xs text-[#7A756D]">Dedicated onboarding manager helps you complete payment securely.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="max-w-md mx-auto space-y-4">
          <button
            onClick={handleBookSlot}
            className="w-full py-4 bg-[#0B4A99] hover:bg-[#093e80] text-white rounded-2xl font-bold text-lg transition-colors shadow-lg shadow-blue-900/15 flex items-center justify-center gap-3 cursor-pointer"
          >
            <Calendar className="w-5 h-5 text-[#E8AF30]" />
            <span>Book My Assistance Slot</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={handleChangeOption}
            className="w-full py-3.5 bg-[#FAF9F6] border-2 border-[#E5E2D9] hover:border-[#0B4A99] text-[#5D5852] hover:text-[#0B4A99] rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Change Payment Option</span>
          </button>
        </div>
      </div>
    </div>
  );
};
