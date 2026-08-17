import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, ArrowRight, Sparkles, MessageSquare, PhoneCall, ShieldCheck, AlertCircle } from 'lucide-react';
import { useOnboarding } from '../context/OnboardingContext';
import { VoiceGuide } from '../components/VoiceGuide';
import { JourneyProgress } from '../components/JourneyProgress';

const TIME_SLOTS = [
  '10:00 AM - 11:00 AM',
  '11:30 AM - 12:30 PM',
  '02:00 PM - 03:00 PM',
  '03:30 PM - 04:30 PM',
  '05:00 PM - 06:00 PM'
];

export const SlotBookingPage: React.FC = () => {
  const { state, bookSlot, navigate } = useOnboarding();
  
  // Generate next 5 days
  const availableDates = React.useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 6; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      if (d.getDay() !== 0) { // Skip Sundays
        dates.push(d.toISOString().split('T')[0]);
      }
    }
    return dates.slice(0, 5);
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(availableDates[0] || '');
  const [selectedTime, setSelectedTime] = useState<string>(TIME_SLOTS[0]);
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const urlParams = new URLSearchParams(window.location.search);
  const source = urlParams.get('source') || 'general_help';

  const voiceMsg = booked
    ? "Your assistance slot has been booked successfully. Our mentor will connect with you on WhatsApp at your scheduled time."
    : "Please choose a convenient date and time slot. Our dedicated onboarding manager will call you or connect on WhatsApp to guide you step by step.";

  const handleBook = async () => {
    if (!selectedDate || !selectedTime) return;
    setLoading(true);
    setErrorMsg('');

    const res = await bookSlot(selectedDate, selectedTime, source);
    setLoading(false);

    if (res.success) {
      setBooked(true);
    } else {
      setErrorMsg(res.message || 'Could not book slot. Please try another time.');
    }
  };

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (booked) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-[#2D3A3A] select-none text-center">
        <VoiceGuide text={voiceMsg} language={state.selectedLanguage} />

        <div className="bg-white border-2 border-green-300 rounded-[2.5rem] p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <span className="px-4 py-1.5 rounded-full bg-green-100 text-green-800 font-bold text-xs uppercase tracking-widest inline-block mb-3">
            Slot Confirmed in Salesforce CRM
          </span>

          <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-4 tracking-tight">
            Assistance Slot Booked!
          </h1>

          <p className="text-[#5D5852] text-base sm:text-lg max-w-lg mx-auto mb-8 leading-relaxed">
            Your dedicated NxtWave Senior Admissions Counselor has been assigned. They will reach out to <strong>{state.phone ? `+91 ${state.phone}` : 'your number'}</strong> via phone & WhatsApp.
          </p>

          <div className="bg-[#FAF9F6] border border-[#E5E2D9] rounded-3xl p-6 max-w-md mx-auto mb-8 text-left space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E2D9]">
              <span className="text-xs font-bold text-[#7A756D] uppercase">Scheduled Date</span>
              <span className="text-sm font-bold text-[#1A1A1A] font-mono">{formatDateLabel(selectedDate)}</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E2D9]">
              <span className="text-xs font-bold text-[#7A756D] uppercase">Time Window</span>
              <span className="text-sm font-bold text-[#0B4A99] font-mono">{selectedTime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#7A756D] uppercase">Assistance Mode</span>
              <span className="text-xs font-bold text-green-700 inline-flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp & Phone
              </span>
            </div>
          </div>

          <div className="space-y-4 max-w-md mx-auto">
            <a
              href={`https://wa.me/917330918872?text=Hi%20NxtWave%20team,%20I%20have%20booked%20my%20slot%20for%20${selectedDate}%20at%20${selectedTime}.%20Please%20help%20me%20complete%20my%20onboarding.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-2xl font-bold text-base transition-colors shadow-md inline-flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-5 h-5 fill-white text-[#25D366]" />
              <span>Connect on WhatsApp Now</span>
            </a>

            <button
              onClick={() => navigate('/onboarding/kyc')}
              className="w-full py-4 bg-[#0B4A99] hover:bg-[#093e80] text-white rounded-2xl font-bold text-base transition-colors shadow-lg shadow-blue-900/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to KYC & Journey Hub</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-[#2D3A3A] select-none">
      <JourneyProgress />
      <VoiceGuide text={voiceMsg} language={state.selectedLanguage} />

      <div className="bg-white border-2 border-[#E5E2D9] rounded-[2rem] p-6 sm:p-10 shadow-sm mb-8">
        <div className="flex items-center gap-3 pb-6 border-b border-[#E5E2D9] mb-8">
          <div className="w-14 h-14 bg-[#E8F0FE] text-[#0B4A99] rounded-2xl flex items-center justify-center border border-[#0B4A99]/20 shrink-0">
            <PhoneCall className="w-7 h-7" />
          </div>
          <div className="text-left">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FFF8EB] text-[#E8AF30] font-bold text-[10px] uppercase tracking-wider border border-[#E8AF30]/30">
              1-to-1 Counselor Support
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight">
              Book Your Assistance Slot
            </h1>
            <p className="text-xs text-[#7A756D] font-medium mt-0.5">
              Syncs with Admissions Calendar. Zero waiting time.
            </p>
          </div>
        </div>

        <div className="space-y-8 text-left">
          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#7A756D] mb-3 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#0B4A99]" />
              <span>Select Date (Next 5 Days)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {availableDates.map((dateStr) => {
                const isSelected = selectedDate === dateStr;
                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => setSelectedDate(dateStr)}
                    className={`py-3.5 px-3 rounded-2xl border-2 font-bold text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0B4A99] border-[#0B4A99] text-white shadow-md shadow-blue-900/15'
                        : 'bg-[#FAF9F6] border-[#E5E2D9] text-[#2D3A3A] hover:border-[#0B4A99]'
                    }`}
                  >
                    <div className="text-xs opacity-80 uppercase font-mono">{formatDateLabel(dateStr).split(' ')[0]}</div>
                    <div className="text-base mt-0.5">{formatDateLabel(dateStr).split(' ').slice(1).join(' ')}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#7A756D] mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#E8AF30]" />
              <span>Select Time Window (IST)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TIME_SLOTS.map((slot) => {
                const isSelected = selectedTime === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    className={`py-4 px-4 rounded-2xl border-2 font-mono font-bold text-sm text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-[#FFF8EB] border-[#E8AF30] text-[#1A1A1A] shadow-sm ring-2 ring-[#E8AF30]/20'
                        : 'bg-white border-[#E5E2D9] text-[#5D5852] hover:border-[#E8AF30]'
                    }`}
                  >
                    <Clock className={`w-4 h-4 ${isSelected ? 'text-[#E8AF30]' : 'text-[#7A756D]'}`} />
                    <span>{slot}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-4 border-t border-[#E5E2D9]">
            <button
              onClick={handleBook}
              disabled={loading || !selectedDate || !selectedTime}
              className="w-full py-4 bg-[#0B4A99] hover:bg-[#093e80] text-white rounded-2xl font-bold text-lg transition-colors shadow-lg shadow-blue-900/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Booking Slot in Salesforce Calendar...
                </span>
              ) : (
                <>
                  <span>Confirm Assistance Slot</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <p className="text-center text-xs text-[#7A756D] mt-3 flex items-center justify-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#0B4A99]" />
              <span>Free 1-to-1 Guidance. No obligation.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
