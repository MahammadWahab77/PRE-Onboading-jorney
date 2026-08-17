import React, { useState } from 'react';
import { Phone, ArrowRight, ShieldCheck, AlertCircle, HelpCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useOnboarding } from '../context/OnboardingContext';
import { VoiceGuide } from '../components/VoiceGuide';

export const LoginPage: React.FC = () => {
  const { loginWithMobile } = useOnboarding();
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 10) {
      setMobile(val);
      if (errorMsg) setErrorMsg('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile.length !== 10) return;

    setLoading(true);
    setErrorMsg('');

    const res = await loginWithMobile(mobile);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.message || 'We could not find your registered number.');
    }
  };

  const isValid = mobile.length === 10;

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-8 bg-[#FAF9F6] text-[#2D3A3A] relative select-none">
      <VoiceGuide text="Welcome to NxtWave. Please enter your registered mobile number to continue." language="en-IN" />

      <div className="w-full max-w-lg bg-white border-2 border-[#E5E2D9] rounded-[2rem] p-8 sm:p-10 shadow-sm relative z-10 mt-2">
        <div className="w-16 h-16 bg-[#0B4A99] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md shadow-blue-900/15">
          <span className="text-white font-extrabold text-3xl tracking-tight">N</span>
        </div>

        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1.5 bg-[#E8F0FE] text-[#0B4A99] rounded-full text-xs font-bold uppercase tracking-widest mb-3">
            Academy Post-Registration
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-3 tracking-tight">
            Welcome to NxtWave Onboarding
          </h2>
          <p className="text-[#5D5852] text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Enter your registered mobile number to verify your downpayment record in Salesforce.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="mobileInput" className="block text-xs font-bold uppercase tracking-wider text-[#7A756D] mb-2">
              Registered Mobile Number
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 flex items-center gap-1.5 text-[#2D3A3A] pointer-events-none border-r border-[#E5E2D9] pr-3.5">
                <Phone className="w-4 h-4 text-[#0B4A99]" />
                <span className="text-base font-bold text-[#1A1A1A]">+91</span>
              </div>
              <input
                id="mobileInput"
                type="tel"
                value={mobile}
                onChange={handleMobileChange}
                placeholder="Enter 10-digit number"
                className="w-full bg-[#FAF9F6] border-2 border-[#E5E2D9] rounded-2xl py-4 pl-24 pr-12 text-xl font-bold text-[#1A1A1A] tracking-wider placeholder:text-[#7A756D]/60 placeholder:font-normal placeholder:text-sm focus:outline-none focus:border-[#0B4A99] transition-all"
                autoFocus
              />
              {isValid && (
                <CheckCircle2 className="w-6 h-6 text-green-600 absolute right-4 pointer-events-none" />
              )}
            </div>
            <p className="text-xs text-[#7A756D] mt-2 flex items-center justify-between font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0B4A99]" />
                Direct Salesforce CRM Lookup
              </span>
              <span className="font-mono">{mobile.length}/10</span>
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">{errorMsg}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!isValid || loading}
            className="w-full py-4 bg-[#0B4A99] hover:bg-[#093e80] text-white rounded-2xl font-bold text-lg transition-colors shadow-lg shadow-blue-900/10 flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying Salesforce Record...
              </span>
            ) : (
              <>
                <span>Proceed to Journey</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Demo Tip Box */}
        <div className="mt-8 pt-6 border-t border-[#E5E2D9] bg-[#FAF9F6] rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[#E8AF30] text-xs font-bold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>AI Studio Live Testing Tip</span>
          </div>
          <p className="text-xs text-[#5D5852] mb-2 font-medium">
            Click below to test with sample registered student records:
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => { setMobile('7330918872'); setErrorMsg(''); }}
              className="px-3.5 py-1.5 bg-white border border-[#E5E2D9] hover:border-[#0B4A99] rounded-xl text-xs font-mono font-bold text-[#0B4A99] shadow-2xs cursor-pointer transition-all"
            >
              7330918872 (Wahab)
            </button>
            <button
              type="button"
              onClick={() => { setMobile('9876543210'); setErrorMsg(''); }}
              className="px-3.5 py-1.5 bg-white border border-[#E5E2D9] hover:border-[#0B4A99] rounded-xl text-xs font-mono font-bold text-[#2D3A3A] shadow-2xs cursor-pointer transition-all"
            >
              9876543210 (Demo)
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a
            href="https://wa.me/917330918872"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#7A756D] hover:text-[#0B4A99] font-medium transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-[#E8AF30]" />
            <span>Not registered? Contact NxtWave Admissions Team</span>
          </a>
        </div>
      </div>
    </div>
  );
};
