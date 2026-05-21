import React, {useState, useEffect} from 'react';
import {useNavigate} from '@tanstack/react-router';
import toast from 'react-hot-toast';
import {z} from 'zod';
import {useAuthContext} from '@/context/AuthContext';
import {useMutation} from '@tanstack/react-query';
import {unAuthenticatedApi} from '@/utils/axios';

// Define Zod schema for client form data validation
const CustomerSchema = z.object({
  fullname: z.string().min(1, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  streetAddress: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  stateProvince: z.string().min(1, 'State is required'),
  postalCode: z.string().min(6, 'Pincode must be exactly 6 digits'),
});

const AddCustomer = () => {
  const navigate = useNavigate();
  const {user} = useAuthContext();
  const isBroker = user?.role === 'BROKER';

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phoneNumber: '',
    password: '',
    aadharCardNumber: '',
    commission: '',
    area: '',
    streetAddress: '',
    city: '',
    stateProvince: '',
    postalCode: '',
  });

  const [images, setImages] = useState({
    aadharCardF: null as File | null,
  });

  const [imagePreviews, setImagePreviews] = useState({
    aadharCardF: null as string | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const {name, value} = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Auto-fill city/state based on postal code
  useEffect(() => {
    const fetchPinDetails = async () => {
      if (formData.postalCode.length === 6) {
        try {
          const response = await fetch(
            `https://api.postalpincode.in/pincode/${formData.postalCode}`,
          );
          if (response.ok) {
            const data = await response.json();
            if (
              data[0]?.Status === 'Success' &&
              data[0]?.PostOffice?.length > 0
            ) {
              const firstPostOffice = data[0].PostOffice[0];
              setFormData((prev) => ({
                ...prev,
                city: firstPostOffice.District || prev.city,
                stateProvince: firstPostOffice.State || prev.stateProvince,
              }));
            }
          }
        } catch (error) {
          console.error('Failed to fetch pincode details', error);
        }
      }
    };
    fetchPinDetails();
  }, [formData.postalCode]);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'aadharCardF',
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          [field]: 'Please upload a valid image file (JPEG, PNG)',
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          [field]: 'Image size should be less than 5MB',
        }));
        return;
      }

      setImages((prev) => ({
        ...prev,
        [field]: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => ({
          ...prev,
          [field]: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);

      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: '',
        }));
      }
    }
  };

  const removeImage = (field: 'aadharCardF') => {
    setImages((prev) => ({
      ...prev,
      [field]: null,
    }));
    setImagePreviews((prev) => ({
      ...prev,
      [field]: null,
    }));
  };

  const validateForm = () => {
    try {
      CustomerSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(formattedErrors);
        toast.error(error.errors[0].message);
      }
      return false;
    }
  };

  const addCustomerMutation = useMutation({
    mutationFn: async (fd: FormData) => {
      const response = await unAuthenticatedApi.post('/users/register', fd);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Customer registered successfully!');
      navigate({to: '/broker/customerlist'});
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message || 'Failed to register customer';
      toast.error(msg);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const fd = new FormData();
    fd.append('fullname', formData.fullname);
    fd.append('email', formData.email);
    fd.append('username', formData.email.split('@')[0]);
    fd.append('password', formData.password);
    fd.append('phoneNumber', formData.phoneNumber);
    fd.append('address', formData.streetAddress);
    fd.append('city', formData.city);
    fd.append('state', formData.stateProvince);
    fd.append('country', 'India');
    fd.append('pincode', formData.postalCode);
    fd.append('commission', formData.commission);
    fd.append('area', formData.area);
    fd.append('securityPin', '123456'); // default secure pin
    fd.append('role', 'CUSTOMER');
    fd.append('brokerId', user?.id || 'mock-dev-id-999');

    if (images.aadharCardF) {
      fd.append('passport', images.aadharCardF); // matches passport/doc file
    }

    try {
      await addCustomerMutation.mutateAsync(fd);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ImageUploadField = ({
    label,
    field,
  }: {
    label: string;
    field: 'aadharCardF';
  }) => (
    <div className="mb-4">
      <label className="text-gray-700 mb-2 block text-sm font-medium">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="flex items-center gap-4">
        {imagePreviews[field] ? (
          <div className="relative">
            <img
              src={imagePreviews[field] || ''}
              alt={`${label} preview`}
              className="border-gray-300 h-32 w-32 rounded-lg border-2 object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage(field)}
              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ) : (
          <label className="border-gray-300 bg-gray-50 hover:bg-gray-100 flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed">
            <div className="flex flex-col items-center justify-center pb-6 pt-5">
              <svg
                className="text-gray-400 mb-3 h-8 w-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="text-gray-500 text-xs">Upload</span>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageChange(e, field)}
            />
          </label>
        )}
      </div>
      {errors[field] && (
        <p className="mt-1 text-xs text-red-500">{errors[field]}</p>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="rounded-lg bg-white shadow-lg">
        <div className="border-gray-200 border-b bg-gradient-to-r from-orange-500 to-red-500 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Customer Registration
              </h1>
              <p className="mt-1 text-orange-100">
                Register a new client under your direct network
              </p>
            </div>
            <button
              onClick={() => navigate({to: '/broker/customerlist'})}
              className="hover:bg-gray-100 rounded-lg bg-white px-4 py-2 font-semibold text-orange-500 transition-all"
            >
              Back to List
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Full Name */}
            <div className="mb-2">
              <label className="text-gray-700 mb-2 block text-sm font-medium">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleInputChange}
                className={`w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.fullname ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter full name"
              />
              {errors.fullname && (
                <p className="mt-1 text-xs text-red-500">{errors.fullname}</p>
              )}
            </div>

            {/* Email */}
            <div className="mb-2">
              <label className="text-gray-700 mb-2 block text-sm font-medium">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Phone number */}
            <div className="mb-2">
              <label className="text-gray-700 mb-2 block text-sm font-medium">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                maxLength={10}
                className={`w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter 10-digit phone number"
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="mb-2">
              <label className="text-gray-700 mb-2 block text-sm font-medium">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter password (min 6 characters)"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Locked Broker Name */}
            <div className="mb-2">
              <label className="text-gray-700 mb-2 block text-sm font-medium">
                Assigned Broker
              </label>
              <input
                type="text"
                disabled
                value={`${user?.fullname || 'Mock Broker'} (Broker)`}
                className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 p-2 font-semibold text-slate-500"
              />
            </div>

            {/* Aadhar Card Number */}
            <div className="mb-2">
              <label className="text-gray-700 mb-2 block text-sm font-medium">
                Aadhar Card Number
              </label>
              <input
                type="text"
                name="aadharCardNumber"
                value={formData.aadharCardNumber}
                onChange={handleInputChange}
                maxLength={12}
                className="border-gray-300 w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter 12-digit Aadhar number"
              />
            </div>

            {/* Commission % */}
            <div className="mb-2">
              <label className="text-gray-700 mb-2 block text-sm font-medium">
                Commission %
              </label>
              <input
                type="text"
                name="commission"
                value={formData.commission}
                onChange={handleInputChange}
                className="border-gray-300 w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter Commission %"
              />
            </div>

            {/* Area */}
            <div className="mb-2">
              <label className="text-gray-700 mb-2 block text-sm font-medium">
                Area
              </label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                className="border-gray-300 w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter Area"
              />
            </div>
          </div>

          {/* Address Fields */}
          <div className="border-gray-200 mt-6 border-t pt-4">
            <h2 className="text-gray-800 text-md mb-4 font-semibold">
              Client Address Details
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="mb-2 md:col-span-2">
                <label className="text-gray-700 mb-2 block text-sm font-medium">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                  rows={2}
                  className={`w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.streetAddress ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter street address"
                />
                {errors.streetAddress && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.streetAddress}
                  </p>
                )}
              </div>

              <div className="mb-2">
                <label className="text-gray-700 mb-2 block text-sm font-medium">
                  Postal / Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  maxLength={6}
                  className={`w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.postalCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter 6-digit pin code"
                />
                {errors.postalCode && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.postalCode}
                  </p>
                )}
              </div>

              <div className="mb-2">
                <label className="text-gray-700 mb-2 block text-sm font-medium">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter city"
                />
                {errors.city && (
                  <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                )}
              </div>

              <div className="mb-2">
                <label className="text-gray-700 mb-2 block text-sm font-medium">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="stateProvince"
                  value={formData.stateProvince}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.stateProvince ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter state"
                />
                {errors.stateProvince && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.stateProvince}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Document Section */}
          <div className="border-gray-200 mt-6 border-t pt-4">
            <h2 className="text-gray-800 text-md mb-4 font-semibold">
              Document Verification
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <ImageUploadField label="Aadhar Card Front" field="aadharCardF" />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="mt-6 flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting || addCustomerMutation.isPending}
              className="flex-1 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2.5 font-semibold text-white shadow-md transition-all hover:scale-[1.01] hover:from-orange-600 hover:to-red-600 disabled:opacity-50"
            >
              {isSubmitting || addCustomerMutation.isPending
                ? 'Submitting...'
                : 'Register Customer'}
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  fullname: '',
                  email: '',
                  phoneNumber: '',
                  password: '',
                  aadharCardNumber: '',
                  commission: '',
                  area: '',
                  streetAddress: '',
                  city: '',
                  stateProvince: '',
                  postalCode: '',
                })
              }
              className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg border px-6 py-2.5 font-semibold transition-all"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomer;
