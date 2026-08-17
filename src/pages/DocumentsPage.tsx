import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Lock, HelpCircle } from 'lucide-react';
import { useOnboarding } from '../context/OnboardingContext';
import { VoiceGuide } from '../components/VoiceGuide';
import { JourneyProgress } from '../components/JourneyProgress';
import { SUPPORT_WHATSAPP_URL } from '../constants';

interface DocDef {
  key: string;
  label: string;
  required: boolean;
  desc: string;
  sfField: string;
}

const DOCUMENT_LIST: DocDef[] = [
  { key: 'student_aadhaar_front', label: 'Student Aadhaar (Front)', required: true, desc: 'Clear front photo with student name and number', sfField: 'Front_Side_Document_URL_PRE__c' },
  { key: 'student_aadhaar_back', label: 'Student Aadhaar (Back)', required: true, desc: 'Back side showing full address', sfField: 'Back_Side_Document_URL_PRE__c' },
  { key: 'student_pan', label: 'Student PAN Card', required: false, desc: 'Optional if student does not have PAN yet', sfField: 'Proof_Document_URL_PRE__c' },
  { key: 'co_applicant_aadhaar_front', label: 'Co-Applicant Aadhaar (Front)', required: true, desc: 'Front photo of parent/guardian Aadhaar', sfField: 'Front_Side_Document_URL_PRE__c' },
  { key: 'co_applicant_aadhaar_back', label: 'Co-Applicant Aadhaar (Back)', required: true, desc: 'Back photo of parent/guardian Aadhaar', sfField: 'Back_Side_Document_URL_PRE__c' },
  { key: 'co_applicant_pan', label: 'Co-Applicant PAN Card', required: true, desc: 'Required for NBFC digital loan processing', sfField: 'Proof_Document_URL_PRE__c' },
  { key: 'bank_statement', label: 'Bank Statement (Last 3 Months)', required: true, desc: 'PDF showing salary or regular income deposits', sfField: 'Bank_Statement_Doc_URL_PRE__c' },
  { key: 'income_proof', label: 'Income Proof / Salary Slip', required: false, desc: 'Latest month salary slip or payslip', sfField: 'Salary_Payslip_Doc_URLs__c' },
];

