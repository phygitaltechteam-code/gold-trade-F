import React, {useState, useRef} from 'react';
import {
  MdPhotoCamera,
  MdEdit,
  MdCalendarMonth,
  MdLock,
  MdVisibilityOff,
  MdVisibility,
} from 'react-icons/md';
import {Header} from './ui/Header';
import {useGetProfile, useUpdateProfile} from './profilemutation';
import toast from 'react-hot-toast';
import {z} from 'zod';

// Zod schema for validation
const profileSchema = z.object({
  fullname: z.string().min(2, 'Full name must be at least 2 characters long'),
  dob: z.string().optional(),
  image: z.instanceof(File).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const EditPersonalInfo: React.FC = () => {
  const {data: profiledata, isLoading} = useGetProfile();
  const {mutate: updateProfile, isPending} = useUpdateProfile();

  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [formData, setFormData] = useState<
    ProfileFormData & {imagePreview?: string}
  >({
    fullname: '',
    dob: '',
    image: undefined,
    imagePreview: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data when profile data is loaded
  React.useEffect(() => {
    if (profiledata) {
      // Format date for date input (YYYY-MM-DD)
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
        image: undefined,
        imagePreview:
          profiledata?.user?.profileImage ||
          'https://images.unsplash.com/photo-1501973801540-537f08ccae7b?auto=format&fit=crop&w=400&q=80',
      });
    }
  }, [profiledata]);

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

    // Clear error when user starts typing
    if (errors[id]) {
      setErrors((prev) => ({...prev, [id]: ''}));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: file,
          imagePreview: reader.result as string,
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
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Update error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-background-light dark:bg-background-dark flex flex-1 flex-col">
        <Header title="Edit Personal Info" />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-gray-500">Loading profile data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark flex flex-1 flex-col">
      <Header title="Edit Personal Info" />

      <div className="no-scrollbar flex flex-1 flex-col items-center overflow-y-auto pb-6">
        {/* Profile Photo Section */}
        <section className="flex flex-col items-center px-6 pb-8 pt-4">
          <div
            className="group relative cursor-pointer"
            onClick={triggerFileInput}
          >
            <div
              className="h-32 w-32 rounded-full border-4 border-white bg-cover bg-center shadow-md dark:border-[#3a2e24]"
              style={{
                backgroundImage: `url('${formData.imagePreview}')`,
              }}
            />
            {/* Edit Badge */}
            <div className="border-background-light dark:border-background-dark absolute bottom-0 right-0 flex items-center justify-center rounded-full border-4 bg-primary p-2 text-white shadow-sm">
              <MdPhotoCamera className="text-[20px]" />
            </div>
          </div>
          <button
            type="button"
            onClick={triggerFileInput}
            className="mt-4 text-sm font-semibold text-primary transition-colors hover:text-orange-600 hover:underline"
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

          {formData.image && (
            <p className="mt-2 text-xs text-green-600">
              New image selected: {formData.image.name}
            </p>
          )}

          {errors.image && (
            <p className="mt-2 text-xs text-red-500">{errors.image}</p>
          )}
        </section>

        {/* Form Section */}
        <form
          className="flex w-full flex-1 flex-col gap-6 px-6"
          onSubmit={handleSubmit}
        >
          {/* Full Name Input */}
          <div className="flex flex-col gap-2">
            <label
              className="text-navy text-sm font-bold uppercase tracking-wider dark:text-slate-200"
              htmlFor="fullname"
            >
              Full Name
            </label>
            <div className="group relative">
              <input
                className={`text-navy placeholder-gray-400 w-full rounded-xl border bg-white px-4 py-4 text-base font-medium shadow-sm outline-none transition-all focus:ring-2 focus:ring-primary/50 dark:bg-[#2c241b] dark:text-white ${
                  errors.fullname
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-slate-200 focus:border-primary dark:border-[#443629]'
                }`}
                id="fullname"
                type="text"
                value={formData.fullname}
                onChange={handleInputChange}
                placeholder="Enter your full name"
              />
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-primary opacity-0 transition-opacity group-focus-within:opacity-100">
                <MdEdit />
              </div>
            </div>
            {errors.fullname && (
              <p className="text-sm text-red-500">{errors.fullname}</p>
            )}
          </div>

          {/* Date of Birth Input - Editable Date Selector */}
          <div className="flex flex-col gap-2">
            <label
              className="text-navy text-sm font-bold uppercase tracking-wider dark:text-slate-200"
              htmlFor="dob"
            >
              Date of Birth
            </label>
            <div className="relative">
              <input
                className="text-navy w-full rounded-xl border border-slate-200 bg-white px-4 py-4 pr-12 text-base font-medium shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/50 dark:border-[#443629] dark:bg-[#2c241b] dark:text-white"
                id="dob"
                type="date"
                value={formData.dob}
                onChange={handleInputChange}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <p className="px-1 text-xs text-slate-500 dark:text-slate-400">
              Select your date of birth
            </p>
          </div>

          {/* Account Number (Read-only with eye toggle) */}
          <div className="flex flex-col gap-2">
            <label
              className="text-navy flex items-center gap-2 text-sm font-bold uppercase tracking-wider dark:text-slate-200"
              htmlFor="account-number"
            >
              Account Number
              <MdLock
                className="text-gray-400 text-base"
                title="Secure field"
              />
            </label>
            <div className="relative">
              <input
                className="text-navy w-full rounded-xl border border-slate-200 bg-white px-4 py-4 pr-12 text-base font-medium tracking-widest shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/50 dark:border-[#443629] dark:bg-[#2c241b] dark:text-white"
                id="account-number"
                type="text"
                value={maskAccountNumber(profiledata?.accountNumber || '')}
                readOnly
              />
              <button
                className="absolute bottom-0 right-0 top-0 flex items-center justify-center px-4 text-primary transition-colors hover:text-orange-700"
                type="button"
                onClick={() => setShowAccountNumber(!showAccountNumber)}
                aria-label={
                  showAccountNumber
                    ? 'Hide account number'
                    : 'Show account number'
                }
              >
                {showAccountNumber ? (
                  <MdVisibilityOff className="text-xl" />
                ) : (
                  <MdVisibility className="text-xl" />
                )}
              </button>
            </div>
            <p className="px-1 text-xs text-slate-500 dark:text-slate-400">
              Your Account Number is encrypted for your security. Click the eye
              icon to reveal.
            </p>
          </div>

          {/* Action Button */}
          <div className="mt-auto w-full px-6 pb-6 pt-8">
            <button
              type="submit"
              disabled={isPending}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary text-lg font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
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
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPersonalInfo;
