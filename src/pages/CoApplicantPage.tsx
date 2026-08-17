import React, { useState } from 'react';
import { Users, User, Briefcase, MapPin, ArrowRight, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';
import { useOnboarding } from '../context/OnboardingContext';
import { VoiceGuide } from '../components/VoiceGuide';
import { JourneyProgress } from '../components/JourneyProgress';
import { CoApplicantDetails } from '../types/onboarding';
import { SUPPORT_WHATSAPP_URL } from '../constants';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Telangana', 'Karnataka', 'Tamil Nadu', 'Maharashtra',
  'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Gujarat', 'West Bengal',
  'Odisha', 'Kerala', 'Bihar', 'Haryana', 'Punjab', 'Delhi', 'Other'
];

export const CoApplicantPage: React.FC = () => {
  const { state, saveCoApplicant, navigate } = useOnboarding();

  const [formData, setFormData] = useState<CoApplicantDetails>(() => {
    return state.coApplicantDetails || {
      name: '',
      relationship: 'Parent',
      phone: '',
      email: '',
      occupation: 'Salaried',
      monthlyIncome: '25,000 - 50,000',
      employmentType: 'Private Sector',
      state: 'Andhra Pradesh',
      address: '',
    };
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const voiceMsg = "Please enter your co-applicant details. Usually this can be your parent, guardian, or earning family member.";

  const handleChange = (field: keyof CoApplicantDetails, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 10) handleChange('phone', val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || formData.phone.length !== 10) {
      setErrorMsg('Please provide the co-applicant name and a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const success = await saveCoApplicant(formData);
    setLoading(false);

    if (success) {
      navigate('/onboarding/documents');
    } else {
      setErrorMsg('Could not save details to server. Please verify network connection or contact support.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-[#2D3A3A] select-none">
      <JourneyProgress />
      <VoiceGuide text={voiceMsg} language={state.selectedLanguage} />

      <div className="bg-white border-2 border-[#E5E2D9] rounded-[2rem] p-6 sm:p-10 shadow-sm mb-8">
        <div className="flex items-center gap-3 pb-6 border-b border-[#E5E2D9] mb-8">
          <div className="w-14 h-14 bg-[#FFF8EB] text-[#E8AF30] rounded-2xl flex items-center justify-center border border-[#E8AF30]/30 shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E8F0FE] text-[#0B4A99] font-bold text-[10px] uppercase tracking-wider">
              No Cost EMI Step 1
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight">
              Co-Applicant Information
            </h1>
            <p className="text-xs text-[#7A756D] font-medium mt-0.5">
              Mapped directly to Salesforce <code className="font-mono bg-[#FAF9F6] px-1 py-0.5 rounded text-[#0B4A99]">Academy_Onboarding_PRE__c</code>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 text-left">
          {/* Section 1: Personal Details */}
          <div className="bg-[#FAF9F6] border border-[#E5E2D9] rounded-3xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0B4A99] mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>1. Basic & Relationship Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7A756D] mb-1.5">
                  Co-Applicant Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full bg-white border-2 border-[#E5E2D9] focus:border-[#0B4A99] rounded-2xl p-3.5 text-sm font-bold text-[#1A1A1A] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7A756D] mb-1.5">
                  Relationship with Student *
                </label>
                <select
                  value={formData.relationship}
                  onChange={(e) => handleChange('relationship', e.target.value)}
                  className="w-full bg-white border-2 border-[#E5E2D9] focus:border-[#0B4A99] rounded-2xl p-3.5 text-sm font-bold text-[#1A1A1A] focus:outline-none transition-all cursor-pointer"
                >
                  <option value="Parent">Parent (Father / Mother)</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Sibling">Sibling (Brother / Sister)</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Relative">Earning Relative</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7A756D] mb-1.5">
                  Mobile Number *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-bold text-[#7A756D] border-r border-[#E5E2D9] pr-2 pointer-events-none">+91</span>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="10-digit mobile"
                    className="w-full bg-white border-2 border-[#E5E2D9] focus:border-[#0B4A99] rounded-2xl p-3.5 pl-14 text-sm font-bold text-[#1A1A1A] font-mono focus:outline-none transition-all"
                  />
                  {formData.phone.length === 10 && (
                    <CheckCircle2 className="w-4 h-4 text-green-600 absolute right-3 pointer-events-none" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7A756D] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="coapplicant@example.com"
                  className="w-full bg-white border-2 border-[#E5E2D9] focus:border-[#0B4A99] rounded-2xl p-3.5 text-sm font-bold text-[#1A1A1A] focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Financial Details */}
          <div className="bg-[#FAF9F6] border border-[#E5E2D9] rounded-3xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#E8AF30] mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              <span>2. Occupation & Income (For NBFC Process)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7A756D] mb-1.5">
                  Occupation *
                </label>
                <select
                  value={formData.occupation}
                  onChange={(e) => handleChange('occupation', e.target.value)}
                  className="w-full bg-white border-2 border-[#E5E2D9] focus:border-[#0B4A99] rounded-2xl p-3.5 text-sm font-bold text-[#1A1A1A] focus:outline-none transition-all cursor-pointer"
                >
                  <option value="Salaried">Salaried Employee</option>
                  <option value="Self-Employed">Self-Employed / Business</option>
                  <option value="Farmer">Farmer / Agriculture</option>
                  <option value="Retired">Retired / Pensioner</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7A756D] mb-1.5">
                  Monthly Income *
                </label>
                <select
                  value={formData.monthlyIncome}
                  onChange={(e) => handleChange('monthlyIncome', e.target.value)}
                  className="w-full bg-white border-2 border-[#E5E2D9] focus:border-[#0B4A99] rounded-2xl p-3.5 text-sm font-bold text-[#1A1A1A] focus:outline-none transition-all cursor-pointer"
                >
                  <option value="Below 25,000">Below ₹25,000</option>
                  <option value="25,000 - 50,000">₹25,000 - ₹50,000</option>
                  <option value="50,000 - 1,00,000">₹50,000 - ₹1,00,000</option>
                  <option value="Above 1,00,000">Above ₹1,00,000</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7A756D] mb-1.5">
                  Sector Type *
                </label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => handleChange('employmentType', e.target.value)}
                  className="w-full bg-white border-2 border-[#E5E2D9] focus:border-[#0B4A99] rounded-2xl p-3.5 text-sm font-bold text-[#1A1A1A] focus:outline-none transition-all cursor-pointer"
                >
                  <option value="Private Sector">Private Sector</option>
                  <option value="Government">Government Sector</option>
                  <option value="Small Business">Small Business / Shop</option>
                  <option value="Agriculture">Agriculture</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Location */}
          <div className="bg-[#FAF9F6] border border-[#E5E2D9] rounded-3xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#2D3A3A] mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#0B4A99]" />
              <span>3. Location & Address</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7A756D] mb-1.5">
                  State *
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className="w-full bg-white border-2 border-[#E5E2D9] focus:border-[#0B4A99] rounded-2xl p-3.5 text-sm font-bold text-[#1A1A1A] focus:outline-none transition-all cursor-pointer"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7A756D] mb-1.5">
                  Full Residential Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="House No, Street, Village/Town, District"
                  className="w-full bg-white border-2 border-[#E5E2D9] focus:border-[#0B4A99] rounded-2xl p-3.5 text-sm font-bold text-[#1A1A1A] focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-[#0B4A99] hover:bg-[#093e80] text-white rounded-2xl font-bold text-base sm:text-lg transition-colors shadow-lg shadow-blue-900/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving to Salesforce...
                </span>
              ) : (
                <>
                  <span>Save and Continue</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <a
              href={SUPPORT_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="py-4 px-6 bg-white border-2 border-[#0B4A99] text-[#0B4A99] hover:bg-blue-50 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Contact Support</span>
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};
