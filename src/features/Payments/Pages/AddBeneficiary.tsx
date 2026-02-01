import React, {useState} from 'react';
import {
  MdArrowBack,
  MdArrowForward,
  MdPublic,
  MdAccountBalance,
} from 'react-icons/md';
import {
  SectionHeader,
  InputField,
  SelectField,
  MobilePrefixSelect,
  ProgressBar,
  Divider,
} from '../Components/BenifeciaryFormComponents';
import {useNavigate} from '@tanstack/react-router';

const AddBeneficiary: React.FC = () => {
  const naviagte = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    relationship: '',
    email: '',
    mobile: '',
    address1: '',
    city: '',
    state: '',
    zip: '',
    country: 'us',
    bankCountry: 'us',
    currency: 'usd',
    iban: '',
    accountType: 'checking',
    swift: '',
    routing: '',
    bankName: '',
    branchName: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const {id, value} = e.target;
    setFormData((prev) => ({...prev, [id]: value}));
  };

  return (
    <div className="font-sans relative mx-auto flex h-full min-h-screen w-full max-w-md flex-col bg-white shadow-xl dark:bg-[#1e1e1e]">
      {/* --- Sticky Header --- */}
      <div className="border-gray-100 dark:border-gray-800 sticky top-0 z-30 flex items-center justify-between border-b bg-white/95 px-4 pb-2 pt-4 backdrop-blur-sm dark:bg-[#1e1e1e]/95">
        <button
          className="hover:bg-gray-100 dark:hover:bg-gray-800 text-text-main flex items-center justify-center rounded-full p-2 transition-colors dark:text-white"
          aria-label="Go back"
          onClick={() => naviagte({to: '/paymentdashbord'})}
        >
          <MdArrowBack size={24} />
        </button>
        <h1 className="text-text-main flex-1 pr-10 text-center text-lg font-bold leading-tight tracking-tight dark:text-white">
          Add Beneficiary
        </h1>
      </div>

      {/* --- Progress Indicator --- */}
      <ProgressBar step={1} total={3} label="Beneficiary Details" />

      {/* --- Main Scrollable Content --- */}
      <main className="flex-1 px-5 pb-10 pt-2">
        {/* IDENTITY DETAILS */}
        <SectionHeader title="Identity Details" />

        <div className="space-y-5">
          <InputField
            id="fullName"
            label="Full Legal Name"
            placeholder="e.g. Sarah J. Connor"
            value={formData.fullName}
            onChange={handleChange}
          />

          <SelectField
            id="relationship"
            label="Relationship"
            value={formData.relationship}
            onChange={handleChange}
            options={[
              {value: '', label: 'Select relationship...'},
              {value: 'family', label: 'Family Member'},
              {value: 'friend', label: 'Friend'},
              {value: 'vendor', label: 'Vendor / Supplier'},
              {value: 'self', label: 'Self (Own Account)'},
            ]}
          />

          <InputField
            id="email"
            type="email"
            label="Email Address"
            placeholder="sarah@example.com"
            value={formData.email}
            onChange={handleChange}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">
              Mobile Number
            </label>
            <div className="flex gap-3">
              <MobilePrefixSelect />
              <input
                id="mobile"
                type="tel"
                placeholder="555-0123"
                value={formData.mobile}
                onChange={handleChange}
                className="bg-gray-50 dark:bg-gray-800 ring-gray-200 dark:ring-gray-700 dark:focus:bg-gray-900 text-text-main placeholder-gray-400 h-12 flex-1 rounded-xl border-none px-4 outline-none ring-1 transition-all focus:bg-white focus:ring-2 focus:ring-primary dark:text-white"
              />
            </div>
          </div>
        </div>

        <Divider />

        {/* ADDRESS DETAILS */}
        <SectionHeader title="Address Details" />

        <div className="space-y-5">
          <InputField
            id="address1"
            label="Address Line 1"
            placeholder="Street, P.O. Box, Company Name"
            value={formData.address1}
            onChange={handleChange}
          />

          <InputField
            id="city"
            label="City"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
          />

          <div className="flex gap-4">
            <InputField
              id="state"
              className="flex-1"
              label="State / Prov."
              placeholder="State"
              value={formData.state}
              onChange={handleChange}
            />
            <div className="w-1/3">
              <InputField
                id="zip"
                label="ZIP"
                placeholder="12345"
                value={formData.zip}
                onChange={handleChange}
              />
            </div>
          </div>

          <SelectField
            id="country"
            label="Country"
            leftIcon={<MdPublic size={20} />}
            value={formData.country}
            onChange={handleChange}
            options={[
              {value: 'us', label: 'United States'},
              {value: 'uk', label: 'United Kingdom'},
              {value: 'ca', label: 'Canada'},
              {value: 'fr', label: 'France'},
              {value: 'de', label: 'Germany'},
            ]}
          />
        </div>

        <Divider />

        {/* BANK DETAILS */}
        <SectionHeader title="Bank Details" />

        <div className="space-y-5">
          <div className="flex gap-4">
            <div className="flex-1">
              <SelectField
                id="bankCountry"
                label="Bank Country"
                leftIcon={<MdAccountBalance size={20} />}
                value={formData.bankCountry}
                onChange={handleChange}
                options={[
                  {value: 'us', label: 'United States'},
                  {value: 'uk', label: 'United Kingdom'},
                  {value: 'fr', label: 'France'},
                  {value: 'de', label: 'Germany'},
                ]}
              />
            </div>
            <div className="w-1/3">
              <SelectField
                id="currency"
                label="Currency"
                value={formData.currency}
                onChange={handleChange}
                options={[
                  {value: 'usd', label: 'USD'},
                  {value: 'eur', label: 'EUR'},
                  {value: 'gbp', label: 'GBP'},
                ]}
              />
            </div>
          </div>

          <InputField
            id="iban"
            label="Account / IBAN"
            placeholder="CH93 0000 0000 0000 0000 0"
            className="font-mono tracking-wide"
            value={formData.iban}
            onChange={handleChange}
          />

          <SelectField
            id="accountType"
            label="Account Type"
            value={formData.accountType}
            onChange={handleChange}
            options={[
              {value: 'checking', label: 'Checking / Current'},
              {value: 'savings', label: 'Savings'},
            ]}
          />

          <div className="flex gap-4">
            <div className="flex-1">
              <InputField
                id="swift"
                label="SWIFT / BIC"
                placeholder="AAAA BB CC 123"
                className="uppercase"
                value={formData.swift}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1">
              <InputField
                id="routing"
                label="Routing / IFSC"
                placeholder="000000000"
                value={formData.routing}
                onChange={handleChange}
              />
            </div>
          </div>

          <InputField
            id="bankName"
            label="Bank Name"
            placeholder="e.g. Chase Bank"
            value={formData.bankName}
            onChange={handleChange}
          />

          <InputField
            id="branchName"
            label="Branch Name"
            placeholder="e.g. Downtown Branch"
            value={formData.branchName}
            onChange={handleChange}
          />
        </div>
      </main>

      {/* --- Sticky Footer --- */}
      <div className="border-gray-100 dark:border-gray-800 safe-area-bottom z-20 mx-auto w-full max-w-md border-t bg-white/90 p-2 backdrop-blur-md dark:bg-[#1e1e1e]/90">
        <button
          className="hover:bg-primary-800 group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary/80 px-3 font-bold text-white shadow-lg shadow-primary/5 transition-all active:scale-[0.98]"
          onClick={() => naviagte({to: '/beneficiarypending'})}
        >
          <span>Continue</span>
          <MdArrowForward className="text-lg transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default AddBeneficiary;
