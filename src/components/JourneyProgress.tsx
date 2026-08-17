import React from 'react';
import { CheckCircle2, Trophy, ArrowRight, ShieldCheck, Languages, CreditCard, Users, ClipboardCheck, UserCheck } from 'lucide-react';
import { useOnboarding } from '../context/OnboardingContext';

const LEVEL_DATA = [
  { level: 1, label: 'Identity Verified', icon: ShieldCheck, desc: 'Salesforce verification' },
  { level: 2, label: 'Language Selected', icon: Languages, desc: 'Voice assistant language' },
  { level: 3, label: 'Payment Choice', icon: CreditCard, desc: 'Selected payment path' },
  { level: 4, label: 'Co-Applicant Added', icon: Users, desc: 'Co-applicant details submitted' },
  { level: 5, label: 'Documents Verified', icon: ClipboardCheck, desc: 'All required docs uploaded' },
  { level: 6, label: 'KYC Completion', icon: UserCheck, desc: 'Final status checklist' },
];

export const JourneyProgress: React.FC = () => {
  const { state } = useOnboarding();
  const currentLvl = state.currentLevel || 1;
  const progressPercent = Math.min(100, Math.round((currentLvl / 6) * 100));

  const currentInfo = LEVEL_DATA.find((l) => l.level === currentLvl) || LEVEL_DATA[0];
  const nextInfo = LEVEL_DATA.find((l) => l.level === currentLvl + 1);

  return (
    <div className="w-full max-w-3xl mx-auto mb-8 bg-white border-2 border-[#E5E2D9] rounded-[2rem] p-6 sm:p-8 shadow-xs text-[#2D3A3A] select-none">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FFF8EB] text-[#E8AF30] flex items-center justify-center border border-[#E5E2D9]">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1A1A1A]">Onboarding Milestones</h3>
            <p className="text-xs text-[#7A756D] font-medium">Gamified journey progress tracker</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#E8F0FE] text-[#0B4A99] font-bold text-xs">
          Level {currentLvl} of 6
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-[#FAF9F6] border border-[#E5E2D9] rounded-full overflow-hidden mb-6 relative">
        <div
          className="h-full bg-[#0B4A99] transition-all duration-700 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        {LEVEL_DATA.map((item) => {
          const Icon = item.icon;
          const isDone = item.level < currentLvl;
          const isCurrent = item.level === currentLvl;
          return (
            <div
              key={item.level}
              className={`p-3 rounded-2xl border transition-all flex flex-col items-center text-center ${
                isCurrent
                  ? 'bg-[#E8F0FE] border-[#0B4A99] shadow-xs'
                  : isDone
                  ? 'bg-[#FAF9F6] border-[#E5E2D9] opacity-80'
                  : 'bg-white border-[#E5E2D9] opacity-50'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 font-bold text-xs ${
                  isDone
                    ? 'bg-green-600 text-white'
                    : isCurrent
                    ? 'bg-[#0B4A99] text-white shadow-md shadow-blue-900/20'
                    : 'bg-[#E5E2D9] text-[#7A756D]'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className={`text-xs font-bold truncate max-w-full ${isCurrent ? 'text-[#0B4A99]' : 'text-[#2D3A3A]'}`}>
                {item.label}
              </span>
              <span className="text-[10px] text-[#7A756D] mt-0.5 line-clamp-1">
                {item.desc}
              </span>
            </div>
          );
        })}
      </div>

      {/* Status banner */}
      <div className="bg-[#FAF9F6] border border-[#E5E2D9] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shrink-0" />
          <p className="text-xs sm:text-sm font-medium text-[#2D3A3A]">
            <span className="font-bold text-[#1A1A1A]">Current Focus:</span> {currentInfo.desc}
          </p>
        </div>
        {nextInfo && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B4A99] sm:justify-end shrink-0">
            <span>Up Next: {nextInfo.label}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
    </div>
  );
};
