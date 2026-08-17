import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { OnboardingState, PaymentOption, SalesforceUser, CoApplicantDetails } from '../types/onboarding';

interface OnboardingContextType {
  state: OnboardingState;
  currentRoute: string;
  navigate: (route: string) => void;
  loginWithMobile: (mobile: string) => Promise<{ success: boolean; message?: string }>;
  selectLanguage: (langCode: string) => void;
  selectPaymentOption: (option: PaymentOption) => void;
  saveCoApplicant: (details: CoApplicantDetails) => Promise<boolean>;
  addDocumentUrl: (docKey: string, url: string) => void;
  completeKycStep: () => void;
  markNbfcStatusViewed: () => void;
  toggleMuteVoice: () => void;
  resetJourney: () => void;
}

const DEFAULT_STATE: OnboardingState = {
  salesforceId: '',
  name: '',
  mobile: '',
  email: '',
  selectedLanguage: 'en-IN',
  selectedPaymentOption: null,
  coApplicantStatus: 'NOT_STARTED',
  coApplicantDetails: null,
  documentsStatus: 'NOT_STARTED',
  uploadedDocuments: {},
  kycStatus: 'PENDING',
  nbfcStatusViewed: false,
  currentLevel: 1,
  mutedVoice: false,
};

const STORAGE_KEY = 'nxtwave_onboarding_state_v1';

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<OnboardingState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_STATE, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load saved state from localStorage:', e);
    }
    return DEFAULT_STATE;
  });

  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const path = window.location.pathname;
    if (path.startsWith('/onboarding')) return path;
    return '/onboarding/login';
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to persist onboarding state:', e);
    }
  }, [state]);

  // Handle URL popstate navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/onboarding')) {
        setCurrentRoute(path);
      } else {
        setCurrentRoute('/onboarding/login');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Route Guard enforcement
  useEffect(() => {
    if (!state.salesforceId && currentRoute !== '/onboarding/login') {
      navigate('/onboarding/login');
      return;
    }

    if (state.salesforceId && currentRoute === '/onboarding/login') {
      navigate('/onboarding/congratulations');
      return;
    }

    if (
      (currentRoute === '/onboarding/co-applicant' || currentRoute === '/onboarding/documents') &&
      state.selectedPaymentOption !== 'NO_COST_EMI'
    ) {
      navigate('/onboarding/payment-options');
      return;
    }

    if (currentRoute === '/onboarding/documents' && state.coApplicantStatus === 'NOT_STARTED') {
      navigate('/onboarding/co-applicant');
      return;
    }

    if (
      currentRoute === '/onboarding/nbfc-status' &&
      (state.kycStatus !== 'COMPLETED' || state.selectedPaymentOption !== 'NO_COST_EMI')
    ) {
      navigate('/onboarding/kyc');
      return;
    }
  }, [currentRoute, state.salesforceId, state.selectedPaymentOption, state.coApplicantStatus, state.kycStatus]);

  const navigate = (route: string) => {
    // Stop any ongoing voice guidance when changing routes
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    window.history.pushState({}, '', route);
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loginWithMobile = async (mobile: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/onboarding/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        const u: SalesforceUser = data.user;
        setState((prev) => ({
          ...prev,
          salesforceId: u.salesforceId,
          name: u.name,
          mobile: u.mobile,
          email: u.email || '',
          currentLevel: 1, // Level 1 completed: Identity Verified
        }));
        navigate(data.nextRoute || '/onboarding/congratulations');
        return { success: true };
      } else {
        return { success: false, message: data.message || 'We could not verify your mobile number.' };
      }
    } catch (err) {
      console.error('Login API error:', err);
      return { success: false, message: 'Network error connecting to verification server. Please try again.' };
    }
  };

  const selectLanguage = (langCode: string) => {
    setState((prev) => ({
      ...prev,
      selectedLanguage: langCode,
      currentLevel: Math.max(prev.currentLevel, 2), // Level 2 unlocked
    }));
  };

  const selectPaymentOption = (option: PaymentOption) => {
    setState((prev) => ({
      ...prev,
      selectedPaymentOption: option,
      currentLevel: Math.max(prev.currentLevel, 3), // Level 3: Payment Choice
    }));
  };

  const saveCoApplicant = async (details: CoApplicantDetails): Promise<boolean> => {
    try {
      const res = await fetch('/api/onboarding/co-applicant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salesforceId: state.salesforceId, coApplicant: details }),
      });
      if (res.ok) {
        setState((prev) => ({
          ...prev,
          coApplicantStatus: 'SUBMITTED',
          coApplicantDetails: details,
          documentsStatus: prev.documentsStatus === 'NOT_STARTED' ? 'IN_PROGRESS' : prev.documentsStatus,
          currentLevel: Math.max(prev.currentLevel, 4), // Level 4: Payment path started
        }));
        return true;
      }
      return false;
    } catch (e) {
      console.error('Save co-applicant error:', e);
      return false;
    }
  };

  const addDocumentUrl = (docKey: string, url: string) => {
    setState((prev) => {
      const updated = { ...prev.uploadedDocuments, [docKey]: url };
      const docCount = Object.keys(updated).length;
      const submitted = docCount >= 3;
      return {
        ...prev,
        uploadedDocuments: updated,
        documentsStatus: submitted ? 'SUBMITTED' : 'IN_PROGRESS',
        currentLevel: Math.max(prev.currentLevel, submitted ? 5 : 4), // Level 5: All documents submitted
      };
    });
  };

  const completeKycStep = () => {
    setState((prev) => ({
      ...prev,
      kycStatus: 'COMPLETED',
      currentLevel: 6, // Level 6: Final
    }));
  };

  const markNbfcStatusViewed = () => {
    setState((prev) => ({ ...prev, nbfcStatusViewed: true }));
  };

  const toggleMuteVoice = () => {
    if (!state.mutedVoice && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setState((prev) => ({ ...prev, mutedVoice: !prev.mutedVoice }));
  };

  const resetJourney = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    localStorage.removeItem(STORAGE_KEY);
    setState(DEFAULT_STATE);
    navigate('/onboarding/login');
  };

  return (
    <OnboardingContext.Provider
      value={{
        state,
        currentRoute,
        navigate,
        loginWithMobile,
        selectLanguage,
        selectPaymentOption,
        saveCoApplicant,
        addDocumentUrl,
        completeKycStep,
        markNbfcStatusViewed,
        toggleMuteVoice,
        resetJourney,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
