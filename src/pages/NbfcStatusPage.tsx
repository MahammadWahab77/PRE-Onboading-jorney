import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Clock, FileSearch, RefreshCw, MessageCircle, ArrowRight, Lock, XCircle } from 'lucide-react';
import { useOnboarding } from '../context/OnboardingContext';
import { VoiceGuide } from '../components/VoiceGuide';
import { JourneyProgress } from '../components/JourneyProgress';
import { SUPPORT_WHATSAPP_URL } from '../constants';
import { NbfcApiResponse, NbfcRecord } from '../types/nbfc';

// Extends the standard record with ui properties
interface EnhancedRecord extends NbfcRecord {
  frontTitle: string;
  frontDesc: string;
  frontColor: 'blue' | 'green' | 'red' | 'amber' | 'grey';
  frontStep: number;
  isFailed: boolean;
  nextActionHeading: string;
  nextActionText: string;
  ctaAction: string;
}

export const NbfcStatusPage: React.FC = () => {
  const { state, markNbfcStatusViewed } = useOnboarding();
  const [data, setData] = useState<NbfcApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/nbfc-status?salesforceId=${encodeURIComponent(state.salesforceId)}`);
      const result: NbfcApiResponse = await res.json();

      if (!res.ok || (!result.success && !result.nbfcRecords?.length)) {
        setError(result.message || 'We could not find your application.');
      } else {
        markNbfcStatusViewed();
      }

      setData(result);
      if (result.nbfcRecords && result.nbfcRecords.length > 0) {
        const sorted = [...result.nbfcRecords].sort((a, b) => getPriority(a.statusType) - getPriority(b.statusType));
        setActiveTabId(sorted[0].id);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [state.salesforceId, markNbfcStatusViewed]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const voiceMsg = "Here is the latest status of your education finance application. We will let you know as soon as there is an update from the finance partner.";

  const rawRecords = data?.nbfcRecords || [];
  const records = rawRecords.map(enhanceRecord);
  const activeRecord = records.find((r) => r.id === activeTabId) || records[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-[#2D3A3A] select-none">
      <JourneyProgress />
      <VoiceGuide text={voiceMsg} language={state.selectedLanguage} />

      <div className="mb-8 text-center">
        <span className="inline-block px-4 py-1.5 bg-[#E8F0FE] text-[#0B4A99] rounded-full text-xs font-bold uppercase tracking-widest mb-3">
          Final Step: Finance Status
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-3 tracking-tight">
          NBFC Application Status
        </h1>
        <p className="text-[#5D5852] text-base sm:text-lg max-w-2xl mx-auto italic font-serif leading-relaxed">
          "Track your financing application, required actions, and next steps."
        </p>
      </div>

      {loading ? (
        <StatusSkeleton />
      ) : error ? (
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border-2 border-red-200 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 shadow-sm">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Notice</h3>
          <p className="text-[#5D5852] mb-8 leading-relaxed max-w-sm mx-auto">{error}</p>
          <button
            onClick={loadData}
            className="bg-[#0B4A99] hover:bg-[#093e80] text-white px-6 py-3 w-full rounded-2xl font-bold shadow-lg shadow-blue-900/15 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw size={16} />
            <span>Retry</span>
          </button>
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border-2 border-[#E5E2D9] text-center max-w-lg mx-auto">
          <div className="w-16 h-16 bg-[#FAF9F6] rounded-full flex items-center justify-center mx-auto mb-4 text-[#7A756D]">
            <FileSearch size={32} />
          </div>
          <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">No NBFC Records Yet</h3>
          <p className="text-[#5D5852] mb-8 leading-relaxed">
            Your academy record was found, but NBFC status is not available yet. Please check again later.
          </p>
          <button
            onClick={loadData}
            className="bg-white border-2 border-[#E5E2D9] hover:border-[#0B4A99] w-full px-6 py-3 rounded-2xl font-bold text-[#2D3A3A] shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw size={16} />
            <span>Refresh Status</span>
          </button>
        </div>
      ) : activeRecord ? (
        <>
          {/* Multiple Applications Tabs */}
          {records.length > 1 && (
            <div className="mb-6 overflow-x-auto pb-2">
              <div className="flex gap-3 min-w-max">
                {records.map((record) => (
                  <button
                    key={record.id}
                    onClick={() => setActiveTabId(record.id)}
                    className={`px-5 py-3 rounded-2xl border-2 text-left transition-colors flex flex-col gap-1 min-w-[200px] cursor-pointer ${
                      activeTabId === record.id
                        ? 'bg-white border-[#0B4A99] shadow-sm ring-1 ring-[#0B4A99]/10'
                        : 'bg-white/60 border-[#E5E2D9] hover:bg-white text-[#7A756D]'
                    }`}
                  >
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${activeTabId === record.id ? 'text-[#0B4A99]' : 'text-[#7A756D]'}`}>
                      Partner
                    </span>
                    <span className={`font-bold ${activeTabId === record.id ? 'text-[#1A1A1A]' : 'text-[#5D5852]'}`}>
                      {record.name}
                    </span>
                    <div className="mt-2 flex items-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getColorClasses(record.frontColor).badge}`}>
                        {record.frontTitle}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Column */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
              {/* Status Hero Card */}
              <div className="bg-white rounded-[2rem] shadow-sm border-2 border-[#E5E2D9] p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 -z-0 rounded-full ${getColorClasses(activeRecord.frontColor).bgGlow}`} />

                <div className={`shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm relative z-10 ${getColorClasses(activeRecord.frontColor).iconBg}`}>
                  <StatusIcon colorType={activeRecord.frontColor} />
                </div>

                <div className="flex-1 relative z-10">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#7A756D] mb-1">Current Status</p>
                  <h2 className={`text-2xl md:text-3xl font-black mb-2 ${getColorClasses(activeRecord.frontColor).textHead}`}>
                    {activeRecord.frontTitle}
                  </h2>
                  <p className="text-[#5D5852] text-sm md:text-base leading-relaxed">{activeRecord.frontDesc}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FAF9F6] text-[#5D5852] text-xs font-semibold">
                      <Clock size={12} /> Last Updated: Just now
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Action Card */}
              <div className="bg-white rounded-[2rem] shadow-sm border-2 border-[#E5E2D9] p-6 md:p-8">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-[#1A1A1A]">{activeRecord.nextActionHeading}</h3>
                  {activeRecord.owner && (
                    <span className="px-2.5 py-1 bg-[#FAF9F6] text-[#5D5852] text-[10px] font-bold rounded uppercase tracking-wider">
                      Owner: {activeRecord.owner}
                    </span>
                  )}
                </div>
                <p className="text-[#5D5852] mb-6 text-sm md:text-base leading-relaxed">{activeRecord.nextActionText}</p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={loadData}
                    className="px-6 py-3 bg-[#0B4A99] text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-900/15 hover:bg-[#093e80] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw size={16} />
                    <span>Refresh Status</span>
                  </button>
                  <a
                    href={SUPPORT_WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-white border-2 border-[#E5E2D9] text-[#2D3A3A] rounded-2xl font-bold text-sm shadow-sm hover:border-[#0B4A99] transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={16} /> Contact Support
                  </a>
                </div>
              </div>

              {/* Application Details Card */}
              <div className="bg-white rounded-[2rem] shadow-sm border-2 border-[#E5E2D9] overflow-hidden">
                <div className="px-6 md:px-8 py-5 border-b border-[#E5E2D9] bg-[#FAF9F6]">
                  <h3 className="font-bold text-[#1A1A1A]">Application Details</h3>
                </div>
                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  <DetailRow label="Applicant Name" value={data?.academyRecord?.nameMasked || '-'} />
                  <DetailRow label="Application ID" value={data?.academyRecord?.idMasked || '-'} />
                  <DetailRow label="Financing Partner" value={activeRecord.name} />
                  <DetailRow label="Financing Status" value={activeRecord.frontTitle} badgeColor={activeRecord.frontColor} />
                  <DetailRow label="Submitted On" value="Recently" />
                  <DetailRow label="Support Ticket Status" value="No active tickets" />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
              {/* Progress Timeline */}
              <div className="bg-white rounded-[2rem] shadow-sm border-2 border-[#E5E2D9] p-6 md:p-8">
                <h3 className="font-bold text-[#1A1A1A] mb-6">Progress Timeline</h3>
                <div className="relative isolate">
                  <div className="absolute left-3.5 top-3 bottom-0 w-[2px] bg-[#FAF9F6] -z-10" />

                  <TimelineStep num={1} label="Application Started" record={activeRecord} />
                  <TimelineStep num={2} label="Details Submitted" record={activeRecord} />
                  <TimelineStep num={3} label="NBFC Review" record={activeRecord} />
                  <TimelineStep num={4} label="EMI Setup" record={activeRecord} />
                  <TimelineStep num={5} label="Disbursement" record={activeRecord} isLast />
                </div>
              </div>

              {/* Help Card */}
              <div className="bg-[#E8F0FE] rounded-[2rem] border-2 border-[#0B4A99]/20 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white text-[#0B4A99] flex items-center justify-center shrink-0">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0B4A99] mb-1">Need help with this application?</h4>
                    <p className="text-sm text-[#2D3A3A]/80 mb-4 leading-relaxed">
                      If this status has not changed for more than 24-48 hours, contact our support team.
                    </p>
                    <a
                      href={SUPPORT_WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-[#0B4A99] underline underline-offset-4 flex items-center gap-1 hover:text-[#093e80] transition-colors w-fit"
                    >
                      Contact Support <ArrowRight size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}

      <div className="mt-8 text-center bg-[#FAF9F6] border border-[#E5E2D9] rounded-2xl p-4 text-xs text-[#7A756D] flex items-center justify-center gap-2 max-w-lg mx-auto">
        <Lock className="w-4 h-4 text-[#0B4A99]" />
        <span>This is the final step of your onboarding journey.</span>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// Component Helpers
// -------------------------------------------------------------

function DetailRow({ label, value, badgeColor }: { label: string; value: string; badgeColor?: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-[#7A756D] mb-1">{label}</p>
      {badgeColor ? (
        <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded ${getColorClasses(badgeColor as EnhancedRecord['frontColor']).badge}`}>
          {value}
        </span>
      ) : (
        <p className="text-sm font-semibold text-[#1A1A1A]">{value}</p>
      )}
    </div>
  );
}

function TimelineStep({ num, label, record, isLast }: { num: number; label: string; record: EnhancedRecord; isLast?: boolean }) {
  const isCompleted = num < record.frontStep && !(record.isFailed && num >= 3);
  const isCurrent = num === record.frontStep && !record.isFailed;
  const isFailed = record.isFailed && num === record.frontStep;

  let iconContent: React.ReactNode;
  let dotClass = '';
  let lineClass = isLast ? 'hidden' : 'absolute left-[13px] top-7 bottom-[-16px] w-[2px] transition-colors -z-10 bg-[#FAF9F6]';

  if (isFailed) {
    dotClass = 'bg-rose-50 border-rose-200 text-rose-500';
    iconContent = <XCircle size={14} strokeWidth={3} />;
  } else if (isCompleted) {
    dotClass = 'bg-emerald-500 border-emerald-500 text-white shadow-sm ring-4 ring-emerald-50';
    lineClass = isLast ? 'hidden' : 'absolute left-[13px] top-7 bottom-[-16px] w-[2px] transition-colors -z-10 bg-emerald-500';
    iconContent = <CheckCircle2 size={14} strokeWidth={3} />;
  } else if (isCurrent) {
    if (record.frontColor === 'grey' && num === 1) {
      dotClass = 'bg-slate-50 border-slate-300 text-slate-400';
      iconContent = <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />;
    } else {
      dotClass = `bg-white border text-white ring-4 shadow-sm ${record.frontColor === 'amber' ? 'border-amber-500 ring-amber-50' : 'border-blue-500 ring-blue-50'}`;
      iconContent = <div className={`w-2.5 h-2.5 rounded-full ${record.frontColor === 'amber' ? 'bg-amber-500' : 'bg-blue-500'}`} />;
    }
  } else {
    dotClass = 'bg-slate-50 border-slate-200 text-slate-400';
    iconContent = <Lock size={12} strokeWidth={2.5} />;
  }

  return (
    <div className={`relative flex gap-4 ${isLast ? '' : 'pb-8'}`}>
      <div className={lineClass} />
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${dotClass} z-10 bg-white`}>
        {iconContent}
      </div>
      <div className="pt-1">
        <p className={`text-sm font-bold ${isCompleted || isCurrent || isFailed ? 'text-[#1A1A1A]' : 'text-slate-400'}`}>
          {label}
        </p>
        {isCurrent && !isFailed && (
          <p className="text-xs text-[#7A756D] mt-1">
            {record.frontColor === 'grey' ? 'Not started yet' : record.frontColor === 'amber' ? 'Action required here' : 'In progress...'}
          </p>
        )}
        {isFailed && <p className="text-xs text-rose-500 font-semibold mt-1">Failed at this stage</p>}
      </div>
    </div>
  );
}

function StatusIcon({ colorType }: { colorType: string }) {
  switch (colorType) {
    case 'green':
      return <CheckCircle2 size={32} strokeWidth={2.5} className="text-emerald-500" />;
    case 'red':
      return <XCircle size={32} strokeWidth={2.5} className="text-rose-500" />;
    case 'amber':
      return <AlertCircle size={32} strokeWidth={2.5} className="text-amber-500" />;
    case 'blue':
    default:
      return <RefreshCw size={32} strokeWidth={2.5} className="text-blue-500" />;
  }
}

// -------------------------------------------------------------
// Mapping Helpers
// -------------------------------------------------------------

function enhanceRecord(record: NbfcRecord): EnhancedRecord {
  let title = record.displayStatus;
  let description = record.message;
  let color: EnhancedRecord['frontColor'] = 'blue';
  let step = record.progressStep;
  let isFailed = false;

  let nextHeading = 'No action needed from you right now';
  let nextText = 'Your application is under partner review. We will notify you when the partner sends an update.';
  let cta = 'Refresh Status';

  switch (record.statusCode) {
    case 'NOT_STARTED':
      title = 'Application Not Started';
      description = 'Your education finance application has not started yet.';
      color = 'grey';
      step = 1;
      nextHeading = 'Action required';
      nextText = 'Your education finance application has not started yet.';
      cta = 'Start Application';
      isFailed = false;
      break;
    case 'CONSENT_PENDING':
      title = 'Consent Required';
      description = 'Please provide consent to continue your finance application.';
      color = 'amber';
      step = 2;
      nextHeading = 'Action required';
      nextText = 'Please provide consent to continue your finance application.';
      cta = 'Give Consent';
      isFailed = false;
      break;
    case 'DOCUMENTS_PENDING':
      title = 'Documents Required';
      description = 'Upload the required documents to move your application forward.';
      color = 'amber';
      step = 2;
      nextHeading = 'Action required';
      nextText = 'Upload the required documents to move your application forward.';
      cta = 'Upload Documents';
      isFailed = false;
      break;
    case 'UNDER_FINANCE_REVIEW':
      title = 'Under Finance Review';
      description = 'Your application is being reviewed by the finance partner.';
      color = 'blue';
      step = 3;
      nextHeading = 'No action needed from you right now';
      nextText = 'Your application is being reviewed by the finance partner.';
      cta = 'View Details';
      isFailed = false;
      break;
    case 'APPROVED':
      title = 'Approved';
      description = 'Your application is approved. Complete EMI setup to proceed.';
      color = 'green';
      step = 4;
      nextHeading = 'Approval Received';
      nextText = 'Your application is approved. Complete EMI setup to proceed.';
      cta = 'Setup EMI';
      isFailed = false;
      break;
    case 'EMI_SETUP_IN_PROGRESS':
      title = 'EMI Setup in Progress';
      description = 'Your EMI setup is being processed. This usually takes some time.';
      color = 'blue';
      step = 4;
      nextHeading = 'Processing';
      nextText = 'Your EMI setup is being processed. This usually takes some time.';
      cta = 'Track EMI Setup';
      isFailed = false;
      break;
    case 'EMI_SETUP_COMPLETED':
      title = 'EMI Setup Completed';
      description = 'Your EMI setup is complete. Access activation is in progress.';
      color = 'green';
      step = 5;
      nextHeading = 'Processing';
      nextText = 'Your EMI setup is complete. Access activation is in progress.';
      cta = 'Continue';
      isFailed = false;
      break;
    case 'VERIFICATION_PAUSED':
      title = 'Verification Paused';
      description = 'Your application needs additional verification. Our team will contact you.';
      color = 'amber';
      step = 3;
      nextHeading = 'Hold';
      nextText = 'Your application needs additional verification. Our team will contact you.';
      cta = 'Contact Support';
      isFailed = false;
      break;
    case 'NOT_APPROVED':
      title = 'Not Approved';
      description = 'The finance partner could not approve this application. You can explore alternate payment options.';
      color = 'red';
      step = 3;
      isFailed = true;
      nextHeading = 'Action required';
      nextText = 'The finance partner could not approve this application. You can explore alternate payment options.';
      cta = 'Explore Options';
      break;
    case 'APPLICATION_CLOSED':
      title = 'Application Closed';
      description = 'This finance application has been closed.';
      color = 'red';
      step = 3;
      isFailed = true;
      nextHeading = 'Closed';
      nextText = 'This finance application has been closed.';
      cta = 'Restart / Contact Support';
      break;
    case 'PAYMENT_COMPLETED':
      title = 'Payment Completed';
      description = 'Your payment has been completed successfully. Program access is ready or being activated.';
      color = 'green';
      step = 6;
      isFailed = false;
      nextHeading = 'Disbursement Complete';
      nextText = 'Your payment has been completed successfully. Program access is ready or being activated.';
      cta = 'Go to Learning Portal';
      break;
    case 'STATUS_UPDATE_PENDING':
      title = 'Waiting for Partner Update';
      description = 'Your application has been submitted. We are waiting for the latest status from the financing partner.';
      color = 'blue';
      step = 3;
      nextHeading = 'No action needed from you right now';
      nextText = 'Your application is currently processing. We will notify you when the partner sends an update.';
      cta = 'Refresh Status';
      break;
  }

  return {
    ...record,
    frontTitle: title,
    frontDesc: description || 'Processing your application...',
    frontColor: color,
    frontStep: step,
    isFailed,
    nextActionHeading: nextHeading,
    nextActionText: nextText,
    ctaAction: cta
  };
}

function getColorClasses(color: EnhancedRecord['frontColor']) {
  switch (color) {
    case 'green':
      return {
        iconBg: 'bg-emerald-50 text-emerald-500 border border-emerald-100',
        textHead: 'text-emerald-900',
        badge: 'bg-emerald-100 text-emerald-700',
        bgGlow: 'bg-emerald-500'
      };
    case 'red':
      return {
        iconBg: 'bg-rose-50 text-rose-500 border border-rose-100',
        textHead: 'text-rose-900',
        badge: 'bg-rose-100 text-rose-700',
        bgGlow: 'bg-rose-500'
      };
    case 'amber':
      return {
        iconBg: 'bg-amber-50 text-amber-500 border border-amber-100',
        textHead: 'text-amber-900',
        badge: 'bg-amber-100 text-amber-700',
        bgGlow: 'bg-amber-500'
      };
    case 'grey':
      return {
        iconBg: 'bg-slate-50 text-slate-500 border border-slate-200',
        textHead: 'text-slate-900',
        badge: 'bg-slate-100 text-slate-700',
        bgGlow: 'bg-slate-500'
      };
    case 'blue':
    default:
      return {
        iconBg: 'bg-blue-50 text-blue-500 border border-blue-100',
        textHead: 'text-blue-900',
        badge: 'bg-blue-100 text-blue-700',
        bgGlow: 'bg-blue-500'
      };
  }
}

function getPriority(type: string): number {
  switch (type) {
    case 'failed':
      return 4;
    case 'success':
      return 1;
    case 'warning':
      return 2;
    case 'in_progress':
      return 3;
    default:
      return 5;
  }
}

function StatusSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white rounded-[2rem] h-48 border-2 border-[#E5E2D9]" />
        <div className="bg-white rounded-[2rem] h-64 border-2 border-[#E5E2D9]" />
        <div className="bg-white rounded-[2rem] h-64 border-2 border-[#E5E2D9]" />
      </div>
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white rounded-[2rem] h-96 border-2 border-[#E5E2D9]" />
      </div>
    </div>
  );
}
