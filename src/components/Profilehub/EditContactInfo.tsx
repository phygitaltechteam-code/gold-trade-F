/* eslint-disable */
import React, {useState, useEffect} from 'react';
import {MdMail, MdArrowBack, MdExpandMore} from 'react-icons/md';
import {useGetProfile, useUpdateProfile} from './profilemutation';
import toast from 'react-hot-toast';
import {COUNTRIES} from '@/features/Registration/constants/countries';

const EditContactInfo: React.FC = () => {
  const {data: profiledata, isLoading} = useGetProfile();
  const {mutate: updateProfile, isPending} = useUpdateProfile();

  const [formData, setFormData] = useState({
    phoneNumber: '',
    email: '',
    streetAddress: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
  });

  useEffect(() => {
    if (profiledata) {
      setFormData({
        phoneNumber: profiledata?.user?.phoneNumber || '',
        email: profiledata?.user?.email || '',
        streetAddress: profiledata?.address || '',
        city: profiledata?.city || '',
        state: profiledata?.state || '',
        pincode: profiledata?.pincode || '',
        country: profiledata?.country || '',
      });
    }
  }, [profiledata]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const {id, value} = e.target;
    setFormData((prev) => ({...prev, [id]: value}));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    const userData: any = {};

    if (formData.phoneNumber !== profiledata?.user?.phoneNumber) {
      userData.phoneNumber = formData.phoneNumber.trim();
    }
    if (formData.email !== profiledata?.user?.email) {
      userData.email = formData.email.trim();
    }

    if (Object.keys(userData).length) {
      formDataToSend.append('user', JSON.stringify(userData));
    }

    if (formData.streetAddress !== profiledata?.address)
      formDataToSend.append('address', formData.streetAddress.trim());

    if (formData.city !== profiledata?.city)
      formDataToSend.append('city', formData.city.trim());

    if (formData.state !== profiledata?.state)
      formDataToSend.append('state', formData.state.trim());

    if (formData.pincode !== profiledata?.pincode)
      formDataToSend.append('pincode', formData.pincode.trim());

    if (formData.country !== profiledata?.country)
      formDataToSend.append('country', formData.country.trim());

    if ([...formDataToSend.keys()].length === 0) {
      toast.error('No changes to save');
      return;
    }

    updateProfile(formDataToSend);
  };

  if (isLoading) {
    return (
      <div className="from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex min-h-screen items-center justify-center bg-gradient-to-br">
        <div className="dark:bg-gray-800/60 rounded-2xl bg-white/70 p-8 shadow-xl backdrop-blur-xl">
          <p className="text-gray-600 dark:text-gray-300">
            Loading contact information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#f8f7f5] transition-colors duration-200 dark:bg-[#221910]">
      <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col">
        {/* Header */}
        <div className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200/50 bg-[#f8f7f5]/95 px-4 py-3 backdrop-blur-sm dark:border-white/5 dark:bg-[#221910]/95">
          <button
            onClick={() => window.history.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-900 transition-colors hover:bg-slate-200/50 dark:text-white dark:hover:bg-white/10"
          >
            <MdArrowBack className="text-[24px]" />
          </button>

          <h1 className="flex-1 pr-10 text-center text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
            Edit Contact Info
          </h1>
        </div>

        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-6 px-5 py-6"
        >
          <div className="flex flex-col gap-6">
            {/* Phone */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="phoneNumber"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Mobile Number
                </label>
              </div>
              <div className="relative flex w-full items-center rounded-xl border border-slate-200 bg-white shadow-sm transition-all focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 dark:border-white/10 dark:bg-white/5 dark:focus-within:border-orange-500">
                <input
                  id="phoneNumber"
                  type="tel"
                  className="w-full flex-1 border-none bg-transparent px-4 py-3.5 text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 dark:text-white"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter mobile number"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Personal Email
                </label>
              </div>
              <div className="relative flex w-full items-center rounded-xl border border-slate-200 bg-white shadow-sm transition-all focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 dark:border-white/10 dark:bg-white/5 dark:focus-within:border-orange-500">
                <div className="flex h-full items-center pl-4 text-slate-400 dark:text-slate-500">
                  <MdMail className="text-[20px]" />
                </div>
                <input
                  id="email"
                  type="email"
                  className="w-full flex-1 border-none bg-transparent px-3 py-3.5 text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 dark:text-white"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                />
              </div>
            </div>

            {/* Address Section */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="streetAddress"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Residential Address
              </label>
              <div className="relative w-full rounded-xl border border-slate-200 bg-white shadow-sm transition-all focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 dark:border-white/10 dark:bg-white/5 dark:focus-within:border-orange-500">
                <textarea
                  id="streetAddress"
                  className="min-h-[120px] w-full resize-none rounded-xl border-none bg-transparent p-4 text-base leading-relaxed text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 dark:text-white"
                  placeholder="Street, House no, Area"
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              <label
                htmlFor="pincode"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Pin Code
              </label>
              <input
                id="pincode"
                className="pb- h-12 rounded-xl border border-slate-200 bg-white text-base text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-orange-500"
                placeholder="Pincode"
                value={formData.pincode}
                onChange={handleInputChange}
              />

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="city"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    City
                  </label>

                  <input
                    id="city"
                    className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-orange-500"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </div>{' '}
                <div>
                  <label
                    htmlFor="state"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    State
                  </label>
                  <input
                    id="state"
                    className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-orange-500"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* <label className="flex flex-col gap-1">
                               <span className="text-sm font-medium text-[#0d131c] dark:text-white md:text-base">
                                 Country
                               </span>
                               <select
                                 className={`h-10 w-full rounded-md border px-3 text-sm text-[#0d131c] shadow-sm outline-none transition-all focus:ring-1 md:text-base ${
                                   'border-[#ced9e9] focus:border-[#F57F3D] focus:ring-[#F57F3D]/30 dark:border-slate-600'
                                 } bg-white dark:bg-slate-800/80 dark:text-white`}
                                 value={formData.country}
                                 required
                               >
                                 <option value="">Select a country</option>
                                 {COUNTRIES.map((country) => (
                                   <option key={country.code} value={country.code}>
                                     {country.name}
                                   </option>
                                 ))}
                               </select>
                              
                             </label> */}
              <p className="mt-2 px-1 text-xs text-slate-500 dark:text-slate-400">
                Please use your physical street address for regulatory purposes.
              </p>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-auto p-5 pb-8">
            <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
              <button
                type="submit"
                disabled={isPending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 text-base font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-500/90 active:scale-[0.98] disabled:opacity-70"
              >
                {isPending ? 'Saving...' : 'Update Contact Info'}
              </button>
              <button
                type="button"
                className="text-center text-sm font-medium text-slate-500 transition-colors hover:text-orange-500 dark:text-slate-400 dark:hover:text-orange-500"
              >
                Having trouble updating your address?
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditContactInfo;
