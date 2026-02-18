/*eslint-disable*/
import React, {useState, useEffect, useCallback} from 'react';
import {MdArrowBack, MdArrowForward} from 'react-icons/md';
import {useNavigate} from '@tanstack/react-router';
import {beneficiarySchema} from '../beneficiarySchema';
import {BeneficiaryFormData} from '../types';
import {FormProvider, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import GenericInputField from '@/components/Forms/Input/GenericInputField';
import GenericDropdown from '@/components/Forms/DropDown/GenericDropDown';
import {SectionHeader, Divider} from '../Components/BenifeciaryFormComponents';
import {useAddBeneficiary} from '@/lib/react-query/beneficiary';

// Type for Indian PIN code API response
interface PinCodeResponse {
  Message: string;
  Status: string;
  PostOffice: Array<{
    Name: string;
    District: string;
    State: string;
    Country: string;
    Pincode: string;
  }>;
}

const AddBeneficiary: React.FC = () => {
  const navigate = useNavigate();
  const {mutateAsync: addBeneficiary} = useAddBeneficiary();
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  const methods = useForm<BeneficiaryFormData>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {},
    mode: 'onChange',
  });

  // Watch pincode and country for hints
  const pincode = methods.watch('pincode');
  const country = methods.watch('country');

  // DEBUG: log when pincode or country changes
  useEffect(() => {
    console.log('Pincode changed:', pincode, 'Country:', country);
  }, [pincode, country]);

  // Debounced address fetch – now triggered by pincode alone
  useEffect(() => {
    if (!pincode || pincode.length < 3) return;

    const handler = setTimeout(() => {
      console.log('Triggering fetch for pincode:', pincode);
      fetchAddressFromPincode(pincode);
    }, 500);

    return () => clearTimeout(handler);
  }, [pincode]); // Removed country dependency

  const fetchAddressFromPincode = async (pincode: string) => {
    // If country is already selected, only try that country's API
    if (country === 'in') {
      await fetchIndianPincode(pincode);
    } else if (country === 'us') {
      await fetchUSZip(pincode);
    } else {
      // No country selected – try to guess by pincode length
      if (pincode.length === 6) {
        // Try India first
        const success = await fetchIndianPincode(pincode, true); // pass flag to auto-set country
        if (!success && pincode.length === 5) {
          // If India fails and length is also 5, try US (though 6-digit won't be 5)
          await fetchUSZip(pincode, true);
        }
      } else if (pincode.length === 5) {
        // Try US first
        const success = await fetchUSZip(pincode, true);
        if (!success && pincode.length === 6) {
          await fetchIndianPincode(pincode, true);
        }
      } else {
        // Length not recognised – clear errors
        methods.clearErrors('pincode');
      }
    }
  };

  const fetchIndianPincode = async (
    pincode: string,
    autoSetCountry = false,
  ) => {
    if (pincode.length !== 6) return false;

    setIsLoadingAddress(true);
    try {
      console.log('Calling Indian PIN API for:', pincode);
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`,
      );
      const data: PinCodeResponse[] = await response.json();
      console.log('API response:', data);

      if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const postOffice = data[0].PostOffice[0];
        methods.setValue('city', postOffice.District, {shouldValidate: true});
        methods.setValue('state', postOffice.State, {shouldValidate: true});
        methods.clearErrors('pincode');

        // Auto‑set country to India if it's empty (or if autoSetCountry is true and no country selected)
        const currentCountry = methods.getValues('country');
        if (!currentCountry && autoSetCountry) {
          methods.setValue('country', 'in', {shouldValidate: true});
          console.log('Country auto‑set to: in');
        }

        console.log(
          'City/State set to:',
          postOffice.District,
          postOffice.State,
        );
        return true;
      } else {
        methods.setError('pincode', {
          type: 'manual',
          message: 'Invalid Indian PIN code',
        });
        methods.setValue('city', '');
        methods.setValue('state', '');
        return false;
      }
    } catch (error) {
      console.error('Fetch error:', error);
      methods.setError('pincode', {
        type: 'manual',
        message: 'Failed to fetch address',
      });
      return false;
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const fetchUSZip = async (zip: string, autoSetCountry = false) => {
    if (zip.length < 5) return false;

    setIsLoadingAddress(true);
    try {
      console.log('Calling US ZIP API for:', zip);
      const response = await fetch(`https://api.zippopotam.us/us/${zip}`);
      console.log('API response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('ZIP data:', data);
        if (data.places && data.places[0]) {
          methods.setValue('city', data.places[0]['place name'], {
            shouldValidate: true,
          });
          methods.setValue('state', data.places[0]['state abbreviation'], {
            shouldValidate: true,
          });
          methods.clearErrors('pincode');

          // Auto‑set country to US if it's empty (or if autoSetCountry is true and no country selected)
          const currentCountry = methods.getValues('country');
          if (!currentCountry && autoSetCountry) {
            methods.setValue('country', 'us', {shouldValidate: true});
            console.log('Country auto‑set to: us');
          }

          console.log(
            'City/State set to:',
            data.places[0]['place name'],
            data.places[0]['state abbreviation'],
          );
          return true;
        } else {
          methods.setError('pincode', {
            type: 'manual',
            message: 'Invalid US ZIP code',
          });
          methods.setValue('city', '');
          methods.setValue('state', '');
          return false;
        }
      } else {
        methods.setError('pincode', {
          type: 'manual',
          message: 'ZIP code not found',
        });
        return false;
      }
    } catch (error) {
      console.error('Fetch error:', error);
      methods.setError('pincode', {
        type: 'manual',
        message: 'Failed to fetch address',
      });
      return false;
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const onSubmit = (data: BeneficiaryFormData) => {
    console.log('Submitting data:', data);
    const payload = {
      ...data,
      countryCode: '', // adjust if needed
    };
    addBeneficiary(payload, {
      onSuccess: () => {
        navigate({to: '/wallet/paymentdashbord'});
      },
    });
  };

  const onError = (errors: any) => {
    console.log('Form errors:', errors);
  };

  // Options for dropdowns
  const relationshipOptions = [
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
    {value: 'in', label: 'India'},
  ];

  const bankCountryOptions = [
    {value: 'us', label: 'United States'},
    {value: 'uk', label: 'United Kingdom'},
    {value: 'fr', label: 'France'},
    {value: 'de', label: 'Germany'},
    {value: 'in', label: 'India'},
  ];

  const currencyOptions = [
    {value: 'usd', label: 'USD'},
    {value: 'eur', label: 'EUR'},
    {value: 'gbp', label: 'GBP'},
    {value: 'inr', label: 'INR'},
  ];

  const accountTypeOptions = [
    {value: 'checking', label: 'Checking / Current'},
    {value: 'savings', label: 'Savings'},
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
              <div className="space-y-1.5">
                <div className="flex gap-3 md:gap-5">
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

            {/* Address Details */}
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

                <div className="relative w-1/3">
                  <GenericInputField
                    name="pincode"
                    label="Pincode"
                    placeholder="12345"
                    required
                  />
                  {isLoadingAddress && (
                    <span className="text-gray-400 absolute right-2 top-9 text-sm">
                      <span className="material-symbols-outlined animate-spin text-[16px]">
                        progress_activity
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* Hint messages – still based on current country selection */}
              {country === 'in' && pincode?.length === 6 && (
                <p className="mt-1 text-xs text-[#F57F3D]">
                  <span className="material-symbols-outlined mr-1 align-middle text-[12px]">
                    auto_awesome
                  </span>
                  City/State will auto‑fill for Indian PIN codes
                </p>
              )}
              {country === 'us' && pincode?.length >= 5 && (
                <p className="mt-1 text-xs text-[#F57F3D]">
                  <span className="material-symbols-outlined mr-1 align-middle text-[12px]">
                    auto_awesome
                  </span>
                  City/State will auto‑fill for US ZIP codes
                </p>
              )}

              <GenericDropdown
                name="country"
                label="Country"
                options={countryOptions}
                required
              />
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
