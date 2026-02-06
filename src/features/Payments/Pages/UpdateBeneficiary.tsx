/*eslint-disable*/
import React, {useState, useEffect} from 'react';
import {MdArrowBack, MdArrowForward} from 'react-icons/md';
import {useNavigate, useParams} from '@tanstack/react-router';
import {beneficiarySchema} from '../beneficiarySchema';
import {BeneficiaryFormData} from '../types';
import {FormProvider, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import GenericInputField from '@/components/Forms/Input/GenericInputField';
import GenericDropdown from '@/components/Forms/DropDown/GenericDropDown';
import {
  SectionHeader,
  ProgressBar,
  Divider,
} from '../Components/BenifeciaryFormComponents';
import {
  useGetBeneficiaryById,
  useUpdateBeneficiary,
} from '@/lib/react-query/beneficiary';

import {Loader2} from 'lucide-react';

const UpdateBeneficiary: React.FC = () => {
  const navigate = useNavigate();
  const {id} = useParams({from: '/_app/updatebeneficiary/$id'});
  const {
    data: beneficiary,
    isLoading,
    isError,
  } = useGetBeneficiaryById(id || '');
  const updateMutation = useUpdateBeneficiary();

  const [countryCode, setCountryCode] = useState('+1');

  // Initialize form with default values
  const methods = useForm<BeneficiaryFormData>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {
      fullName: '',
      relationship: '',
      email: '',
      phoneNumber: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      country: '',
      bankCountry: '',
      currency: '',
      accountNumber: '',
      accountType: '',
      SWIFTBIC: '',
      IFSC: '',
      bankName: '',
      branchName: '',
    },
    mode: 'onChange',
  });

  // Reset form when beneficiary data is loaded
  useEffect(() => {
    if (beneficiary) {
      // Extract country code from phone number if present
      let extractedCountryCode = '+1'; // Default
      let phoneNumber = beneficiary.phoneNumber || '';

      if (beneficiary.phoneNumber) {
        // Simple extraction logic - adjust based on your data format
        const match = beneficiary.phoneNumber.match(/^(\+\d+)/);
        if (match) {
          extractedCountryCode = match[1];
          phoneNumber = beneficiary.phoneNumber
            .replace(extractedCountryCode, '')
            .trim();
        }
      }

      setCountryCode(extractedCountryCode);

      // Reset form with beneficiary data
      methods.reset({
        fullName: beneficiary.fullName || '',
        relationship: beneficiary.relationship || '',
        email: beneficiary.email || '',
        phoneNumber: phoneNumber,
        address: beneficiary.address || '',
        city: beneficiary.city || '',
        state: beneficiary.state || '',
        pincode: beneficiary.pincode || '',
        country: beneficiary.country || '',
        bankCountry: beneficiary.bankCountry || '',
        currency: beneficiary.currency || '',
        accountNumber: beneficiary.accountNumber || '',
        accountType: beneficiary.accountType || '',
        SWIFTBIC: beneficiary.SWIFTBIC || '',
        IFSC: beneficiary.IFSC || '',
        bankName: beneficiary.bankName || '',
        branchName: beneficiary.branchName || '',
      });
    }
  }, [beneficiary, methods]);

  const onSubmit = (data: BeneficiaryFormData) => {
    if (!id) return;

    updateMutation.mutate(
      {
        id,
        data: {
          ...data,
          phoneNumber: data.phoneNumber, // keep plain number
          countryCode: countryCode, // send separately ✅
        },
      },
      {
        onSuccess: () => {
          navigate({to: '/wallet/paymentdashboard'});
        },
      },
    );
  };

  const onError = (errors: any) => {
    console.log('Form errors:', errors);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="font-sans relative mx-auto flex h-full min-h-screen w-full max-w-md flex-col items-center justify-center bg-white shadow-xl dark:bg-[#1e1e1e] md:max-w-2xl">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-gray-600 mt-4">Loading beneficiary data...</p>
      </div>
    );
  }

  // Error state
  if (isError || !beneficiary) {
    return (
      <div className="font-sans relative mx-auto flex h-full min-h-screen w-full max-w-md flex-col bg-white shadow-xl dark:bg-[#1e1e1e] md:max-w-2xl">
        <div className="border-gray-100 dark:border-gray-800 sticky top-0 z-30 flex items-center justify-between border-b bg-white/95 px-4 pb-2 pt-4 backdrop-blur-sm dark:bg-[#1e1e1e]/95">
          <button
            className="text-text-main hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center rounded-full p-2 transition-colors dark:text-white"
            aria-label="Go back"
            onClick={() => navigate({to: '/wallet/paymentdashbord'})}
          >
            <MdArrowBack size={24} />
          </button>
          <h1 className="text-text-main flex-1 pr-10 text-center text-lg font-bold leading-tight tracking-tight dark:text-white">
            Update Beneficiary
          </h1>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center p-8">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-10 w-10 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-gray-800 mb-2 text-lg font-medium">
            Beneficiary Not Found
          </h3>
          <p className="text-gray-600 mb-6 text-center">
            The beneficiary you're trying to update doesn't exist or you don't
            have permission to view it.
          </p>
          <button
            onClick={() => navigate({to: '/wallet/paymentdashboard'})}
            className="rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary/90"
          >
            Back to Recipients
          </button>
        </div>
      </div>
    );
  }

  const relationshipOptions = [
    {value: '', label: 'Select relationship...'},
    {value: 'family', label: 'Family Member'},
    {value: 'friend', label: 'Friend'},
    {value: 'vendor', label: 'Vendor / Supplier'},
    {value: 'self', label: 'Self (Own Account)'},
  ];

  const countryOptions = [
    {value: 'us', label: 'United States'},
    {value: 'uk', label: 'United Kingdom'},
    {value: 'ca', label: 'Canada'},
    {value: 'fr', label: 'France'},
    {value: 'de', label: 'Germany'},
  ];

  const bankCountryOptions = [
    {value: 'us', label: 'United States'},
    {value: 'uk', label: 'United Kingdom'},
    {value: 'fr', label: 'France'},
    {value: 'de', label: 'Germany'},
  ];

  const currencyOptions = [
    {value: 'usd', label: 'USD'},
    {value: 'eur', label: 'EUR'},
    {value: 'gbp', label: 'GBP'},
  ];

  const accountTypeOptions = [
    {value: 'checking', label: 'Checking / Current'},
    {value: 'savings', label: 'Savings'},
  ];

  const countryCodeOptions = [
    {value: '+91', label: '🇮🇳 +91 (India)'},
    {value: '+1', label: '🇺🇸 +1 (USA)'},
    {value: '+44', label: '🇬🇧 +44 (UK)'},
    {value: '+61', label: '🇦🇺 +61 (Australia)'},
    {value: '+81', label: '🇯🇵 +81 (Japan)'},
    {value: '+86', label: '🇨🇳 +86 (China)'},
    {value: '+971', label: '🇦🇪 +971 (UAE)'},
    {value: '+966', label: '🇸🇦 +966 (Saudi Arabia)'},
    {value: '+49', label: '🇩🇪 +49 (Germany)'},
    {value: '+33', label: '🇫🇷 +33 (France)'},
  ];

  return (
    <div className="font-sans relative mx-auto flex h-full min-h-screen w-full max-w-md flex-col bg-white shadow-xl dark:bg-[#1e1e1e] md:max-w-2xl">
      <div className="border-gray-100 dark:border-gray-800 sticky top-0 z-30 flex items-center justify-between border-b bg-white/95 px-4 pb-2 pt-4 backdrop-blur-sm dark:bg-[#1e1e1e]/95">
        <button
          className="text-text-main hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center rounded-full p-2 transition-colors dark:text-white"
          aria-label="Go back"
          onClick={() => navigate({to: '/wallet/paymentdashbord'})}
        >
          <MdArrowBack size={24} />
        </button>
        <h1 className="text-text-main flex-1 pr-10 text-center text-lg font-bold leading-tight tracking-tight dark:text-white">
          Update Beneficiary
        </h1>
      </div>

      {/* <ProgressBar step={1} total={3} label="Update Beneficiary Details" /> */}

      <main className="flex-1 px-5 pb-10 pt-2 md:px-10">
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit, onError)}
            className="space-y-6"
          >
            <SectionHeader title="Identity Details" />

            <div className="space-y-5">
              <GenericInputField
                name="fullName"
                label="Full Legal Name"
                placeholder="e.g. Sarah J. Connor"
                required
              />

              <GenericDropdown
                name="relationship"
                label="Relationship"
                options={relationshipOptions}
                required
              />

              <GenericInputField
                name="email"
                label="Email Address"
                placeholder="sarah@example.com"
                type="email"
                required
              />

              <div className="space-y-1.5">
                <div className="flex gap-3 md:gap-5">
                  {/* Country Code */}
                  <div className="w-28 space-y-1.5">
                    <label className="mb-2 mt-1 block text-sm font-medium text-slate-700 dark:text-slate-400">
                      Country code <span className="text-red-500">*</span>
                    </label>

                    <select
                      id="countryCode"
                      className="h-[42px] w-full rounded-md border border-stroke bg-transparent px-3 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                    >
                      {countryCodeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Phone Number */}
                  <div className="flex-1 space-y-1.5">
                    <GenericInputField
                      name="phoneNumber"
                      label="Phone No"
                      placeholder="5550123"
                      type="tel"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <Divider />

            <SectionHeader title="Address Details" />

            <div className="space-y-5">
              <GenericInputField
                name="address"
                label="Address"
                placeholder="Street, P.O. Box, Company Name"
                required
              />

              <GenericInputField
                name="city"
                label="City"
                placeholder="City"
                required
              />

              <div className="flex gap-4 md:gap-6">
                <GenericInputField
                  name="state"
                  label="State"
                  placeholder="State"
                  required
                />
                <div className="w-1/3">
                  <GenericInputField
                    name="pincode"
                    label="Pincode"
                    placeholder="12345"
                    required
                  />
                </div>
              </div>

              <GenericDropdown
                name="country"
                label="Country"
                options={countryOptions}
                required
              />
            </div>

            <Divider />

            <SectionHeader title="Bank Details" />

            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="flex-1">
                  <GenericDropdown
                    name="bankCountry"
                    label="Bank Country"
                    options={bankCountryOptions}
                    required
                  />
                </div>
                <div className="w-1/3">
                  <GenericDropdown
                    name="currency"
                    label="Currency"
                    options={currencyOptions}
                    required
                  />
                </div>
              </div>

              <GenericInputField
                name="accountNumber"
                label="Account"
                placeholder="CH93 0000 0000 0000 0000 0"
                required
              />

              <GenericDropdown
                name="accountType"
                label="Account Type"
                options={accountTypeOptions}
                required
              />

              <div className="flex gap-4">
                <div className="flex-1">
                  <GenericInputField
                    name="SWIFTBIC"
                    label="SWIFT / BIC"
                    placeholder="AAAA BB CC 123"
                    required
                  />
                </div>
                <div className="flex-1">
                  <GenericInputField
                    name="IFSC"
                    label="IFSC"
                    placeholder="000000000"
                    required
                  />
                </div>
              </div>

              <GenericInputField
                name="bankName"
                label="Bank Name"
                placeholder="e.g. Chase Bank"
                required
              />

              <GenericInputField
                name="branchName"
                label="Branch Name"
                placeholder="e.g. Downtown Branch"
                required
              />
            </div>

            {/* Submit Button Inside Form */}
            <div className="safe-area-bottom border-gray-100 dark:border-gray-800 z-20 mx-auto w-full max-w-md border-t bg-white/90 p-2 backdrop-blur-md dark:bg-[#1e1e1e]/90 md:max-w-2xl">
              <button
                type="submit"
                className="hover:bg-primary-800 group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary/80 px-3 font-bold text-white shadow-lg shadow-primary/5 transition-all active:scale-[0.98]"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span>Update Beneficiary</span>
                )}
              </button>
            </div>
          </form>
        </FormProvider>
      </main>
    </div>
  );
};

export default UpdateBeneficiary;
