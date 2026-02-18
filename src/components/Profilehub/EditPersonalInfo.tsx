import React, {useState, useRef} from 'react';
import {
  MdPhotoCamera,
  MdEdit,
  MdLock,
  MdVisibilityOff,
  MdVisibility,
} from 'react-icons/md';
import {Header} from './ui/Header';
import {useGetProfile, useUpdateProfile} from './profilemutation';
import toast from 'react-hot-toast';
import {useNavigate} from '@tanstack/react-router';

const EditPersonalInfo: React.FC = () => {
  const {data: profiledata, isLoading} = useGetProfile();
  const {mutate: updateProfile, isPending} = useUpdateProfile();
  const nevigate = useNavigate();
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [dobError, setDobError] = useState('');
  const [formData, setFormData] = useState<{
    fullname: string;
    dob: string;
    image: string;
  }>({
    fullname: '',
    dob: '',
    image: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data when profile data is loaded
  React.useEffect(() => {
    if (profiledata) {
      const formatDateForInput = (dateString: string | null) => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        } catch (error) {
          return '';
        }
      };

      setFormData({
        fullname: profiledata?.user?.fullname || '',
        dob: formatDateForInput(profiledata?.user?.dob),
        image: profiledata?.photo || '',
      });
    }
  }, [profiledata]);

  // Helper function to validate age (must be at least 18)
  const validateAge = (dob: string): boolean => {
    if (!dob) return false; // or true if optional – adjust as needed
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age >= 18;
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (!accountNumber) return '';
    if (showAccountNumber) return accountNumber;

    if (accountNumber.length <= 4) return accountNumber;
    const visiblePart = accountNumber.slice(-4);
    const maskedPart = '•'.repeat(accountNumber.length - 4);
    return `${maskedPart}${visiblePart}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {id, value} = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({...prev, dob: value}));

    // Validate age and set error message
    if (value && !validateAge(value)) {
      setDobError('You must be at least 18 years old');
    } else {
      setDobError('');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          // image: file,
          image: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate age before submitting
    if (formData.dob && !validateAge(formData.dob)) {
      setDobError('You must be at least 18 years old');
      return;
    }

    try {
      const formDataToSend = new FormData();

      if (formData.fullname.trim()) {
        formDataToSend.append('fullname', formData.fullname.trim());
      }

      if (formData.dob) {
        formDataToSend.append('dob', formData.dob);
      }

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      updateProfile(formDataToSend);
      nevigate({to: '/accounthub/acounthub'});
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Update error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 flex min-h-screen items-start justify-center pt-0">
        <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-white shadow-2xl md:rounded-3xl">
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="text-gray-500">Loading profile data...</div>
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
            Edit Personal Info
          </h1>
        </div>

        <div className="flex flex-1 flex-col items-center overflow-hidden">
          {/* Profile Photo Section */}
          <section className="flex flex-col items-center px-6 pb-8 pt-4 md:px-8 md:pt-6">
            <div
              className="group relative cursor-pointer"
              onClick={triggerFileInput}
            >
              <div
                className="h-32 w-32 rounded-full border-4 border-white bg-cover bg-center shadow-md dark:border-[#3a2e24] md:h-36 md:w-36"
                style={{
                  backgroundImage: `url('${formData.image}')`,
                }}
              />
              {/* Edit Badge */}
              <div className="border-background-light dark:border-background-dark absolute bottom-0 right-0 flex items-center justify-center rounded-full border-4 bg-primary p-2 text-white shadow-sm md:p-2.5">
                <MdPhotoCamera className="text-[20px] md:text-[22px]" />
              </div>
            </div>
            <button
              type="button"
              onClick={triggerFileInput}
              className="mt-4 text-sm font-semibold text-primary transition-colors hover:text-orange-600 hover:underline md:text-base"
            >
              Change Profile Photo
            </button>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </section>

          {/* Form Section */}
          <form
            className="flex w-full flex-1 flex-col gap-6 overflow-y-auto px-6 pb-32 md:gap-8 md:px-8"
            onSubmit={handleSubmit}
          >
            {/* Full Name Input */}
            <div className="flex flex-col gap-2 md:gap-3">
              <label
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
                htmlFor="fullname"
              >
                Full Name
              </label>
              <div className="group relative">
                <input
                  className="text-navy placeholder-gray-400 w-full rounded-xl border border-slate-200 bg-white px-4 py-4 text-base font-medium shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/50 dark:border-[#443629] dark:bg-[#2c241b] dark:text-white md:py-5 md:text-lg"
                  id="fullname"
                  type="text"
                  value={formData.fullname}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                />
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-primary opacity-0 transition-opacity group-focus-within:opacity-100">
                  <MdEdit className="md:text-[20px]" />
                </div>
              </div>
            </div>

            {/* Date of Birth Input with Age Validation */}
            <div className="flex flex-col gap-2 md:gap-3">
              <label
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
                htmlFor="dob"
              >
                Date of Birth
              </label>
              <div className="relative">
                <input
                  className={`text-navy w-full rounded-xl border ${
                    dobError ? 'border-red-500' : 'border-slate-200'
                  } bg-white px-4 py-4 text-base font-medium shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/50 dark:border-[#443629] dark:bg-[#2c241b] dark:text-white md:py-5 md:text-lg`}
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleDobChange}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              {dobError && (
                <p className="px-1 text-xs text-red-500 md:text-sm">
                  {dobError}
                </p>
              )}
              {!dobError && (
                <p className="px-1 text-xs text-slate-500 dark:text-slate-400 md:text-sm">
                  You must be at least 18 years old
                </p>
              )}
            </div>

            {/* Account Number (Read-only with eye toggle) */}
            <div className="flex flex-col gap-2 md:gap-3">
              <label
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
                htmlFor="account-number"
              >
                Account Number
                {/* <MdLock
                  className="text-gray-400 text-base md:text-lg"
                  title="Secure field"
                /> */}
              </label>
              <div className="relative">
                <input
                  className="text-navy w-full rounded-xl border border-slate-200 bg-white px-4 py-4 text-base font-medium tracking-widest shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/50 dark:border-[#443629] dark:bg-[#2c241b] dark:text-white md:py-5 md:text-lg"
                  id="account-number"
                  type="text"
                  value={maskAccountNumber(profiledata?.accountNumber || '')}
                  readOnly
                />
                <button
                  className="absolute bottom-0 right-0 top-0 flex items-center justify-center px-4 text-primary transition-colors hover:text-orange-700 md:px-5"
                  type="button"
                  onClick={() => setShowAccountNumber(!showAccountNumber)}
                  aria-label={
                    showAccountNumber
                      ? 'Hide account number'
                      : 'Show account number'
                  }
                >
                  {showAccountNumber ? (
                    <MdVisibility className="text-xl md:text-2xl" />
                  ) : (
                    <MdVisibilityOff className="text-xl md:text-2xl" />
                  )}
                </button>
              </div>
              <p className="px-1 text-xs text-slate-500 dark:text-slate-400 md:text-sm">
                Your Account Number is encrypted for your security. Click the
                eye icon to reveal.
              </p>
            </div>

            {/* Action Button */}
            <div className="mt-auto w-full px-6 pb-6 pt-8 md:px-0">
              <button
                type="submit"
                disabled={isPending}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary text-lg font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 md:mx-auto md:h-16 md:max-w-[400px] md:text-xl"
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
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPersonalInfo;
