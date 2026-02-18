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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
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
      <div className="flex min-h-screen items-center justify-center bg-[#f8f7f5] dark:bg-[#221910]">
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
        {/* Header - same as EditPersonalInfo */}
        <div className="sticky top-0 z-20 flex items-center justify-between bg-white/95 px-4 py-3 backdrop-blur-md dark:bg-[#221610]/95 md:px-6 md:py-4">
          <button
            onClick={() => window.history.back()}
            className="-ml-2 flex items-center justify-center rounded-full p-2 text-slate-900 transition-colors hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800 md:p-2.5"
          >
            <MdArrowBack className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <h1 className="flex-1 pr-8 text-center text-base font-bold tracking-tight text-slate-900 dark:text-white md:text-lg">
            Edit Contact Info
          </h1>
          <div className="w-10" /> {/* spacer */}
        </div>

        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-6 md:px-6 md:py-8"
        >
          {/* Phone Number */}
          <div className="flex flex-col gap-2 md:gap-3">
            <label
              htmlFor="phoneNumber"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Mobile Number
            </label>
            <input
              id="phoneNumber"
              type="tel"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-4 text-base font-medium shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/50 dark:border-[#443629] dark:bg-[#2c241b] dark:text-white md:py-5 md:text-lg"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Enter mobile number"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2 md:gap-3">
            <label
              htmlFor="email"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Personal Email
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <MdMail className="text-xl md:text-2xl" />
              </div>
              <input
                id="email"
                type="email"
                className="w-full rounded-xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-base font-medium shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/50 dark:border-[#443629] dark:bg-[#2c241b] dark:text-white md:py-5 md:text-lg"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email"
              />
            </div>
          </div>

          {/* Address Section */}
          <div className="flex flex-col gap-2 md:gap-3">
            <label
              htmlFor="streetAddress"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Residential Address
            </label>
            <textarea
              id="streetAddress"
              className="min-h-[100px] w-full rounded-xl border border-slate-200 bg-white px-4 py-4 text-base font-medium shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/50 dark:border-[#443629] dark:bg-[#2c241b] dark:text-white md:py-5 md:text-lg"
              placeholder="Street, House no, Area"
              value={formData.streetAddress}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          {/* Pin Code */}
          <div className="flex flex-col gap-2 md:gap-3">
            <label
              htmlFor="pincode"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Pin Code
            </label>
            <input
              id="pincode"
              type="text"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-4 text-base font-medium shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/50 dark:border-[#443629] dark:bg-[#2c241b] dark:text-white md:py-5 md:text-lg"
              placeholder="Pincode"
              value={formData.pincode}
              onChange={handleInputChange}
            />
          </div>

          {/* City / State Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 md:gap-3">
              <label
                htmlFor="city"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                City
              </label>
              <input
                id="city"
                type="text"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-4 text-base font-medium shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/50 dark:border-[#443629] dark:bg-[#2c241b] dark:text-white md:py-5 md:text-lg"
                placeholder="City"
                value={formData.city}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-col gap-2 md:gap-3">
              <label
                htmlFor="state"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                State
              </label>
              <input
                id="state"
                type="text"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-4 text-base font-medium shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/50 dark:border-[#443629] dark:bg-[#2c241b] dark:text-white md:py-5 md:text-lg"
                placeholder="State"
                value={formData.state}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Country Select */}
          <div className="flex flex-col gap-2 md:gap-3">
            <label
              htmlFor="country"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Country
            </label>
            <div className="relative">
              <select
                id="country"
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-4 text-base font-medium shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/50 dark:border-[#443629] dark:bg-[#2c241b] dark:text-white md:py-5 md:text-lg"
                value={formData.country}
                onChange={handleInputChange}
              >
                <option value="">Select a country</option>
                {COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
              <MdExpandMore className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-2xl text-slate-400" />
            </div>
          </div>

          {/* Hint text */}
          <p className="px-1 text-xs text-slate-500 dark:text-slate-400 md:text-sm">
            Please use your physical street address for regulatory purposes.
          </p>

          {/* Bottom Buttons */}
          <div className="mt-auto flex flex-col gap-4 pt-8">
            <button
              type="submit"
              disabled={isPending}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary text-lg font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 md:h-16 md:text-xl"
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
        </form>
      </div>
    </div>
  );
};

export default EditContactInfo;
