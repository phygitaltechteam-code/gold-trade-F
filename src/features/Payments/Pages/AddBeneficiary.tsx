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
import {useAddBeneficiary} from '@/lib/react-query/beneficiary';

const AddBeneficiary: React.FC = () => {
  const {mutateAsync: addBeneficiary} = useAddBeneficiary();
  const naviagte = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    relationship: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'us',
    countryCode: 'us',
    bankCountry: 'us',
    currency: 'usd',
    accountNumber: '',
    accountType: 'checking',
    SWIFTBIC: '',
    IFSC: '',
    bankName: '',
    branchName: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const {id, value} = e.target;
    setFormData((prev) => ({...prev, [id]: value}));
  };

  const submit = () => {
    addBeneficiary({
      accountType: formData.accountType,
      address: formData.address,
      bankCountry: formData.bankCountry,
      bankName: formData.bankName,
      branchName: formData.branchName,
      city: formData.city,
      country: formData.country,
      currency: formData.currency,
      email: formData.email,
      fullName: formData.fullName,
      accountNumber: formData.accountNumber,
      phoneNumber: formData.phoneNumber,
      relationship: formData.relationship,
      IFSC: formData.IFSC,
      SWIFTBIC: formData.SWIFTBIC,
      state: formData.state,
      pincode: formData.pincode,
      countryCode: formData.countryCode,
    });
  };
  return (
    <div className="font-sans relative mx-auto flex h-full min-h-screen w-full max-w-md flex-col bg-white shadow-xl dark:bg-[#1e1e1e]">
      {/* --- Sticky Header --- */}
      <div className="border-gray-100 dark:border-gray-800 sticky top-0 z-30 flex items-center justify-between border-b bg-white/95 px-4 pb-2 pt-4 backdrop-blur-sm dark:bg-[#1e1e1e]/95">
        <button
          className="hover:bg-gray-100 dark:hover:bg-gray-800 text-text-main flex items-center justify-center rounded-full p-2 transition-colors dark:text-white"
          aria-label="Go back"
          // onClick={() => naviagte({to: '/paymentdashbord'})}
        >
          <MdArrowBack size={24} />
        </button>
        <h1 className="text-text-main flex-1 pr-10 text-center text-lg font-bold leading-tight tracking-tight dark:text-white">
          Add Beneficiary
        </h1>
      </div>

      <ProgressBar step={1} total={3} label="Beneficiary Details" />

      <main className="flex-1 px-5 pb-10 pt-2">
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

          <SelectField
            id="countryCode"
            label="countryCode"
            leftIcon={<MdPublic size={20} />}
            value={formData.countryCode}
            onChange={handleChange}
            options={[
              {value: 'uk', label: '🇬🇧 +44'},
              {value: 'us', label: '🇺🇸 +1'},
              {value: 'fr', label: '🇫🇷 +33'},
              {value: 'de', label: '🇩🇪 +49'},
            ]}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">
              Mobile Number
            </label>
            <div className="flex gap-3">
              {/* <MobilePrefixSelect /> */}
              <input
                id="phoneNumber"
                type="tel"
                placeholder="555-0123"
                value={formData.phoneNumber}
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
            id="address"
            label="Address Line 1"
            placeholder="Street, P.O. Box, Company Name"
            value={formData.address}
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
                id="pincode"
                label="ZIP"
                placeholder="12345"
                value={formData.pincode}
                onChange={handleChange}
              />
            </div>
          </div>

          <SelectField
            id="country"
            label="country"
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
            id="accountNumber"
            label="Account / IBAN"
            placeholder="CH93 0000 0000 0000 0000 0"
            className="font-mono tracking-wide"
            value={formData.accountNumber}
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
                id="SWIFTBIC"
                label="SWIFT / BIC"
                placeholder="AAAA BB CC 123"
                className="uppercase"
                value={formData.SWIFTBIC}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1">
              <InputField
                id="IFSC"
                label="Routing / IFSC"
                placeholder="000000000"
                value={formData.IFSC}
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
          // onClick={() => naviagte({to: '/beneficiarypending'})}
          onClick={() => submit()}
        >
          <span>Continue</span>
          <MdArrowForward className="text-lg transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};
export default AddBeneficiary;

// import React from 'react';
// import { MdArrowBack, MdArrowForward } from 'react-icons/md';
// import { useNavigate } from '@tanstack/react-router';
// import { beneficiarySchema } from '../beneficiarySchema';
// import { BeneficiaryFormData } from '../types';
// import { FormProvider, useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import GenericInputField from '@/components/Forms/Input/GenericInputField';
// import GenericDropdown from '@/components/Forms/DropDown/GenericDropDown';
// import {
//   SectionHeader,
//   ProgressBar,
//   Divider,
//   MobilePrefixSelect,
// } from '../Components/BenifeciaryFormComponents';

// const AddBeneficiary: React.FC = () => {
//   const navigate = useNavigate();

//   // Proper form initialization
//   const methods = useForm<BeneficiaryFormData>({
//     resolver: zodResolver(beneficiarySchema),
//     defaultValues: {
//       // Add initial values if editing existing beneficiary
//     },
//     mode: "onChange", // Validates on each change
//   });

//   // Proper submit handler
//   const onSubmit = (data: BeneficiaryFormData) => {
//     console.log('Valid form data:', data);
//     // Handle form submission here
//     // navigate({ to: '/next-step' });
//   };

//   // Error handler
//   const onError = (errors: any) => {
//     console.log('Form errors:', errors);
//     // You can scroll to first error here
//   };

//   const relationshipOptions = [
//     { value: '', label: 'Select relationship...' },
//     { value: 'family', label: 'Family Member' },
//     { value: 'friend', label: 'Friend' },
//     { value: 'vendor', label: 'Vendor / Supplier' },
//     { value: 'self', label: 'Self (Own Account)' },
//   ];

//   const countryOptions = [
//     { value: 'us', label: 'United States' },
//     { value: 'uk', label: 'United Kingdom' },
//     { value: 'ca', label: 'Canada' },
//     { value: 'fr', label: 'France' },
//     { value: 'de', label: 'Germany' },
//   ];

//   const bankCountryOptions = [
//     { value: 'us', label: 'United States' },
//     { value: 'uk', label: 'United Kingdom' },
//     { value: 'fr', label: 'France' },
//     { value: 'de', label: 'Germany' },
//   ];

//   const currencyOptions = [
//     { value: 'usd', label: 'USD' },
//     { value: 'eur', label: 'EUR' },
//     { value: 'gbp', label: 'GBP' },
//   ];

//   const accountTypeOptions = [
//     { value: 'checking', label: 'Checking / Current' },
//     { value: 'savings', label: 'Savings' },
//   ];

//   return (
//     <div className="font-sans relative mx-auto flex h-full min-h-screen w-full max-w-md flex-col bg-white shadow-xl dark:bg-[#1e1e1e]">
//       {/* --- Sticky Header --- */}
//       <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white/95 px-4 pb-2 pt-4 backdrop-blur-sm dark:border-gray-800 dark:bg-[#1e1e1e]/95">
//         <button
//           className="flex items-center justify-center rounded-full p-2 text-text-main transition-colors hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800"
//           aria-label="Go back"
//           // onClick={() => navigate({ to: '/paymentdashboard' })}
//         >
//           <MdArrowBack size={24} />
//         </button>
//         <h1 className="flex-1 pr-10 text-center text-lg font-bold leading-tight tracking-tight text-text-main dark:text-white">
//           Add Beneficiary
//         </h1>
//       </div>

//       <ProgressBar step={1} total={3} label="Beneficiary Details" />

//       <main className="flex-1 px-5 pb-10 pt-2">
//         <FormProvider {...methods}>
//           <form
//             onSubmit={methods.handleSubmit(onSubmit, onError)}
//             className="space-y-6"
//           >
//             <SectionHeader title="Identity Details" />

//             <div className="space-y-5">
//               <GenericInputField
//                 name="fullName"
//                 label="Full Legal Name"
//                 placeholder="e.g. Sarah J. Connor"
//                 required
//               />

//               <GenericDropdown
//                 name="relationship"
//                 label="Relationship"
//                 options={relationshipOptions}
//                 required
//               />

//               <GenericInputField
//                 name="email"
//                 label="Email Address"
//                 placeholder="sarah@example.com"
//                 type="email"
//                 required
//               />

//               <div className="space-y-1.5">
//                 <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">
//                   Mobile Number
//                   <span className="ml-1 text-red-500">*</span>
//                 </label>
//                 <div className="flex gap-3">
//                   <MobilePrefixSelect />
//                   <GenericInputField
//                     name="mobile"
//                     placeholder="555-0123"
//                     type="tel"
//                     required
//                   />
//                 </div>
//               </div>
//             </div>

//             <Divider />

//             <SectionHeader title="Address Details" />

//             <div className="space-y-5">
//               <GenericInputField
//                 name="address1"
//                 label="Address Line 1"
//                 placeholder="Street, P.O. Box, Company Name"
//                 required
//               />

//               <GenericInputField
//                 name="city"
//                 label="City"
//                 placeholder="City"
//                 required
//               />

//               <div className="flex gap-4">
//                 <GenericInputField
//                   name="state"
//                   label="State / Prov."
//                   placeholder="State"
//                   required
//                 />
//                 <div className="w-1/3">
//                   <GenericInputField
//                     name="zip"
//                     label="ZIP"
//                     placeholder="12345"
//                     required
//                   />
//                 </div>
//               </div>

//               <GenericDropdown
//                 name="country"
//                 label="Country"
//                 options={countryOptions}
//                 required
//               />
//             </div>

//             <Divider />

//             <SectionHeader title="Bank Details" />

//             <div className="space-y-5">
//               <div className="flex gap-4">
//                 <div className="flex-1">
//                   <GenericDropdown
//                     name="bankCountry"
//                     label="Bank Country"
//                     options={bankCountryOptions}
//                     required
//                   />
//                 </div>
//                 <div className="w-1/3">
//                   <GenericDropdown
//                     name="currency"
//                     label="Currency"
//                     options={currencyOptions}
//                     required
//                   />
//                 </div>
//               </div>

//               <GenericInputField
//                 name="iban"
//                 label="Account / IBAN"
//                 placeholder="CH93 0000 0000 0000 0000 0"
//                 required
//               />

//               <GenericDropdown
//                 name="accountType"
//                 label="Account Type"
//                 options={accountTypeOptions}
//                 required
//               />

//               <div className="flex gap-4">
//                 <div className="flex-1">
//                   <GenericInputField
//                     name="swift"
//                     label="SWIFT / BIC"
//                     placeholder="AAAA BB CC 123"
//                     required
//                   />
//                 </div>
//                 <div className="flex-1">
//                   <GenericInputField
//                     name="routing"
//                     label="Routing / IFSC"
//                     placeholder="000000000"
//                     required
//                   />
//                 </div>
//               </div>

//               <GenericInputField
//                 name="bankName"
//                 label="Bank Name"
//                 placeholder="e.g. Chase Bank"
//                 required
//               />

//               <GenericInputField
//                 name="branchName"
//                 label="Branch Name"
//                 placeholder="e.g. Downtown Branch"
//                 required
//               />
//             </div>

//             {/* Submit Button Inside Form */}
//             <div className="safe-area-bottom z-20 mx-auto w-full max-w-md border-t border-gray-100 bg-white/90 p-2 backdrop-blur-md dark:border-gray-800 dark:bg-[#1e1e1e]/90">
//               <button
//                 type="submit"
//                 className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary/80 px-3 font-bold text-white shadow-lg shadow-primary/5 transition-all hover:bg-primary-800 active:scale-[0.98]"
//               >
//                 <span>Continue</span>
//                 <MdArrowForward className="text-lg transition-transform group-hover:translate-x-1" />
//               </button>
//             </div>
//           </form>
//         </FormProvider>
//       </main>
//     </div>
//   );
// };

// export default AddBeneficiary;
