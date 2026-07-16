import { useAddCustomer } from '@/lib/api/addcustomer'; // Changed this import
// import { useGetBrokerData } from '@/lib/api/addbroker';
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { useAuthContext } from '@/context/AuthContext';
import { X, ZoomIn } from 'lucide-react';

// Define Zod schema for form data validation - ADDED stockHoldingLimit
const CustomerSchema = z.object({
  fullname: z.string().min(1, 'Full name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  masterBrokerId: z.string().min(1, 'Please select a Broker'),
  area: z.string().min(1, 'Area is required'),
  isDemo: z.boolean(),
  aadharCardNumber: z.string().optional(),
  panCardNumber: z.string().optional(),
  type: z.enum(['mega', 'mini'], {
    required_error: 'Please select a customer type',
    invalid_type_error: 'Type must be either mega or mini'
  }),
  stockHoldingLimit: z.string().optional(),
});

const CompanyAddCustomer = () => {
  const navigate = useNavigate();
  const addCustomer = useAddCustomer();
  const { user } = useAuthContext();
  const isMasterBroker = user?.role === 'MASTER_BROKER';

  const [formData, setFormData] = useState({
    fullname: '',
    password: '',
    area: '',
    isDemo: false,
    phoneNumber: '',
    aadharCardNumber: '',
    panCardNumber: '',
    masterBrokerId: '',
    type: '',
    stockHoldingLimit: '', // ADDED
  });

  const [images, setImages] = useState({
    aadharCardF: null,
    panCard: null,
  });

  const [imagePreviews, setImagePreviews] = useState({
    aadharCardF: null,
    panCard: null,
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (isMasterBroker && user) {
      setFormData((prev) => ({
        ...prev,
        masterBrokerId: user.id,
      }));
    }
  }, [isMasterBroker, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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

  const handleImageChange = (e, field) => {
    const file = e.target.files[0];
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
          [field]: reader.result,
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

  const removeImage = (field) => {
    setImages((prev) => ({
      ...prev,
      [field]: null,
    }));
    setImagePreviews((prev) => ({
      ...prev,
      [field]: null,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setShowImageModal(false);
  };

  const validateForm = () => {
    try {
      CustomerSchema.parse(formData);

      setErrors({});
      return true;
    } catch (error) {
      const formattedErrors = {};
      error.errors.forEach((err) => {
        formattedErrors[err.path[0]] = err.message;
      });
      setErrors(formattedErrors);
      const firstError = error.errors[0];
      toast.error(firstError.message);
      return false;
    }
  };

  const resetForm = () => {
    setFormData({
      fullname: '',
      password: '',
      area: '',
      isDemo: false,
      phoneNumber: '',
      aadharCardNumber: '',
      panCardNumber: '',
      masterBrokerId: '',
      type: '',
      stockHoldingLimit: '', // ADDED
    });
    setImages({
      aadharCardF: null,
      panCard: null,
    });
    setImagePreviews({
      aadharCardF: null,
      panCard: null,
    });
    setErrors({});
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const formDataToSend = new FormData();

    // ALL REQUIRED FIELDS
    formDataToSend.append('fullname', formData.fullname);
    formDataToSend.append('password', formData.password);
    formDataToSend.append('phoneNumber', formData.phoneNumber);
    formDataToSend.append('email', `${formData.phoneNumber}@temp.com`);
    formDataToSend.append('role', 'CUSTOMER');
    formDataToSend.append('isDemo', formData.isDemo);
    formDataToSend.append('type', formData.type);
    
    // ADDED - Send stockHoldingLimit to backend
    if (formData.stockHoldingLimit) {
      formDataToSend.append('stockHoldingLimit', formData.stockHoldingLimit);
    }

    // OPTIONAL FIELDS
    if (formData.aadharCardNumber) {
      formDataToSend.append('aadharCardNumber', formData.aadharCardNumber);
    }
    if (formData.panCardNumber) {
      formDataToSend.append('panCardNumber', formData.panCardNumber);
    }
    if (formData.area) {
      formDataToSend.append('area', formData.area);
    }
    if (formData.masterBrokerId) {
      formDataToSend.append('masterBrokerId', formData.masterBrokerId);
    }

    // IMAGES
    if (images.aadharCardF) {
      formDataToSend.append('aadharCard', images.aadharCardF);
    }
    if (images.panCard) {
      formDataToSend.append('panCard', images.panCard);
    }

    try {
      await addCustomer.mutateAsync(formDataToSend);
      resetForm();
      toast.success('Customer registered successfully!');
      navigate({ to: '/masterbroker/client-dashboard' });
    } catch (error: any) {
      console.error('Error:', error);
      const errorMsg = error?.response?.data?.message || 'Registration failed';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ImageUploadField = ({ label, field, required }) => (
    <div className="mb-4">
      <label className="text-gray-700 mb-2 block text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex flex-col items-start gap-4">
        {imagePreviews[field] ? (
          <div className="relative">
            <img
              src={imagePreviews[field]}
              alt={`${label} preview`}
              className="border-gray-300 h-24 w-24 cursor-pointer rounded-lg border-2 object-cover transition-transform hover:scale-105 sm:h-32 sm:w-32"
              onClick={() => openImageModal(imagePreviews[field])}
            />
            <button
              type="button"
              onClick={() => removeImage(field)}
              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white transition-all hover:scale-110 hover:bg-red-600"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
            <button
              type="button"
              onClick={() => openImageModal(imagePreviews[field])}
              className="absolute bottom-1 right-1 rounded-full bg-black/50 p-1 text-white transition-all hover:scale-110 hover:bg-black/70"
            >
              <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
        ) : (
          <label className="border-gray-300 bg-gray-50 hover:bg-gray-100 flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all hover:border-orange-400 sm:h-32 sm:w-32">
            <div className="flex flex-col items-center justify-center pb-6 pt-5">
              <svg
                className="text-gray-400 mb-2 h-6 w-6 sm:h-8 sm:w-8"
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
    <div className="bg-gray-50 min-h-screen p-3 sm:p-4 md:p-6">
      <div className="mx-auto max-w-4xl rounded-lg bg-white shadow-lg">
        {/* Header */}
        <div className="rounded-t-lg bg-gradient-to-r from-orange-500 to-red-500 p-4 sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-xl font-bold text-white sm:text-2xl">
                Trader Registration
              </h1>
              <p className="mt-1 text-sm text-orange-100">
                Please fill in all the required information
              </p>
            </div>
            <button
              onClick={() =>
                navigate({
                  to: '/masterbroker/client-dashboard',
                })
              }
              className="hover:bg-gray-100 w-full rounded-lg bg-white px-4 py-2 text-sm font-medium text-orange-500 transition-all sm:w-auto"
            >
              Back to List
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            {/* Full Name */}
            <div className="mb-2 sm:mb-4">
              <label className="text-gray-700 mb-1 block text-sm font-medium sm:mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleInputChange}
                className={`w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 sm:text-base ${errors.fullname ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter full name"
              />
              {errors.fullname && (
                <p className="mt-1 text-xs text-red-500">{errors.fullname}</p>
              )}
            </div>

            {/* Phone number */}
            <div className="mb-2 sm:mb-4">
              <label className="text-gray-700 mb-1 block text-sm font-medium sm:mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                maxLength={10}
                className={`w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 sm:text-base ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
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
            <div className="mb-2 sm:mb-4">
              <label className="text-gray-700 mb-1 block text-sm font-medium sm:mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 sm:text-base ${errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter password (min 6 characters)"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Customer Type - DROPDOWN */}
            <div className="mb-2 sm:mb-4">
              <label className="text-gray-700 mb-1 block text-sm font-medium sm:mb-2">
                Customer Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className={`w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 sm:text-base ${errors.type ? 'border-red-500' : 'border-gray-300'
                  }`}
              >
                <option value="">Select Customer Type</option>
                <option value="mega">Mega</option>
                <option value="mini">Mini</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-xs text-red-500">{errors.type}</p>
              )}
            </div>

            {/* Stock Holding Limit - NEW FIELD */}
            <div className="mb-2 sm:mb-4">
              <label className="text-gray-700 mb-1 block text-sm font-medium sm:mb-2">
                Stock Holding Limit
              </label>
              <input
                type="text"
                name="stockHoldingLimit"
                value={formData.stockHoldingLimit}
                onChange={handleInputChange}
                className={`w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 sm:text-base ${errors.stockHoldingLimit ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter stock holding limit"
              />
              {errors.stockHoldingLimit && (
                <p className="mt-1 text-xs text-red-500">{errors.stockHoldingLimit}</p>
              )}
            </div>

            {/* Aadhar Card Number - Optional */}
            <div className="mb-2 sm:mb-4">
              <label className="text-gray-700 mb-1 block text-sm font-medium sm:mb-2">
                Aadhar Card Number
              </label>
              <input
                type="text"
                name="aadharCardNumber"
                value={formData.aadharCardNumber}
                onChange={handleInputChange}
                maxLength={12}
                className={`w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 sm:text-base ${errors.aadharCardNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter 12-digit Aadhar number"
              />
              {errors.aadharCardNumber && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.aadharCardNumber}
                </p>
              )}
            </div>

            {/* PAN Card Number - Optional */}
            <div className="mb-2 sm:mb-4">
              <label className="text-gray-700 mb-1 block text-sm font-medium sm:mb-2">
                PAN Card Number
              </label>
              <input
                type="text"
                name="panCardNumber"
                value={formData.panCardNumber}
                onChange={handleInputChange}
                maxLength={10}
                className="border-gray-300 w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 sm:text-base"
                placeholder="Enter PAN card number (e.g., ABCDE1234F)"
              />
              {errors.panCardNumber && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.panCardNumber}
                </p>
              )}
            </div>

            {/* Area - Required */}
            <div className="mb-2 sm:mb-4">
              <label className="text-gray-700 mb-1 block text-sm font-medium sm:mb-2">
                Area <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                className={`w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 sm:text-base ${errors.area ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter Area"
              />
              {errors.area && (
                <p className="mt-1 text-xs text-red-500">{errors.area}</p>
              )}
            </div>

            {/* is demo check box */}
            <div className="mb-4 flex items-center gap-3">
              <input
                id="isDemo"
                type="checkbox"
                checked={formData.isDemo}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isDemo: e.target.checked,
                  }))
                }
                className="h-5 w-5 cursor-pointer accent-orange-500"
              />
              <label
                htmlFor="isDemo"
                className="text-gray-700 cursor-pointer text-sm font-medium"
              >
                Demo Account
              </label>
            </div>
          </div>

          {/* Document Upload Section */}
          <div className="border-gray-200 mt-6 border-t pt-6">
            <h2 className="text-gray-800 mb-4 text-base font-semibold sm:text-lg">
              Document Upload
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <ImageUploadField
                label="Aadhar Card"
                field="aadharCardF"
                required={false}
              />
              <ImageUploadField
                label="PAN Card"
                field="panCard"
                required={false}
              />
            </div>
          </div>

          {/* Review Section */}
          {(imagePreviews.aadharCardF || imagePreviews.panCard) && (
            <div className="bg-gray-50 mt-6 rounded-lg p-4">
              <h3 className="text-md text-gray-800 mb-3 font-semibold">
                Review Uploaded Images
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {imagePreviews.aadharCardF && (
                  <div>
                    <p className="text-gray-600 mb-1 text-sm">Aadhar Card:</p>
                    <img
                      src={imagePreviews.aadharCardF}
                      alt="Aadhar Card"
                      className="h-20 w-20 cursor-pointer rounded-lg object-cover sm:h-24 sm:w-24"
                      onClick={() => openImageModal(imagePreviews.aadharCardF)}
                    />
                  </div>
                )}
                {imagePreviews.panCard && (
                  <div>
                    <p className="text-gray-600 mb-1 text-sm">PAN Card:</p>
                    <img
                      src={imagePreviews.panCard}
                      alt="PAN Card"
                      className="h-20 w-20 cursor-pointer rounded-lg object-cover sm:h-24 sm:w-24"
                      onClick={() => openImageModal(imagePreviews.panCard)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="submit"
              disabled={isSubmitting || addCustomer.isPending}
              className="rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-8 py-2.5 text-sm font-medium text-white shadow-lg shadow-orange-500/20 transition-all hover:from-orange-600 hover:to-red-600 disabled:opacity-50"
            >
              {isSubmitting || addCustomer.isPending
                ? 'Submitting...'
                : 'Register Customer'}
            </button>
          </div>
        </form>
      </div>

      {/* Image Popup Modal */}
      {showImageModal && selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeImageModal}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <button
              onClick={closeImageModal}
              className="text-gray-800 hover:bg-gray-100 absolute -right-2 -top-2 rounded-full bg-white p-1 transition-all hover:scale-110"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={selectedImage}
              alt="Full size"
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyAddCustomer;