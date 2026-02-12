/*eslint-disable*/
import React, {useState} from 'react';
import {MdArrowBack, MdArrowForward} from 'react-icons/md';
import {useNavigate} from '@tanstack/react-router';
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
import {useAddBeneficiary} from '@/lib/react-query/beneficiary';

const AddBeneficiary: React.FC = () => {
  const navigate = useNavigate();
  const {mutateAsync: addBeneficiary} = useAddBeneficiary();
  const [countryCode, setContryCode] = useState('');

  const methods = useForm<BeneficiaryFormData>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {},
    mode: 'onChange',
  });

  const onSubmit = (data: BeneficiaryFormData) => {
    const payload = {
      ...data,
      countryCode,
    };

    console.log('Valid form data:', payload);

    addBeneficiary(payload, {
      onSuccess: () => {
        navigate({to: '/beneficiary/statuspending'});
      },
    });
  };

  const onError = (errors: any) => {
    console.log('Form errors:', errors);
  };

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

  const contryCode = [
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

      {/* <ProgressBar step={1} total={3} label="Beneficiary Details" /> */}

      <main className="flex-1 overflow-y-auto px-5 pb-24 pt-2 md:px-10">
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
                      onChange={(e) => setContryCode(e.target.value)}
                    >
                      <option value="">Code</option>

                      {contryCode.map((option) => (
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
