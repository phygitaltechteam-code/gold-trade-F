/* eslint-disable */
import React, {useState} from 'react';
import {MdExpandMore, MdMail} from 'react-icons/md';
import {Header} from './ui/Header';
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

  // Format address for display in textarea
  const formatAddressForDisplay = () => {
    const parts = [];
    if (formData.address) parts.push(formData.address);
    if (formData.city) parts.push(formData.city);
    if (formData.state) parts.push(formData.state);
    if (formData.pincode) parts.push(formData.pincode);
    if (formData.country) parts.push(formData.country);
    return parts.join(', ');
  };

  // Parse address from textarea and update individual fields
  const handleAddressTextareaChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const value = e.target.value;

    // Split by comma and trim each part
    const parts = value.split(',').map((part) => part.trim());

    // Update form data based on the number of parts
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
      // Check if there are any changes
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

      // Create FormData object
      const formDataToSend = new FormData();

      // Prepare user data
      const userData: any = {};
      if (formData.phoneNumber !== profiledata?.user?.phoneNumber) {
        userData.phoneNumber = formData.phoneNumber.trim();
      }
      if (formData.email !== profiledata?.user?.email) {
        userData.email = formData.email.trim();
      }

      // Add user data if there are changes
      if (Object.keys(userData).length > 0) {
        formDataToSend.append('user', JSON.stringify(userData));
      }

      // Add address fields if there are changes
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

      // Only update if there's something to update
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
      <div className="bg-background-light dark:bg-background-dark flex flex-1 flex-col">
        <Header title="Edit Contact Info" />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-gray-500">Loading contact information...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark flex flex-1 flex-col">
      <Header title="Edit Contact Info" />

      <form onSubmit={handleSubmit}>
        <main className="no-scrollbar flex w-full flex-1 flex-col gap-6 overflow-y-auto px-5 py-6">
          {/* Mobile Number */}
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
              htmlFor="phoneNumber"
            >
              Mobile Number
            </label>
            <div className="relative flex w-full items-center rounded-xl border border-slate-200 bg-white shadow-sm transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary dark:border-white/10 dark:bg-white/5">
              <button
                className="group flex items-center gap-2 rounded-l-xl border-r border-slate-200 py-3.5 pl-4 pr-3 transition-colors hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                type="button"
              >
                {/* Display flag based on country */}
                <span className="text-xl">
                  {formData.country === 'DE' ? '🇩🇪' : '🇺🇸'}
                </span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {formData.country === 'DE' ? '+91' : '+1'}
                </span>
                <MdExpandMore className="text-[18px] text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300" />
              </button>
              <input
                className="w-full flex-1 border-none bg-transparent px-4 py-3.5 text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 dark:text-white"
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
              htmlFor="email"
            >
              Personal Email
            </label>
            <div className="relative flex w-full items-center rounded-xl border border-slate-200 bg-white shadow-sm transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary dark:border-white/10 dark:bg-white/5">
              <div className="pl-4 text-slate-400 dark:text-slate-500">
                <MdMail className="text-[20px]" />
              </div>
              <input
                className="w-full flex-1 border-none bg-transparent px-3 py-3.5 text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 dark:text-white"
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Address Field - Single Textarea */}
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
              htmlFor="address"
            >
              Residential Address
            </label>
            <div className="relative w-full rounded-xl border border-slate-200 bg-white shadow-sm transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary dark:border-white/10 dark:bg-white/5">
              <textarea
                className="flex min-h-[120px] w-full resize-none rounded-xl border-none bg-transparent p-4 text-base leading-relaxed text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 dark:text-white"
                id="address"
                rows={4}
                value={formatAddressForDisplay()}
                onChange={handleAddressTextareaChange}
                placeholder="Enter your full address (Format: Street, City, State, Pincode, Country)"
              />
            </div>
            <div className="px-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Please use your physical street address for regulatory purposes.
              </p>
            </div>
          </div>
        </main>

        <div className="bg-background-light dark:bg-background-dark mt-auto p-5 pb-8">
          <div className="flex w-full flex-col gap-4">
            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? (
                <>
                  <svg
                    className="h-5 w-5 animate-spin text-white"
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
              className="text-center text-sm font-medium text-slate-500 transition-colors hover:text-primary dark:text-slate-400 dark:hover:text-primary"
            >
              Having trouble updating your address?
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditContactInfo;
