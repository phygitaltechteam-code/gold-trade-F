/*eslint-disable*/
import type {FC} from 'react';
import {useState} from 'react';
import {COUNTRIES, DIAL_CODES} from '../constants/countries';

interface SignupStep1PersonalProps {
  initialData: {
    accountHolderName: string;
    dateOfBirth: string;
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
    <div className="dark:bg-gray-950 flex min-h-screen w-full items-center justify-center bg-white font-['Inter'] antialiased selection:bg-[#F57F3D]/30 md:p-6">
      {/* Main container with responsive width */}
      <div className="relative mx-auto w-full max-w-[min(390px,95vw,500px)] overflow-hidden rounded-2xl bg-white dark:bg-[#221610] md:min-h-[600px] md:max-w-[700px]">
        {/* Header section */}
        <div className="sticky top-0 z-20 flex items-center justify-between bg-white/95 p-4 pb-2 backdrop-blur-sm dark:bg-[#221610]/95 md:p-6 md:pb-3">
          <button
            onClick={onBack}
            className="flex size-12 shrink-0 items-center justify-center rounded-full text-[#0d131c] transition-colors hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800 md:size-14"
          >
            <span className="material-symbols-outlined text-[24px] md:text-[26px]">
              arrow_back
            </span>
          </button>
          <h2 className="flex-1 pr-12 text-center text-lg font-bold leading-tight tracking-[-0.015em] text-[#0d131c] dark:text-white md:text-xl">
            Sign Up
          </h2>
        </div>

        {/* Progress bar */}
        <div className="relative z-10 flex flex-col gap-3 px-6 py-2 md:px-8 md:py-3">
          <div className="flex items-center justify-between gap-6">
            <p className="dark:text-gray-300 text-sm font-medium leading-normal text-[#0d131c] md:text-base">
              Step 1 of 3
            </p>
            <p className="text-sm font-medium text-[#F57F3D] md:text-base">
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

        {/* Main content area */}
        <div className="relative z-10 px-6 pb-2 pt-6 md:px-8 md:pt-8">
          <h1 className="text-[28px] font-bold leading-tight tracking-tight text-[#0d131c] dark:text-white md:text-[32px]">
            Let's get started
          </h1>
          <p className="pt-2 text-base font-normal leading-normal text-slate-500 dark:text-slate-400 md:pt-3 md:text-lg">
            Please enter your details exactly as they appear on your ID. This
            helps us verify your identity quickly and securely.
          </p>
        </div>

        {/* Scrollable form content */}
        <form
          onSubmit={handleSubmit}
          className="relative z-10 flex-1 overflow-y-auto pb-20 md:pb-10"
        >
          <div className="px-6 pb-6 pt-6 md:px-8 md:pb-8">
            <div className="flex flex-col gap-8 md:gap-10">
              {/* ACCOUNT IDENTITY */}
              <div className="flex flex-col gap-5">
                <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 md:text-base">
                  Account Identity
                </h3>

                <label className="flex flex-col gap-2">
                  <span className="text-base font-medium text-[#0d131c] dark:text-white md:text-lg">
                    Account Holder Name
                  </span>
                  <div className="relative">
                    <input
                      className="w-full rounded-xl border border-[#ced9e9] bg-white px-4 py-3.5 text-base text-[#0d131c] shadow-sm outline-none transition-all placeholder:text-[#94a3b8] focus:border-[#F57F3D] focus:ring-2 focus:ring-[#F57F3D]/30 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white md:py-4 md:text-lg"
                      placeholder="Full legal name as on ID"
                      type="text"
                      value={formData.accountHolderName}
                      onChange={(e) =>
                        handleInputChange('accountHolderName', e.target.value)
                      }
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                      <span className="material-symbols-outlined text-[20px] md:text-[22px]">
                        check_circle
                      </span>
                    </span>
                  </div>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-base font-medium text-[#0d131c] dark:text-white md:text-lg">
                    Date of Birth
                  </span>
                  <div className="relative">
                    <input
                      className="w-full rounded-xl border border-[#ced9e9] bg-white px-4 py-3.5 pl-12 text-base text-[#0d131c] shadow-sm outline-none transition-all placeholder:text-[#94a3b8] focus:border-[#F57F3D] focus:ring-2 focus:ring-[#F57F3D]/30 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white md:py-4 md:text-lg"
                      placeholder="DD / MM / YYYY"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        handleInputChange('dateOfBirth', e.target.value)
                      }
                      required
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <span className="material-symbols-outlined text-[20px] md:text-[22px]">
                        calendar_today
                      </span>
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 md:text-sm">
                    You must be 18 years or older to open an account.
                  </p>
                </label>
              </div>

              {/* CONTACT INFORMATION */}
              <div className="flex flex-col gap-5">
                <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 md:text-base">
                  Contact Information
                </h3>

                <label className="flex flex-col gap-2">
                  <span className="text-base font-medium text-[#0d131c] dark:text-white md:text-lg">
                    Contact Email
                  </span>
                  <input
                    className="w-full rounded-xl border border-[#ced9e9] bg-white px-4 py-3.5 text-base text-[#0d131c] shadow-sm outline-none transition-all placeholder:text-[#94a3b8] focus:border-[#F57F3D] focus:ring-2 focus:ring-[#F57F3D]/30 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white md:py-4 md:text-lg"
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
                  <span className="text-base font-medium text-[#0d131c] dark:text-white md:text-lg">
                    Password
                  </span>
                  <div className="relative">
                    <input
                      className="w-full rounded-xl border border-[#ced9e9] bg-white px-4 py-3.5 text-base text-[#0d131c] shadow-sm outline-none transition-all placeholder:text-[#94a3b8] focus:border-[#F57F3D] focus:ring-2 focus:ring-[#F57F3D]/30 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white md:py-4 md:text-lg"
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
                      <span className="material-symbols-outlined text-[20px] md:text-[22px]">
                        lock
                      </span>
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 md:text-sm">
                    Must contain at least 8 characters, including uppercase,
                    lowercase, and number
                  </p>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-base font-medium text-[#0d131c] dark:text-white md:text-lg">
                    Security Pin
                  </span>
                  <div className="relative">
                    <input
                      className="w-full rounded-xl border border-[#ced9e9] bg-white px-4 py-3.5 text-base text-[#0d131c] shadow-sm outline-none transition-all placeholder:text-[#94a3b8] focus:border-[#F57F3D] focus:ring-2 focus:ring-[#F57F3D]/30 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white md:py-4 md:text-lg"
                      placeholder="6 characters"
                      type="number"
                      value={formData.securityPin}
                      onChange={(e) =>
                        handleInputChange('securityPin', e.target.value)
                      }
                      required
                      maxLength={6}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <span className="material-symbols-outlined text-[20px] md:text-[22px]">
                        lock
                      </span>
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 md:text-sm">
                    6-digit PIN for account security
                  </p>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-base font-medium text-[#0d131c] dark:text-white md:text-lg">
                    Contact Phone Number
                  </span>
                  <div className="flex gap-3 md:gap-4">
                    <input
                      className="flex-1 rounded-xl border border-[#ced9e9] bg-white px-4 py-3.5 text-base text-[#0d131c] shadow-sm outline-none transition-all placeholder:text-[#94a3b8] focus:border-[#F57F3D] focus:ring-2 focus:ring-[#F57F3D]/30 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white md:py-4 md:text-lg"
                      placeholder="10 digit Phone Number"
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
                <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 md:text-base">
                  Registered Address
                </h3>

                <label className="flex flex-col gap-2">
                  <span className="text-base font-medium text-[#0d131c] dark:text-white md:text-lg">
                    Street Address, Apartment, Unit
                  </span>
                  <input
                    className="w-full rounded-xl border border-[#ced9e9] bg-white px-4 py-3.5 text-base text-[#0d131c] shadow-sm outline-none transition-all placeholder:text-[#94a3b8] focus:border-[#F57F3D] focus:ring-2 focus:ring-[#F57F3D]/30 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white md:py-4 md:text-lg"
                    placeholder="123 Main St, Apt 4B"
                    type="text"
                    value={formData.streetAddress}
                    onChange={(e) =>
                      handleInputChange('streetAddress', e.target.value)
                    }
                    required
                  />
                </label>

                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <label className="flex flex-col gap-2">
                    <span className="text-base font-medium text-[#0d131c] dark:text-white md:text-lg">
                      City
                    </span>
                    <input
                      className="w-full rounded-xl border border-[#ced9e9] bg-white px-4 py-3.5 text-base text-[#0d131c] shadow-sm outline-none transition-all placeholder:text-[#94a3b8] focus:border-[#F57F3D] focus:ring-2 focus:ring-[#F57F3D]/30 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white md:py-4 md:text-lg"
                      placeholder="City"
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange('city', e.target.value)
                      }
                      required
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-base font-medium text-[#0d131c] dark:text-white md:text-lg">
                      State/Province
                    </span>
                    <input
                      className="w-full rounded-xl border border-[#ced9e9] bg-white px-4 py-3.5 text-base text-[#0d131c] shadow-sm outline-none transition-all placeholder:text-[#94a3b8] focus:border-[#F57F3D] focus:ring-2 focus:ring-[#F57F3D]/30 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white md:py-4 md:text-lg"
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
                  <span className="text-base font-medium text-[#0d131c] dark:text-white md:text-lg">
                    Postal/ZIP Code
                  </span>
                  <input
                    className="w-full rounded-xl border border-[#ced9e9] bg-white px-4 py-3.5 text-base text-[#0d131c] shadow-sm outline-none transition-all placeholder:text-[#94a3b8] focus:border-[#F57F3D] focus:ring-2 focus:ring-[#F57F3D]/30 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white md:py-4 md:text-lg"
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
                  <span className="text-base font-medium text-[#0d131c] dark:text-white md:text-lg">
                    Country
                  </span>
                  <select
                    className="w-full rounded-xl border border-[#ced9e9] bg-white px-4 py-3.5 text-base text-[#0d131c] shadow-sm outline-none transition-all focus:border-[#F57F3D] focus:ring-2 focus:ring-[#F57F3D]/30 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white md:py-4 md:text-lg"
                    value={formData.country}
                    onChange={(e) =>
                      handleInputChange('country', e.target.value)
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
            </div>
          </div>
        </form>

        {/* Fixed bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 z-20 mx-auto w-full max-w-[min(390px,95vw,500px)] border-t border-slate-100 bg-white p-2 backdrop-blur-md dark:border-slate-800 dark:bg-[#221610]/80 md:relative md:mt-6 md:max-w-[700px] md:border-t-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
          <div className="flex flex-col items-center gap-4 md:px-8 md:pb-6">
            <button
              type="submit"
              className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#F57F3D] text-lg font-semibold text-white shadow-lg shadow-[#F57F3D]/20 transition-all hover:bg-[#e06c2e] active:scale-[0.98] md:h-16 md:max-w-[400px] md:text-xl"
              onClick={handleSubmit}
            >
              Continue
              <span className="material-symbols-outlined text-[20px] md:text-[22px]">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupStep1Personal;
