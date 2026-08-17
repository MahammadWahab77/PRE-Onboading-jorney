import React from 'react';
import { ArrowRight, CheckCircle2, Calendar, RotateCcw, Percent, Users, FileText, HelpCircle, Sparkles } from 'lucide-react';
import { useOnboarding } from '../context/OnboardingContext';
import { VoiceGuide } from '../components/VoiceGuide';
import { JourneyProgress } from '../components/JourneyProgress';

export const NoCostEmiPage: React.FC = () => {
  const { state, navigate } = useOnboarding();

  const voiceMsg = "You selected No Cost EMI. To continue, you may need a co-applicant and a few documents like Aadhaar, PAN, and income or bank proof. If you have any questions, you can book a slot with our team for guidance.";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-[#2D3A3A] select-none">
      <JourneyProgress />
      <VoiceGuide text={voiceMsg} language={state.selectedLanguage} />

      <div className="bg-white border-2 border-[#E5E2D9] rounded-[2rem] p-6 sm:p-10 shadow-sm text-center mb-8">
        <div className="w-20 h-20 bg-[#FFF8EB] text-[#E8AF30] rounded-3xl flex items-center justify-center mx-auto mb-6 border border-[#E8AF30]/30 shadow-xs">
          <Percent className="w-10 h-10" />
        </div>

        <span className="inline-block px-4 py-1.5 bg-[#FFF8EB] text-[#E8AF30] rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-[#E8AF30]/40">
          No Cost EMI Selected
        </span>

        <h1 className="text-3xl sm:text-5xl font-bold text-[#1A1A1A] mb-3 tracking-tight">
          You Selected No Cost EMI
        </h1>

        <p className="text-[#5D5852] text-base sm:text-lg max-w-2xl mx-auto font-serif italic mb-10 leading-relaxed">
          "Complete your 0% EMI setup with our partnered NBFC financing process. Review the simple 3-step checklist below."
        </p>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 text-left">
          {/* Card 1: 0% EMI Setup */}
          <div className="bg-[#FAF9F6] border-2 border-[#E5E2D9] rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-[#E8F0FE] text-[#0B4A99]">
                  <Percent className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1A1A1A]">1. 0% EMI Setup</h3>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-[#5D5852]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span>No-cost EMI option (0% interest)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span>Partnered NBFC digital lending process</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span>Easy monthly repayment plan</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 2: Co-applicant */}
          <div className="bg-[#FAF9F6] border-2 border-[#E5E2D9] rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-[#FFF8EB] text-[#E8AF30]">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1A1A1A]">2. Co-applicant Required</h3>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-[#5D5852]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span>Parent, guardian, or earning family member</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span>Valid mobile number & relationship</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span>Basic monthly income details</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 3: Documents */}
          <div className="bg-[#FAF9F6] border-2 border-[#E5E2D9] rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-purple-100 text-purple-700">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1A1A1A]">3. Documents Needed</h3>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-[#5D5852]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span>Student Aadhaar & PAN card</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span>Co-applicant Aadhaar & PAN card</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span>Bank statement / basic income proof</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 4: Need Help */}
          <div className="bg-gradient-to-br from-[#E8F0FE] to-[#FAF9F6] border-2 border-[#0B4A99]/30 rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-[#0B4A99] text-white">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#0B4A99]">Need Guidance?</h3>
              </div>
              <p className="text-xs sm:text-sm text-[#5D5852] mb-4 leading-relaxed">
                Confused about EMI or not sure which documents to upload? Book a 1-to-1 assistance slot with our team.
              </p>
            </div>
            <button
              onClick={() => navigate('/onboarding/slot-booking?source=no-cost-emi-help')}
              className="w-full py-2.5 px-4 bg-white border-2 border-[#0B4A99] hover:bg-[#0B4A99] hover:text-white text-[#0B4A99] rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Book Slot for Assistance</span>
            </button>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="max-w-md mx-auto space-y-4">
          <button
            onClick={() => navigate('/onboarding/co-applicant')}
            className="w-full py-4 bg-[#0B4A99] hover:bg-[#093e80] text-white rounded-2xl font-bold text-lg transition-colors shadow-lg shadow-blue-900/15 flex items-center justify-center gap-3 cursor-pointer"
          >
            <span>Continue to Co-applicant Details</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => navigate('/onboarding/slot-booking?source=no-cost-emi-help')}
            className="w-full py-3.5 bg-white border-2 border-[#0B4A99] text-[#0B4A99] hover:bg-blue-50 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Not Sure? Book Slot for Assistance</span>
          </button>

          <button
            onClick={() => navigate('/onboarding/payment-options')}
            className="w-full py-2 text-xs font-bold text-[#7A756D] hover:text-[#0B4A99] transition-colors inline-flex items-center justify-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Change Payment Option</span>
          </button>
        </div>
      </div>
    </div>
  );
};
