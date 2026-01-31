// components/SignupStep1Personal.tsx
import type {FC} from 'react';
import {useState} from 'react';
import {COUNTRIES, DIAL_CODES} from '../constants/countries';

interface SignupStep1PersonalProps {
  initialData: {
    accountHolderName: string;
    dateOfBirth: string;
    nationality: string;
    swiftBicCode: string;
    countryOfAccount: string;
    contactEmail: string;
    password: string;
    securityPin: string;
    contactPhone: string;
    phoneCode: string;
    streetAddress: string;
    city: string;
    stateProvince: string;
    postalCode: string;
    country: string;
  };
  onComplete: (data: any) => void;
  onBack: () => void;
}

const SignupStep1Personal: FC<SignupStep1PersonalProps> = ({
  initialData,
  onComplete,
  onBack,
}) => {
  const [formData, setFormData] = useState(initialData);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({...prev, [field]: value}));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 flex min-h-screen w-full items-center justify-center p-4 font-['Inter'] antialiased selection:bg-[#F57F3D]/30">
      <div className="relative mx-auto min-h-[844px] w-full max-w-[390px] overflow-hidden bg-[#f8f6f5] dark:bg-[#221610]">
        {/* Subtle background patterns for fintech polish */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="bg-fintech-pattern absolute inset-0 opacity-60" />
          <div className="absolute -right-12 top-1/4 h-64 w-64 rounded-full border border-blue-500/10 opacity-40" />
          <div className="absolute -right-4 top-1/3 h-48 w-48 rounded-full border border-[#F57F3D]/10 opacity-30" />
          <div className="absolute -left-10 top-20 h-80 w-80 rounded-full border border-slate-400/5 opacity-30" />
          <div className="tech-bg-overlay absolute inset-0 z-0" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#f8f6f5]/90 dark:to-[#221610]/90" />
        </div>

        {/* Sticky header */}
        <div className="sticky top-0 z-20 flex items-center justify-between bg-[#f8f6f5]/90 p-4 pb-2 backdrop-blur-sm dark:bg-[#221610]/90">
          <button
            onClick={onBack}
            className="flex size-12 shrink-0 items-center justify-center rounded-full text-[#0d131c] transition-colors hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="flex-1 pr-12 text-center text-lg font-bold leading-tight tracking-[-0.015em] text-[#0d131c] dark:text-white">
            Sign Up
          </h2>
        </div>

        {/* Progress bar */}
        <div className="relative z-10 flex flex-col gap-3 px-6 py-2">
          <div className="flex items-center justify-between gap-6">
            <p className="dark:text-gray-300 text-sm font-medium leading-normal text-[#0d131c]">
              Step 1 of 3
            </p>
            <p className="text-sm font-medium text-[#F57F3D]">
              Personal Details
            </p>
          </div>
          <div className="h-2 w-full rounded-full bg-[#ced9e9] dark:bg-slate-700">
            <div
              className="h-2 rounded-full bg-[#F57F3D] transition-all"
              style={{width: '33%'}}
            />
          </div>
        </div>

        {/* Scrollable form content */}
        <form
          onSubmit={handleSubmit}
          className="relative z-10 flex-1 overflow-y-auto pb-40"
        >
          <div className="px-6 pb-2 pt-6">
            <h1 className="text-[28px] font-bold leading-tight tracking-tight text-[#0d131c] dark:text-white">
              Let's get started
            </h1>
            <p className="pt-2 text-base font-normal leading-normal text-slate-500 dark:text-slate-400">
              Please enter your details exactly as they appear on your ID. This
              helps us verify your identity quickly and securely.
            </p>
          </div>

          <div className="flex flex-col gap-8 px-6 py-6">
            {/* ACCOUNT IDENTITY */}
            <div className="flex flex-col gap-5">
              <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Account Identity
              </h3>

              <label className="flex flex-col gap-2">
                <span className="text-base font-medium text-[#0d131c] dark:text-white">
                  Account Holder Name
                </span>
                <div className="relative">
                  <input
                    className="w-full rounded-xl border border-[#ced9e9] bg-white/80 px-4 py-3.5 text-base text-[#0d131c] shadow-sm outline-none backdrop-blur-sm transition-all placeholder:text-[#94a3b8] focus:border-[#F57F3D] focus:ring-1 focus:ring-[#F57F3D]/50 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
                    placeholder="Full legal name as on ID"
                    type="text"
                    value={formData.accountHolderName}
                    onChange={(e) =>
                      handleInputChange('accountHolderName', e.target.value)
                    }
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                    <span className="material-symbols-outlined text-[20px]">
                      check_circle
                    </span>
                  </span>
                </div>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-base font-medium text-[#0d131c] dark:text-white">
                  Date of Birth
                </span>
                <div className="relative">
                  <input
                    className="w-full rounded-xl border border-[#ced9e9] bg-white/80 px-4 py-3.5 pl-12 text-base text-[#0d131c] shadow-sm outline-none backdrop-blur-sm transition-all placeholder:text-[#94a3b8] focus:border-[#F57F3D] focus:ring-1 focus:ring-[#F57F3D]/50 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
                    placeholder="DD / MM / YYYY"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      handleInputChange('dateOfBirth', e.target.value)
                    }
                    required
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">
                      calendar_today
                    </span>
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  You must be 18 years or older to open an account.
                </p>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-base font-medium text-[#0d131c] dark:text-white">
                  Nationality
                </span>

                <select
                  className="w-full rounded-xl border border-[#ced9e9] bg-white/80 px-4 py-3.5 text-base text-[#0d131c] shadow-sm outline-none backdrop-blur-sm transition-all focus:border-[#F57F3D] focus:ring-1 focus:ring-[#F57F3D]/50 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
                  value={formData.nationality}
                  onChange={(e) =>
                    handleInputChange('nationality', e.target.value)
                  }
                  required
                >
                  <option value="" disabled>
                    Select your nationality
                  </option>

                  {COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-base font-medium text-[#0d131c] dark:text-white">
                  SWIFT/BIC Code
                </span>
                <input
                  className="w-full rounded-xl border border-[#ced9e9] bg-white/80 px-4 py-3.5 text-base text-[#0d131c] shadow-sm outline-none backdrop-blur-sm transition-all placeholder:text-[#94a3b8] focus:border-[#F57F3D] focus:ring-1 focus:ring-[#F57F3D]/50 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
                  placeholder="8 or 11 characters (e.g. BOFAUS3N)"
                  type="text"
                  value={formData.swiftBicCode}
                  onChange={(e) =>
                    handleInputChange('swiftBicCode', e.target.value)
                  }
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Required if funding from international accounts.
                </p>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-base font-medium text-[#0d131c] dark:text-white">
                  Country of Account
                </span>
                <select
                  className="w-full rounded-xl border border-[#ced9e9] bg-white/80 px-4 py-3.5 text-base text-[#0d131c] shadow-sm outline-none backdrop-blur-sm transition-all focus:border-[#F57F3D] focus:ring-1 focus:ring-[#F57F3D]/50 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
                  value={formData.countryOfAccount}
                  onChange={(e) =>
                    handleInputChange('countryOfAccount', e.target.value)
                  }
                  required
                >
                  {COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* CONTACT INFORMATION */}
            <div className="flex flex-col gap-5">
              <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Contact Information
              </h3>

              <label className="flex flex-col gap-2">
                <span className="text-base font-medium text-[#0d131c] dark:text-white">
                  Contact Email
                </span>
                <input
                  className="w-full rounded-xl border border-[#ced9e9] bg-white/80 px-4 py-3.5 text-base text-[#0d131c] shadow-sm outline-none backdrop-blur-sm transition-all placeholder:text-[#94a3b8] focus:border-[#F57F3D] focus:ring-1 focus:ring-[#F57F3D]/50 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
                  placeholder="name@example.com"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) =>
                    handleInputChange('contactEmail', e.target.value)
                  }
                  required
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-base font-medium text-[#0d131c] dark:text-white">
                  Password
                </span>
                <div className="relative">
                  <input
                    className="w-full rounded-xl border border-[#ced9e9] bg-white/80 px-4 py-3.5 text-base text-[#0d131c] shadow-sm outline-none backdrop-blur-sm transition-all placeholder:text-[#94a3b8] focus:border-[#F57F3D] focus:ring-1 focus:ring-[#F57F3D]/50 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
                    placeholder="Minimum 8 characters"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange('password', e.target.value)
                    }
                    required
                    minLength={8}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">
                      lock
                    </span>
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Must contain at least 8 characters, including uppercase,
                  lowercase, and number
                </p>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-base font-medium text-[#0d131c] dark:text-white">
                  Security Pin
                </span>
                <div className="relative">
                  <input
                    className="w-full rounded-xl border border-[#ced9e9] bg-white/80 px-4 py-3.5 text-base text-[#0d131c] shadow-sm outline-none backdrop-blur-sm transition-all placeholder:text-[#94a3b8] focus:border-[#F57F3D] focus:ring-1 focus:ring-[#F57F3D]/50 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
                    placeholder="Minimum 8 characters"
                    type="number"
                    value={formData.securityPin}
                    onChange={(e) =>
                      handleInputChange('securityPin', e.target.value)
                    }
                    required
                    minLength={8}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">
                      lock
                    </span>
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Must contain at least 8 characters, including uppercase,
                  lowercase, and number
                </p>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-base font-medium text-[#0d131c] dark:text-white">
                  Contact Phone Number
                </span>
                <div className="flex gap-3">
                  <select
                    className="w-24 rounded-xl border border-[#ced9e9] bg-white/80 px-3 py-3.5 text-center text-base outline-none focus:border-[#F57F3D] focus:ring-1 focus:ring-[#F57F3D]/50 dark:border-slate-600 dark:bg-slate-800/80"
                    value={formData.phoneCode}
                    onChange={(e) =>
                      handleInputChange('phoneCode', e.target.value)
                    }
                  >
                    {DIAL_CODES.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                  <input
                    className="flex-1 rounded-xl border border-[#ced9e9] bg-white/80 px-4 py-3.5 text-base text-[#0d131c] shadow-sm outline-none transition-all placeholder:text-[#94a3b8] focus:border-[#F57F3D] focus:ring-1 focus:ring-[#F57F3D]/50 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
                    placeholder="000 000 000"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) =>
                      handleInputChange('contactPhone', e.target.value)
                    }
                    required
                  />
                </div>
              </label>
            </div>

            {/* REGISTERED ADDRESS */}
            <div className="flex flex-col gap-5">
              <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Registered Address
              </h3>

              <label className="flex flex-col gap-2">
                <span className="text-base font-medium text-[#0d131c] dark:text-white">
                  Street Address, Apartment, Unit
                </span>
                <input
                  className="w-full rounded-xl border border-[#ced9e9] bg-white/80 px-4 py-3.5 text-base text-[#0d131c] shadow-sm outline-none backdrop-blur-sm transition-all placeholder:text-[#94a3b8] focus:border-[#F57F3D] focus:ring-1 focus:ring-[#F57F3D]/50 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
                  placeholder="123 Main St, Apt 4B"
                  type="text"
                  value={formData.streetAddress}
                  onChange={(e) =>
                    handleInputChange('streetAddress', e.target.value)
                  }
                  required
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-base font-medium text-[#0d131c] dark:text-white">
                    City
                  </span>
                  <input
                    className="w-full rounded-xl border border-[#ced9e9] bg-white/80 px-4 py-3.5 text-base text-[#0d131c] shadow-sm outline-none transition-all placeholder:text-[#94a3b8] focus:border-[#F57F3D] focus:ring-1 focus:ring-[#F57F3D]/50 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
                    placeholder="City"
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    required
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-base font-medium text-[#0d131c] dark:text-white">
                    State/Province
                  </span>
                  <input
                    className="w-full rounded-xl border border-[#ced9e9] bg-white/80 px-4 py-3.5 text-base text-[#0d131c] shadow-sm outline-none transition-all placeholder:text-[#94a3b8] focus:border-[#F57F3D] focus:ring-1 focus:ring-[#F57F3D]/50 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
                    placeholder="State"
                    type="text"
                    value={formData.stateProvince}
                    onChange={(e) =>
                      handleInputChange('stateProvince', e.target.value)
                    }
                    required
                  />
                </label>
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-base font-medium text-[#0d131c] dark:text-white">
                  Postal/ZIP Code
                </span>
                <input
                  className="w-full rounded-xl border border-[#ced9e9] bg-white/80 px-4 py-3.5 text-base text-[#0d131c] shadow-sm outline-none transition-all placeholder:text-[#94a3b8] focus:border-[#F57F3D] focus:ring-1 focus:ring-[#F57F3D]/50 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
                  placeholder="12345"
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) =>
                    handleInputChange('postalCode', e.target.value)
                  }
                  required
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-base font-medium text-[#0d131c] dark:text-white">
                  Country
                </span>
                <select
                  className="w-full rounded-xl border border-[#ced9e9] bg-white/80 px-4 py-3.5 text-base text-[#0d131c] shadow-sm outline-none backdrop-blur-sm transition-all focus:border-[#F57F3D] focus:ring-1 focus:ring-[#F57F3D]/50 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  required
                >
                  {COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Fixed bottom CTA */}
          <div className="fixed bottom-0 left-0 right-0 z-20 mx-auto max-w-[390px] border-t border-slate-100 bg-white/80 p-2 backdrop-blur-md dark:border-slate-800 dark:bg-[#221610]/80">
            <div className="flex flex-col items-center gap-4">
              <button
                type="submit"
                className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#F57F3D] text-lg font-semibold text-white shadow-lg shadow-[#F57F3D]/20 transition-all hover:bg-[#e06c2e] active:scale-[0.98]"
              >
                Continue
                <span className="material-symbols-outlined text-[20px]">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupStep1Personal;