export const DocumentsPage: React.FC = () => {
  const { state, addDocumentUrl, navigate } = useOnboarding();
  const [uploadingMap, setUploadingMap] = useState<Record<string, boolean>>({});
  const [errorMap, setErrorMap] = useState<Record<string, string>>({});

  const voiceMsg = "Please upload the required documents. You can upload Aadhaar, PAN, and income or bank documents. If you are not sure, you can contact our support team for help.";

  const handleFileUpload = async (docKey: string, label: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMap((prev) => ({ ...prev, [docKey]: 'File exceeds 10MB limit. Please choose a smaller file.' }));
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setErrorMap((prev) => ({ ...prev, [docKey]: 'Only JPG, PNG, or PDF formats are supported.' }));
      return;
    }

    setUploadingMap((prev) => ({ ...prev, [docKey]: true }));
    setErrorMap((prev) => ({ ...prev, [docKey]: '' }));

    try {
      // Read file as base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch('/api/onboarding/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salesforceId: state.salesforceId || 'demo_user',
          docKey,
          label,
          fileName: file.name,
          fileData: base64Data,
        }),
      });

      const data = await res.json();
      setUploadingMap((prev) => ({ ...prev, [docKey]: false }));

      if (res.ok && data.success) {
        addDocumentUrl(docKey, data.fileUrl || `uploaded_${docKey}`);
      } else {
        setErrorMap((prev) => ({ ...prev, [docKey]: data.message || 'Upload failed. Try again.' }));
      }
    } catch (err) {
      console.error('Upload error:', err);
      setUploadingMap((prev) => ({ ...prev, [docKey]: false }));
      setErrorMap((prev) => ({ ...prev, [docKey]: 'Network error. Please try uploading again.' }));
    }
  };

  // Check if required uploaded
  const requiredKeys = DOCUMENT_LIST.filter((d) => d.required).map((d) => d.key);
  const uploadedKeys = Object.keys(state.uploadedDocuments);
  const canContinue = requiredKeys.every((k) => uploadedKeys.includes(k));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-[#2D3A3A] select-none">
      <JourneyProgress />
      <VoiceGuide text={voiceMsg} language={state.selectedLanguage} />

      <div className="bg-white border-2 border-[#E5E2D9] rounded-[2rem] p-6 sm:p-10 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E2D9] mb-8">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center border border-purple-200 shrink-0">
              <Upload className="w-7 h-7" />
            </div>
            <div className="text-left">
              <span className="px-2.5 py-0.5 rounded-full bg-[#E8F0FE] text-[#0B4A99] font-bold text-[10px] uppercase tracking-wider">
                No Cost EMI Step 2
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight">
                Upload Verification Documents
              </h1>
              <p className="text-xs text-[#7A756D] font-medium mt-0.5">
                Private encrypted storage. Mapped to Salesforce URLs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#FAF9F6] px-3.5 py-2 rounded-2xl border border-[#E5E2D9] text-xs font-bold text-[#0B4A99] self-start sm:self-center">
            <Lock className="w-3.5 h-3.5 text-green-600" />
            <span>256-Bit Private Vault</span>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-[#FAF9F6] border border-[#E5E2D9] rounded-2xl p-4 text-xs text-[#5D5852] mb-8 text-left flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#0B4A99] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Supported formats:</strong> PDF, JPG, PNG (Max 10MB per file). We never expose sensitive Aadhaar or PAN numbers publicly. Uploaded files are stored in our secure private server vault.
          </p>
        </div>

        {/* Document Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10 text-left">
          {DOCUMENT_LIST.map((doc) => {
            const isUploaded = Boolean(state.uploadedDocuments[doc.key]);
            const isUploading = uploadingMap[doc.key];
            const errMsg = errorMap[doc.key];

            return (
              <div
                key={doc.key}
                className={`p-5 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                  isUploaded
                    ? 'bg-green-50/50 border-green-300'
                    : errMsg
                    ? 'bg-red-50/50 border-red-300'
                    : 'bg-[#FAF9F6] border-[#E5E2D9] hover:border-[#0B4A99]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className={`w-4 h-4 ${isUploaded ? 'text-green-600' : 'text-[#0B4A99]'}`} />
                      <h3 className="text-sm font-bold text-[#1A1A1A]">{doc.label}</h3>
                    </div>
                    {doc.required ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase shrink-0">
                        Required
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-200 text-slate-600 uppercase shrink-0">
                        Optional
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#7A756D] mb-4 leading-normal">{doc.desc}</p>
                </div>

                {/* Status / Actions */}
                <div>
                  {isUploaded ? (
                    <div className="flex items-center justify-between pt-3 border-t border-green-200/60">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700">
                        <CheckCircle2 className="w-4 h-4" />
                        Uploaded Securely
                      </span>
                      <label className="text-xs font-bold text-[#0B4A99] hover:underline cursor-pointer">
                        Replace File
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => handleFileUpload(doc.key, doc.label, e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : isUploading ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0B4A99] py-2">
                      <span className="w-4 h-4 border-2 border-[#0B4A99]/30 border-t-[#0B4A99] rounded-full animate-spin" />
                      <span>Encrypting & Uploading...</span>
                    </div>
                  ) : (
                    <div>
                      {errMsg && (
                        <p className="text-[11px] text-red-700 font-medium mb-2 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errMsg}
                        </p>
                      )}
                      <label className="w-full py-3 px-4 rounded-2xl bg-white border-2 border-[#E5E2D9] hover:border-[#0B4A99] text-[#0B4A99] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-all">
                        <Upload className="w-4 h-4" />
                        <span>Choose File (JPG / PNG / PDF)</span>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => handleFileUpload(doc.key, doc.label, e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Bottom CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[#E5E2D9]">
          <button
            onClick={() => navigate('/onboarding/kyc')}
            disabled={!canContinue}
            className="flex-1 py-4 bg-[#0B4A99] hover:bg-[#093e80] text-white rounded-2xl font-bold text-base sm:text-lg transition-colors shadow-lg shadow-blue-900/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
          >
            <span>Continue to KYC Verification</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <a
            href={SUPPORT_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="py-4 px-6 bg-white border-2 border-[#0B4A99] text-[#0B4A99] hover:bg-blue-50 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Not Sure? Contact Support</span>
          </a>
        </div>
      </div>
    </div>
  );
};
