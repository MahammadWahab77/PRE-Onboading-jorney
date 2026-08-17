import React from 'react';
import { ArrowRight, ShieldCheck, CheckCircle2, Sparkles, Languages, CreditCard, Percent, Banknote } from 'lucide-react';
import { useOnboarding } from '../context/OnboardingContext';
import { VoiceGuide } from '../components/VoiceGuide';
import { JourneyProgress } from '../components/JourneyProgress';

export const PaymentOptionsPage: React.FC = () => {
  const { state, selectPaymentOption, navigate } = useOnboarding();

  const studentName = state.name ? state.name.split(' ')[0] : 'Student';
  const voiceText = "Please choose your payment option. Select Full Payment if you want to complete your payment directly. Select No Cost EMI if you want to continue with zero percent EMI through our partnered NBFC process.";

  const handleSelect = (option: 'FULL_PAYMENT' | 'NO_COST_EMI') => {
    selectPaymentOption(option);
    if (option === 'FULL_PAYMENT') {
      navigate('/onboarding/full-payment');
    } else {
      navigate('/onboarding/no-cost-emi');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-[#2D3A3A] select-none">
      <JourneyProgress />
      <VoiceGuide text={voiceText} language={state.selectedLanguage} />

      <div className="mb-8 text-center">
        <span className="inline-block px-4 py-1.5 bg-[#E8F0FE] text-[#0B4A99] rounded-full text-xs font-bold uppercase tracking-widest mb-3">
          Step 2: Payment Plan
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-3 tracking-tight">
          Choose your payment path, {studentName}.
        </h1>
        <p className="text-[#5D5852] text-base sm:text-lg max-w-2xl mx-auto italic font-serif leading-relaxed">
          "Select a payment method that suits your financial goals. I will guide you through each step of the process."
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Card 1: Full Payment */}
        <div
          onClick={() => handleSelect('FULL_PAYMENT')}
          className="group bg-white border-2 border-[#E5E2D9] hover:border-[#0B4A99] rounded-[2rem] p-6 sm:p-8 transition-all cursor-pointer shadow-xs hover:shadow-xl flex flex-col justify-between relative overflow-hidden"
        >
          <div>
            <div className="w-16 h-16 bg-[#E8F0FE] rounded-2xl flex items-center justify-center mb-6 text-[#0B4A99] border border-[#0B4A99]/20 group-hover:scale-105 transition-transform">
              <Banknote className="w-8 h-8" />
            </div>

            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-[#1A1A1A]">Full Payment</h2>
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                Fastest Path
              </span>
            </div>

            <p className="text-[#5D5852] text-sm sm:text-base leading-relaxed mb-6">
              Pay the remaining balance directly and secure your batch allocation instantly. Simplest and fastest way to confirm your enrollment.
            </p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2.5 text-sm font-bold text-[#2D3A3A]">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <span>Instant Onboarding Confirmation</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm font-bold text-[#2D3A3A]">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <span>Direct Batch & Mentor Allocation</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm font-bold text-[#2D3A3A]">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <span>No documentation or NBFC checks</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            className="w-full py-4 bg-[#0B4A99] text-white rounded-2xl font-bold text-base sm:text-lg group-hover:bg-[#093e80] transition-colors shadow-lg shadow-blue-900/10 flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            <span>Select Full Payment</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Card 2: No Cost EMI */}
        <div
          onClick={() => handleSelect('NO_COST_EMI')}
          className="group bg-white border-2 border-[#E5E2D9] hover:border-[#0B4A99] rounded-[2rem] p-6 sm:p-8 transition-all cursor-pointer shadow-xs hover:shadow-xl flex flex-col justify-between relative overflow-hidden"
        >
          <div>
            <div className="w-16 h-16 bg-[#FFF8EB] rounded-2xl flex items-center justify-center mb-6 text-[#E8AF30] border border-[#E8AF30]/30 group-hover:scale-105 transition-transform">
              <Percent className="w-8 h-8" />
            </div>

            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-[#1A1A1A]">No Cost EMI</h2>
              <span className="px-3 py-1 rounded-full bg-[#FFF8EB] text-[#E8AF30] text-xs font-bold border border-[#E8AF30]/40">
                0% Interest
              </span>
            </div>

            <p className="text-[#5D5852] text-sm sm:text-base leading-relaxed mb-6">
              Pay in easy monthly installments with 0% interest through our partnered NBFC process. Budget-friendly setup for your family.
            </p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2.5 text-sm font-bold text-[#2D3A3A]">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <span>0% Extra Interest Rate</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm font-bold text-[#2D3A3A]">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <span>Low Monthly Installment Plan</span>
              </li>
              <li className="flex items-center gap-2.5 text-xs text-[#7A756D] font-medium bg-[#FAF9F6] p-2.5 rounded-xl border border-[#E5E2D9]">
                <span>Note: Co-applicant details and standard Aadhaar/PAN documents required</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            className="w-full py-4 bg-white border-2 border-[#0B4A99] text-[#0B4A99] rounded-2xl font-bold text-base sm:text-lg group-hover:bg-[#E8F0FE] transition-colors flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            <span>Select No Cost EMI</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={() => navigate('/onboarding/congratulations')}
          className="text-xs font-bold text-[#7A756D] hover:text-[#0B4A99] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
        >
          <span>← Back to Language Selection</span>
        </button>
      </div>
    </div>
  );
};
