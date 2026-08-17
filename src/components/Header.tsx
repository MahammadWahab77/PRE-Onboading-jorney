import React from 'react';
import { HelpCircle, LogOut, ShieldCheck } from 'lucide-react';
import { useOnboarding } from '../context/OnboardingContext';

export const Header: React.FC = () => {
  const { state, resetJourney } = useOnboarding();

  return (
    <header className="h-20 bg-white/90 backdrop-blur-md border-b border-[#E5E2D9] px-4 sm:px-12 flex items-center justify-between sticky top-0 z-40 select-none shadow-xs">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#0B4A99] rounded-xl flex items-center justify-center shadow-sm shrink-0">
          <span className="text-white font-extrabold text-lg sm:text-xl tracking-tight">N</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#1A1A1A]">NxtWave Onboarding</h1>
            <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-[#E8F0FE] text-[#0B4A99] text-[10px] font-bold tracking-wider uppercase">
              Verified Student
            </span>
          </div>
          <p className="text-xs text-[#7A756D] font-medium flex items-center gap-1.5">
            <span>Student ID: {state.salesforceId ? `NXW-${state.mobile.slice(6)}` : 'PRE-REG'}</span>
            {state.name && <span className="hidden sm:inline">| {state.name}</span>}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {state.salesforceId && (
          <div className="hidden lg:block text-right">
            <p className="text-[11px] text-[#7A756D] uppercase tracking-wider font-bold mb-1">Current Progress</p>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-[#0B4A99]">
                Step {state.currentLevel} of 6
              </span>
              <span className="text-xs text-[#7A756D] font-mono">({Math.round((state.currentLevel / 6) * 100)}%)</span>
            </div>
            <div className="w-32 bg-[#E5E2D9] h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-[#0B4A99] h-full transition-all duration-500 rounded-full"
                style={{ width: `${(state.currentLevel / 6) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2.5">
          <a
            href="https://wa.me/917330918872?text=Hi%20NxtWave%20Team,%20I%20need%20help%20with%20my%20onboarding"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF9F6] border border-[#E5E2D9] hover:border-[#0B4A99] text-[#2D3A3A] hover:text-[#0B4A99] text-xs font-bold transition-all shadow-2xs"
          >
            <HelpCircle className="w-4 h-4 text-[#E8AF30]" />
            <span className="hidden sm:inline">Need Assistance?</span>
            <span className="sm:hidden">Help</span>
          </a>

          {state.salesforceId && (
            <button
              onClick={resetJourney}
              title="End Session / Switch Number"
              className="p-2 rounded-xl bg-[#FAF9F6] border border-[#E5E2D9] hover:bg-red-50 hover:border-red-200 text-[#7A756D] hover:text-red-600 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
