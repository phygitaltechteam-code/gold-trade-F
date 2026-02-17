/* eslint-disable */
import React, {useState, useEffect} from 'react';
import {MdMail, MdArrowBack, MdExpandMore} from 'react-icons/md';
import {useGetProfile, useUpdateProfile} from './profilemutation';
import toast from 'react-hot-toast';
import { COUNTRIES } from '@/features/Registration/constants/countries';



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
    setFormData(prev => ({...prev, [id]: value}));
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="rounded-2xl bg-white/70 p-8 shadow-xl backdrop-blur-xl dark:bg-gray-800/60">
          <p className="text-gray-600 dark:text-gray-300">
            Loading contact information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#221910] flex flex-col overflow-x-hidden transition-colors duration-200">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col w-full">

        {/* Header */}
        <div className="sticky top-0 z-50 bg-[#f8f7f5]/95 dark:bg-[#221910]/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between border-b border-slate-200/50 dark:border-white/5">
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors text-slate-900 dark:text-white"
          >
            <MdArrowBack className="text-[24px]" />
          </button>

          <h1 className="text-lg font-bold leading-tight tracking-tight text-center flex-1 pr-10 text-slate-900 dark:text-white">
            Edit Contact Info
          </h1>
        </div>

        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 px-5 py-6 gap-6"
        >
          <div className="flex flex-col gap-6">
            {/* Phone */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label htmlFor="phoneNumber" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Mobile Number
                </label>
              </div>
              <div className="relative flex items-center w-full rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus-within:border-orange-500 dark:focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all shadow-sm">
                <button
                  type="button"
                  className="flex items-center gap-2 pl-4 pr-3 py-3.5 border-r border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors rounded-l-xl group"
                >
                  <span className="text-xl">🇮🇳</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">+91</span>
                  <MdExpandMore className="text-[18px] text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300" />
                </button>
                <input
                  id="phoneNumber"
                  type="tel"
                  className="flex-1 w-full border-none bg-transparent py-3.5 px-4 text-base text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 focus:outline-none"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter mobile number"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Personal Email
                </label>
              </div>
              <div className="relative flex items-center w-full rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus-within:border-orange-500 dark:focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all shadow-sm">
                <div className="pl-4 text-slate-400 dark:text-slate-500 flex items-center h-full">
                  <MdMail className="text-[20px]" />
                </div>
                <input
                  id="email"
                  type="email"
                  className="flex-1 w-full border-none bg-transparent py-3.5 px-3 text-base text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 focus:outline-none"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                />
              </div>
            </div>

            {/* Address Section */}
            <div className="flex flex-col gap-2">
              <label htmlFor="streetAddress" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Residential Address
              </label>
              <div className="relative w-full rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus-within:border-orange-500 dark:focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all shadow-sm">
                <textarea
                  id="streetAddress"
                  className="w-full min-h-[120px] resize-none rounded-xl border-none bg-transparent p-4 text-base text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 focus:outline-none leading-relaxed"
                  placeholder="Street, House no, Area"
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
<label htmlFor="pincode" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Pin Code
              </label>
              <input
                id="pincode"
                className=" h-12 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-orange-500 dark:focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all shadow-sm pb- text-base text-slate-900 dark:text-white placeholder-slate-400"
                placeholder="Pincode"
                value={formData.pincode}
                onChange={handleInputChange}
              />

              <div className="grid grid-cols-2 gap-4 mt-4">
               <div><label htmlFor="city" className="text-sm font-medium text-slate-700 dark:text-slate-300">
             City
              </label>
                
                <input
                  id="city"
                  className="h-12 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-orange-500 dark:focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all shadow-sm px-4 text-base text-slate-900 dark:text-white placeholder-slate-400"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleInputChange}
                /></div> <div>
                <label htmlFor="state"  className="text-sm font-medium text-slate-700 dark:text-slate-300">State</label>
                <input
                  id="state"
                  className="h-12 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-orange-500 dark:focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all shadow-sm px-4 text-base text-slate-900 dark:text-white placeholder-slate-400"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleInputChange}
                /></div>
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
              <p className="text-xs text-slate-500 dark:text-slate-400 px-1 mt-2">
                Please use your physical street address for regulatory purposes.
              </p>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-auto p-5 pb-8">
            <div className="w-full max-w-lg mx-auto flex flex-col gap-4">
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-orange-500 hover:bg-orange-500/90 active:scale-[0.98] transition-all text-white font-semibold text-base py-4 rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isPending ? 'Saving...' : 'Update Contact Info'}
              </button>
              <button
                type="button"
                className="text-sm text-slate-500 hover:text-orange-500 dark:text-slate-400 dark:hover:text-orange-500 transition-colors text-center font-medium"
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

