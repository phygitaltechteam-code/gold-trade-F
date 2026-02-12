/* eslint-disable */
import React, {useState} from 'react';
import {MdExpandMore, MdMail} from 'react-icons/md';
import {useGetProfile, useUpdateProfile} from './profilemutation';
import toast from 'react-hot-toast';

const EditContactInfo: React.FC = () => {
  const {data: profiledata, isLoading} = useGetProfile();
  const {mutate: updateProfile, isPending} = useUpdateProfile();

  const [formData, setFormData] = useState({
    phoneNumber: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
  });

  React.useEffect(() => {
    if (profiledata) {
      setFormData({
        phoneNumber: profiledata?.user?.phoneNumber || '',
        email: profiledata?.user?.email || '',
        address: profiledata?.address || '',
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
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const formatAddressForDisplay = () => {
    const parts = [];
    if (formData.address) parts.push(formData.address);
    if (formData.city) parts.push(formData.city);
    if (formData.state) parts.push(formData.state);
    if (formData.pincode) parts.push(formData.pincode);
    if (formData.country) parts.push(formData.country);
    return parts.join(', ');
  };

  const handleAddressTextareaChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const value = e.target.value;
    const parts = value.split(',').map((part) => part.trim());

    setFormData((prev) => ({
      ...prev,
      address: parts[0] || '',
      city: parts.length > 1 ? parts[1] : '',
      state: parts.length > 2 ? parts[2] : '',
      pincode: parts.length > 3 ? parts[3] : '',
      country: parts.length > 4 ? parts[4] : '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const hasChanges =
        formData.phoneNumber !== profiledata?.user?.phoneNumber ||
        formData.email !== profiledata?.user?.email ||
        formData.address !== profiledata?.address ||
        formData.city !== profiledata?.city ||
        formData.state !== profiledata?.state ||
        formData.pincode !== profiledata?.pincode ||
        formData.country !== profiledata?.country;

      if (!hasChanges) {
        toast.error('No changes to save');
        return;
      }

      const formDataToSend = new FormData();

      const userData: any = {};
      if (formData.phoneNumber !== profiledata?.user?.phoneNumber) {
        userData.phoneNumber = formData.phoneNumber.trim();
      }
      if (formData.email !== profiledata?.user?.email) {
        userData.email = formData.email.trim();
      }

      if (Object.keys(userData).length > 0) {
        formDataToSend.append('user', JSON.stringify(userData));
      }

      if (formData.address !== profiledata?.address) {
        formDataToSend.append('address', formData.address.trim());
      }
      if (formData.city !== profiledata?.city) {
        formDataToSend.append('city', formData.city.trim());
      }
      if (formData.state !== profiledata?.state) {
        formDataToSend.append('state', formData.state.trim());
      }
      if (formData.pincode !== profiledata?.pincode) {
        formDataToSend.append('pincode', formData.pincode.trim());
      }
      if (formData.country !== profiledata?.country) {
        formDataToSend.append('country', formData.country.trim());
      }

      if (
        formDataToSend.has('user') ||
        formDataToSend.has('address') ||
        formDataToSend.has('city') ||
        formDataToSend.has('state') ||
        formDataToSend.has('pincode') ||
        formDataToSend.has('country')
      ) {
        updateProfile(formDataToSend);
      } else {
        toast.error('No changes to save');
      }
    } catch (error) {
      toast.error('Failed to update contact information');
      console.error('Update error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 flex min-h-screen items-start justify-center pt-0">
        <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-white shadow-2xl md:rounded-3xl">
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="text-gray-500">Loading contact information...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 flex min-h-screen items-start justify-center pt-0">
      <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-white shadow-2xl md:rounded-3xl">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between bg-white/95 px-4 py-3 backdrop-blur-md dark:bg-[#221610]/95 md:px-6 md:py-4">
          <button
            onClick={() => window.history.back()}
            className="-ml-2 flex items-center justify-center rounded-full p-2 text-slate-900 transition-colors hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800 md:p-2.5"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="flex-1 pr-8 text-center text-base font-bold tracking-tight text-slate-900 dark:text-white md:text-lg">
            Edit Contact Info
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          <main className="no-scrollbar flex w-full flex-1 flex-col gap-6 overflow-y-auto px-5 py-6 md:px-6 md:py-8">
            {/* Mobile Number */}
            <div className="flex flex-col gap-2 md:gap-3">
              <label
                className="text-sm font-medium text-slate-700 dark:text-slate-300 md:text-base"
                htmlFor="phoneNumber"
              >
                Mobile Number
              </label>
              <div className="relative flex w-full items-center rounded-xl border border-slate-200 bg-white shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 dark:border-white/10 dark:bg-white/5 md:rounded-2xl">
                <button
                  className="group flex items-center gap-2 rounded-l-xl border-r border-slate-200 py-3.5 pl-4 pr-3 transition-colors hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5 md:py-4 md:pl-5"
                  type="button"
                >
                  <span className="text-xl md:text-2xl">
                    {formData.country === 'DE' ? '🇩🇪' : '🇺🇸'}
                  </span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 md:text-base">
                    {formData.country === 'DE' ? '+91' : '+1'}
                  </span>
                  <MdExpandMore className="text-[18px] text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300 md:text-[20px]" />
                </button>
                <input
                  className="w-full flex-1 border-none bg-transparent px-4 py-3.5 text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 dark:text-white md:py-4 md:text-lg"
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2 md:gap-3">
              <label
                className="text-sm font-medium text-slate-700 dark:text-slate-300 md:text-base"
                htmlFor="email"
              >
                Personal Email
              </label>
              <div className="relative flex w-full items-center rounded-xl border border-slate-200 bg-white shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 dark:border-white/10 dark:bg-white/5 md:rounded-2xl">
                <div className="pl-4 text-slate-400 dark:text-slate-500 md:pl-5">
                  <MdMail className="text-[20px] md:text-[22px]" />
                </div>
                <input
                  className="w-full flex-1 border-none bg-transparent px-3 py-3.5 text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 dark:text-white md:py-4 md:text-lg"
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Address Field - Single Textarea */}
            <div className="flex flex-col gap-2 md:gap-3">
              <label
                className="text-sm font-medium text-slate-700 dark:text-slate-300 md:text-base"
                htmlFor="address"
              >
                Residential Address
              </label>
              <div className="relative w-full rounded-xl border border-slate-200 bg-white shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 dark:border-white/10 dark:bg-white/5 md:rounded-2xl">
                <textarea
                  className="flex min-h-[120px] w-full resize-none rounded-xl border-none bg-transparent p-4 text-base leading-relaxed text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 dark:text-white md:min-h-[140px] md:p-5 md:text-lg"
                  id="address"
                  rows={4}
                  value={formatAddressForDisplay()}
                  onChange={handleAddressTextareaChange}
                  placeholder="Enter your full address (Format: Street, City, State, Pincode, Country)"
                />
              </div>
              <div className="px-1">
                <p className="text-xs text-slate-500 dark:text-slate-400 md:text-sm">
                  Please use your physical street address for regulatory
                  purposes.
                </p>
              </div>
            </div>
          </main>

          {/* Footer with Action Button */}
          <div className="mt-auto p-5 pb-8 md:p-6 md:pb-8">
            <div className="flex w-full flex-col gap-4">
              <button
                type="submit"
                disabled={isPending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 md:mx-auto md:max-w-[400px] md:py-5 md:text-lg"
              >
                {isPending ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin text-white md:h-6 md:w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Update Contact Info'
                )}
              </button>
              <button
                type="button"
                className="text-center text-sm font-medium text-slate-500 transition-colors hover:text-primary dark:text-slate-400 dark:hover:text-primary md:text-base"
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
