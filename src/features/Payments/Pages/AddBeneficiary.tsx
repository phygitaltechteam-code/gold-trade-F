/*eslint-disable*/
import React, {useState, useEffect} from 'react';
import {MdArrowBack, MdArrowForward, MdOutlineLoop} from 'react-icons/md';
import {useNavigate} from '@tanstack/react-router';
import {beneficiarySchema} from '../beneficiarySchema';
import {BeneficiaryFormData} from '../types';
import {FormProvider, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import GenericInputField from '@/components/Forms/Input/GenericInputField';
import GenericDropdown from '@/components/Forms/DropDown/GenericDropDown';
import {SectionHeader, Divider} from '../Components/BenifeciaryFormComponents';
import {useAddBeneficiary} from '@/lib/react-query/beneficiary';

const AddBeneficiary: React.FC = () => {
  const navigate = useNavigate();
  const {mutateAsync: addBeneficiary} = useAddBeneficiary();
  const [countryCode, setCountryCode] = useState('+91'); // default India
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);

  const methods = useForm<BeneficiaryFormData>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {
      country: 'IN', // Default country India
    },
    mode: 'onChange',
  });

  const {
    watch,
    setValue,
    formState: {errors},
  } = methods;
  const watchedPincode = watch('pincode');
  const watchedCountry = watch('country');

  // Lookup Indian PIN code
  useEffect(() => {
    if (watchedCountry === 'IN' && watchedPincode?.length === 6) {
      const handler = setTimeout(() => {
        lookupPincode(watchedPincode);
      }, 500);
      return () => clearTimeout(handler);
    }
  }, [watchedPincode, watchedCountry]);

  const lookupPincode = async (pincode: string) => {
    setIsLoadingPincode(true);
    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`,
      );
      if (response.ok) {
        const data = await response.json();
        if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
          const first = data[0].PostOffice[0];
          // Set city to post office name (locality/block) instead of district
          setValue('city', first.Block || '', {shouldValidate: true});
          setValue('state', first.State || '', {shouldValidate: true});
        }
      }
    } catch (error) {
      console.error('Pincode lookup failed:', error);
    } finally {
      setIsLoadingPincode(false);
    }
  };

  const onSubmit = (data: BeneficiaryFormData) => {
    const payload = {
      ...data,
      countryCode, // include selected phone country code
    };
    console.log('Valid form data:', payload);

    addBeneficiary(payload, {
      onSuccess: () => {
        navigate({to: '/wallet/paymentdashbord'});
      },
    });
  };

  const onError = (errors: any) => {
    console.log('Form errors:', errors);
  };

  const relationshipOptions = [
    {value: 'family', label: 'Family Member'},
    {value: 'friend', label: 'Friend'},
    {value: 'vendor', label: 'Vendor / Supplier'},
    {value: 'self', label: 'Self (Own Account)'},
  ];

  const countryOptions = [
    {value: 'IN', label: 'India'},
    {value: 'us', label: 'United States'},
    {value: 'uk', label: 'United Kingdom'},
    {value: 'ca', label: 'Canada'},
    {value: 'fr', label: 'France'},
    {value: 'de', label: 'Germany'},
  ];

  const bankCountryOptions = [
    {value: 'IN', label: 'India'},
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
    <div className="relative mx-auto flex h-screen w-full flex-col bg-white shadow-xl dark:bg-[#1e1e1e]">
      {/* Header */}
      <div className="border-gray-100 dark:border-gray-800 sticky top-0 z-30 flex items-center justify-between border-b bg-white/95 px-4 pb-2 pt-4 backdrop-blur-sm dark:bg-[#1e1e1e]/95">
        <button
          className="text-text-main hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center rounded-full p-2 transition-colors dark:text-white"
          aria-label="Go back"
          onClick={() => navigate({to: '/wallet/paymentdashbord'})}
        >
          <MdArrowBack size={24} />
        </button>
        <h1 className="text-text-main flex-1 pr-10 text-center text-lg font-bold leading-tight tracking-tight dark:text-white">
          Add Beneficiary
        </h1>
      </div>

      {/* Main Form */}
      <main className="flex-1 overflow-y-auto px-5 pb-24 pt-2 md:px-10">
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit, onError)}
            className="space-y-6"
          >
            {/* Identity Details */}
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

              {/* Phone with country code */}
              <div className="flex flex-col gap-3 md:flex-row md:gap-4">
                <div className="md:w-1/3">
                  <GenericDropdown
                    name="phoneCountryCode"
                    label="Country Code"
                    options={countryCodeOptions}
                    value={countryCode}
                    onChange={(val) => setCountryCode(val)}
                    required
                  />
                </div>
                <div className="flex-1">
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

            <Divider />

            {/* Address Details */}
            <SectionHeader title="Address Details" />
            <div className="space-y-5">
              <GenericInputField
                name="address"
                label="Address"
                placeholder="Street, P.O. Box, Company Name"
                required
              />

              {/* Custom Pincode field with spinner */}
              <div className="flex-1 space-y-1.5 md:w-1/3 md:flex-none">
                <label className="mb-2 mt-1 block text-sm font-medium text-slate-700 dark:text-slate-400">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    {...methods.register('pincode')}
                    className={`h-[42px] w-full rounded-md border border-stroke bg-transparent px-3 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white ${
                      errors.pincode ? 'border-red-500' : ''
                    }`}
                    placeholder="12345"
                    type="text"
                  />
                  {isLoadingPincode && (
                    <MdOutlineLoop
                      className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-primary"
                      size={18}
                    />
                  )}
                </div>
                {errors.pincode && (
                  <p className="text-xs text-red-500">
                    {errors.pincode.message}
                  </p>
                )}
                {watchedCountry === 'IN' &&
                  watchedPincode?.length === 6 &&
                  !isLoadingPincode && (
                    <p className="mt-1 text-xs text-primary">
                      <span className="material-symbols-outlined mr-1 align-middle text-[12px]">
                        auto_awesome
                      </span>
                      City/State will auto-fill for Indian PIN codes
                    </p>
                  )}
              </div>

              <GenericInputField
                name="city"
                label="City / Locality"
                placeholder="City"
                required
              />

              {/* State, Pincode, Country row */}
              <div className="flex flex-col gap-4 md:flex-row md:gap-6">
                <div className="flex-1">
                  <GenericInputField
                    name="state"
                    label="State"
                    placeholder="State"
                    required
                  />
                </div>

                <div className="flex-1">
                  <GenericDropdown
                    name="country"
                    label="Country"
                    options={countryOptions}
                    required
                  />
                </div>
              </div>
            </div>

            <Divider />

            {/* Bank Details */}
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
                {/* <div className="flex-1">
                  <GenericInputField
                    name="SWIFTBIC"
                    label="SWIFT / BIC"
                    placeholder="AAAA BB CC 123"
                    required
                  />
                </div> */}
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

            {/* Submit Button */}
            <div className="safe-area-bottom border-gray-100 dark:border-gray-800 z-20 mx-auto w-full max-w-md border-t bg-white/90 p-2 backdrop-blur-md dark:bg-[#1e1e1e]/90 md:max-w-2xl">
              <button
                type="submit"
                className="hover:bg-primary-800 group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary/80 px-3 font-bold text-white shadow-lg shadow-primary/5 transition-all active:scale-[0.98]"
              >
                <span>Continue</span>
                <MdArrowForward className="text-lg transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </form>
        </FormProvider>
      </main>
    </div>
  );
};

export default AddBeneficiary;
