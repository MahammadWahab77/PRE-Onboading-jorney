import React from 'react';
import { Video, CheckCircle2, MessageSquare, PhoneCall, ShieldCheck, UserCheck, ArrowRight, PartyPopper } from 'lucide-react';
import { useOnboarding } from '../context/OnboardingContext';
import { VoiceGuide } from '../components/VoiceGuide';
import { JourneyProgress } from '../components/JourneyProgress';
import { SUPPORT_WHATSAPP_URL, SUPPORT_TEL_URL } from '../constants';

export const KycPage: React.FC = () => {
  const { state, completeKycStep, navigate } = useOnboarding();

  const studentName = state.name ? state.name.split(' ')[0] : 'Student';
  const isEmiPath = state.selectedPaymentOption === 'NO_COST_EMI';
  const isJourneyComplete = state.kycStatus === 'COMPLETED' && !isEmiPath;

  const voiceMsg = isJourneyComplete
    ? "Congratulations! Your onboarding journey is complete. Welcome to NxtWave."
    : "Your verification call is scheduled. Please keep your original documents ready for the video call verification.";

  const handleCompleteKyc = () => {
    completeKycStep();
    if (isEmiPath) {
      navigate('/onboarding/nbfc-status');
    }
  };

  if (isJourneyComplete) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-[#2D3A3A] select-none text-center">
        <VoiceGuide text={voiceMsg} language={state.selectedLanguage} />

        <div className="bg-white border-2 border-green-300 rounded-[2.5rem] p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <PartyPopper className="w-12 h-12" />
          </div>

          <span className="px-4 py-1.5 rounded-full bg-green-100 text-green-800 font-bold text-xs uppercase tracking-widest inline-block mb-3">
            Onboarding Complete
          </span>

          <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-4 tracking-tight">
            You're All Set, {studentName}!
          </h1>

          <p className="text-[#5D5852] text-base sm:text-lg max-w-lg mx-auto mb-8 leading-relaxed">
            Your KYC verification is complete. Welcome to NxtWave — our admissions team will reach out with your batch and portal access details shortly.
          </p>

          <div className="bg-[#FAF9F6] border border-[#E5E2D9] rounded-2xl p-4 max-w-md mx-auto text-xs text-[#7A756D] flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0B4A99]" />
            <span>Salesforce CRM Record ID: <strong className="font-mono text-[#1A1A1A]">{state.salesforceId || 'PRE-RECORD-001'}</strong></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-[#2D3A3A] select-none">
      <JourneyProgress />
      <VoiceGuide text={voiceMsg} language={state.selectedLanguage} />

      {/* Hero Header Card */}
      <div className="bg-gradient-to-br from-[#0B4A99] to-[#083670] text-white rounded-[2.5rem] p-8 sm:p-12 shadow-xl mb-8 relative overflow-hidden text-center">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/20 shadow-lg">
          <Video className="w-10 h-10 text-[#E8AF30]" />
        </div>

        <span className="px-4 py-1.5 rounded-full bg-[#E8AF30] text-[#1A1A1A] font-extrabold text-xs uppercase tracking-widest inline-block mb-4 shadow-sm">
          Final Verification Hub
        </span>

        <h1 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight">
          KYC Video Call Verification
        </h1>

        <p className="text-blue-100 text-base sm:text-lg max-w-xl mx-auto leading-relaxed font-serif italic">
          "Hello {studentName}, your onboarding file is under review in Salesforce. Our admissions team will conduct a quick 5-minute video call to verify your downpayment record."
        </p>
      </div>

      {/* Preparation Checklist */}
      <div className="bg-white border-2 border-[#E5E2D9] rounded-[2rem] p-6 sm:p-10 shadow-sm mb-8 text-left">
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E2D9] mb-6">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-[#0B4A99]" />
            <h2 className="text-xl font-bold text-[#1A1A1A]">Checklist for your Video Call</h2>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg">
            Mandatory
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#FAF9F6] p-5 rounded-2xl border border-[#E5E2D9]">
            <div className="w-10 h-10 rounded-xl bg-[#E8F0FE] text-[#0B4A99] flex items-center justify-center font-bold mb-3">
              1
            </div>
            <h3 className="text-sm font-bold text-[#1A1A1A] mb-1">Original Aadhaar Card</h3>
            <p className="text-xs text-[#7A756D] leading-relaxed">
              Keep your physical student Aadhaar card in hand to show on video camera.
            </p>
          </div>

          <div className="bg-[#FAF9F6] p-5 rounded-2xl border border-[#E5E2D9]">
            <div className="w-10 h-10 rounded-xl bg-[#FFF8EB] text-[#E8AF30] flex items-center justify-center font-bold mb-3">
              2
            </div>
            <h3 className="text-sm font-bold text-[#1A1A1A] mb-1">Quiet Lighting Space</h3>
            <p className="text-xs text-[#7A756D] leading-relaxed">
              Ensure you are in a well-lit room with minimal background noise.
            </p>
          </div>

          <div className="bg-[#FAF9F6] p-5 rounded-2xl border border-[#E5E2D9]">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-3">
              3
            </div>
            <h3 className="text-sm font-bold text-[#1A1A1A] mb-1">Co-Applicant Presence</h3>
            <p className="text-xs text-[#7A756D] leading-relaxed">
              If opted for No Cost EMI, parent or co-applicant must be nearby to confirm.
            </p>
          </div>
        </div>
      </div>

      {/* Support & Action Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        <a
          href={SUPPORT_WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="p-6 bg-white border-2 border-[#E5E2D9] hover:border-[#25D366] rounded-3xl transition-all shadow-2xs hover:shadow-md flex items-center justify-between group"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 bg-green-100 text-[#25D366] rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <MessageSquare className="w-6 h-6 fill-[#25D366] text-green-100" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1A1A1A]">WhatsApp Counselor</h3>
              <p className="text-xs text-[#7A756D]">Instant chat regarding call link</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-[#7A756D] group-hover:text-[#25D366] transition-colors" />
        </a>

        <a
          href={SUPPORT_TEL_URL}
          className="p-6 bg-white border-2 border-[#E5E2D9] hover:border-[#0B4A99] rounded-3xl transition-all shadow-2xs hover:shadow-md flex items-center justify-between group"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 bg-[#E8F0FE] text-[#0B4A99] rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1A1A1A]">Contact Support</h3>
              <p className="text-xs text-[#7A756D]">Need to reschedule? Call our team</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-[#7A756D] group-hover:text-[#0B4A99] transition-colors" />
        </a>
      </div>

      {/* Primary CTA */}
      <div className="max-w-md mx-auto mb-8">
        <button
          onClick={handleCompleteKyc}
          className="w-full py-4 bg-[#0B4A99] hover:bg-[#093e80] text-white rounded-2xl font-bold text-lg transition-colors shadow-lg shadow-blue-900/15 flex items-center justify-center gap-3 cursor-pointer"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>I've Completed My KYC Verification</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      <div className="text-center bg-[#FAF9F6] border border-[#E5E2D9] rounded-2xl p-4 text-xs text-[#7A756D] flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#0B4A99]" />
        <span>Salesforce CRM Downpayment ID: <strong className="font-mono text-[#1A1A1A]">{state.salesforceId || 'PRE-RECORD-001'}</strong></span>
      </div>
    </div>
  );
};
