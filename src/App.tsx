import React from 'react';
import { OnboardingProvider, useOnboarding } from './context/OnboardingContext';
import { Header } from './components/Header';
import { LoginPage } from './pages/LoginPage';
import { CongratulationsPage } from './pages/CongratulationsPage';
import { PaymentOptionsPage } from './pages/PaymentOptionsPage';
import { FullPaymentPage } from './pages/FullPaymentPage';
import { NoCostEmiPage } from './pages/NoCostEmiPage';
import { CoApplicantPage } from './pages/CoApplicantPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { SlotBookingPage } from './pages/SlotBookingPage';
import { KycPage } from './pages/KycPage';

const AppRoutes: React.FC = () => {
  const { currentRoute } = useOnboarding();

  const renderPage = () => {
    switch (currentRoute) {
      case '/onboarding/login':
      case '/':
        return <LoginPage />;
      case '/onboarding/congratulations':
        return <CongratulationsPage />;
      case '/onboarding/payment-options':
        return <PaymentOptionsPage />;
      case '/onboarding/full-payment':
        return <FullPaymentPage />;
      case '/onboarding/no-cost-emi':
        return <NoCostEmiPage />;
      case '/onboarding/co-applicant':
        return <CoApplicantPage />;
      case '/onboarding/documents':
        return <DocumentsPage />;
      case '/onboarding/slot-booking':
        return <SlotBookingPage />;
      case '/onboarding/kyc':
        return <KycPage />;
      default:
        return <LoginPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col font-sans text-[#2D3A3A] antialiased">
      <Header />
      <main className="flex-1 pb-16">
        {renderPage()}
      </main>
      <footer className="py-6 border-t border-[#E5E2D9] text-center text-xs text-[#7A756D] bg-white/50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} NxtWave Disruptive Technologies. All rights reserved.</p>
          <div className="flex items-center gap-4 font-medium">
            <span className="flex items-center gap-1 text-[#0B4A99]">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Salesforce CRM Connected
            </span>
            <span>Support: +91 7330918872</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <OnboardingProvider>
      <AppRoutes />
    </OnboardingProvider>
  );
}
