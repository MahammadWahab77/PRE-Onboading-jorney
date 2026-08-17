export type PaymentOption = 'FULL_PAYMENT' | 'NO_COST_EMI';

export type StepStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED';

export type KycStatus = 'PENDING' | 'SUBMITTED' | 'COMPLETED';

export interface SalesforceUser {
  salesforceId: string;
  name: string;
  email?: string;
  userId?: string;
  programRegisteredUID?: string;
  mobile: string;
}

export interface CoApplicantDetails {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  occupation: string;
  monthlyIncome: string;
  employmentType: string;
  state: string;
  address: string;
}

export interface DocumentUploadItem {
  id: string;
  label: string;
  key: string;
  required: boolean;
  status: 'PENDING' | 'UPLOADING' | 'UPLOADED' | 'FAILED';
  fileUrl?: string;
  fileName?: string;
}

export interface BookedSlot {
  id: string;
  source: string;
  date: string;
  time: string;
  bookedAt: string;
}

export interface OnboardingState {
  salesforceId: string;
  name: string;
  mobile: string;
  email: string;
  selectedLanguage: string; // e.g. 'en-IN', 'te-IN', 'hi-IN', 'ta-IN', 'kn-IN'
  selectedPaymentOption: PaymentOption | null;
  coApplicantStatus: StepStatus;
  coApplicantDetails: CoApplicantDetails | null;
  documentsStatus: StepStatus;
  uploadedDocuments: Record<string, string>; // key -> url
  slotStatus: 'NOT_BOOKED' | 'BOOKED';
  bookedSlot: BookedSlot | null;
  kycStatus: KycStatus;
  currentLevel: number; // 1 to 6
  mutedVoice: boolean;
}

export interface LanguageOption {
  code: string;
  label: string;
  native: string;
  sampleVoiceText: string;
}
