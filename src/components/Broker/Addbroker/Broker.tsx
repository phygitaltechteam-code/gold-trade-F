import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { useAuthContext } from '@/context/AuthContext';
import { useBroker } from './brokerapi';
import { X, ZoomIn } from 'lucide-react';

// Define Zod schema for form data validation
const BrokerSchema = z.object({
  fullname: z.string().min(1, 'Full name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  area: z.string().min(1, 'Area is required'),
  commission: z.coerce.number().min(0, 'Commission must be a valid number'),
});

const Broker = () => {
  const navigate = useNavigate();
  const addbroker = useBroker();
  const { user } = useAuthContext();
  const isSuperBroker = user?.role === 'SUPERBROKER';

  const [formData, setFormData] = useState({
    fullname: '',
    password: '',
    area: '',
    commission: '',
    phoneNumber: '',
    aadharCardNumber: '',
    panCardNumber: '',
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

  // Searchable Dropdown state
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Mock super brokers
  const mockSuperBrokers = [
    { id: '1', SBID: 'SB-1001', fullname: 'Rajesh Kumar' },
    { id: '2', SBID: 'SB-1002', fullname: 'Priya Sharma' },
    { id: '3', SBID: 'SB-1003', fullname: 'Amit Patel' },
    { id: '4', SBID: 'SB-1004', fullname: 'Neha Gupta' },
  ];

  const filteredSuperBrokers = mockSuperBrokers.filter(
    (sb) =>
      sb.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sb.SBID.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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

  const resetForm = () => {
    setFormData({
      fullname: '',
      password: '',
      area: '',
      commission: '',
      phoneNumber: '',
      aadharCardNumber: '',
      panCardNumber: '',
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.fullname) {
      toast.error('Full name is required');
      return;
    }
    if (!formData.password) {
      toast.error('Password is required');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (!formData.phoneNumber) {
      toast.error('Phone number is required');
      return;
    }
    if (!formData.area) {
      toast.error('Area is required');
      return;
    }

    // Validate commission is a valid number
    let commissionValue = 0;
    if (formData.commission) {
      commissionValue = parseFloat(formData.commission);
      if (isNaN(commissionValue)) {
        toast.error('Commission must be a valid number');
        return;
      }
    } else {
      toast.error('Commission is required');
      return;
    }

    setIsSubmitting(true);

    const formDataToSend = new FormData();
    formDataToSend.append('fullname', formData.fullname);
    formDataToSend.append('password', formData.password);
    formDataToSend.append('phoneNumber', formData.phoneNumber);
    formDataToSend.append('aadharCardNumber', formData.aadharCardNumber);
    formDataToSend.append('panCardNumber', formData.panCardNumber);

    if (images.aadharCardF) {
      formDataToSend.append('aadharCardF', images.aadharCardF);
    }
    if (images.panCard) {
      formDataToSend.append('panCard', images.panCard);
    }

    formDataToSend.append('commission', commissionValue);
    formDataToSend.append('area', formData.area);

    try {
      await addbroker.mutateAsync(formDataToSend);
      resetForm();
    } catch (error) {
      console.error('Submission error:', error);
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
              className="border-gray-300 h-24 w-24 cursor-pointer rounded-lg border-2 object-cover sm:h-32 sm:w-32"
              onClick={() => openImageModal(imagePreviews[field])}
            />
            <button
              type="button"
              onClick={() => removeImage(field)}
              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
            <button
              type="button"
              onClick={() => openImageModal(imagePreviews[field])}
              className="absolute bottom-1 right-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
            >
              <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
        ) : (
          <label className="border-gray-300 bg-gray-50 hover:bg-gray-100 flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed sm:h-32 sm:w-32">
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
    <div className="bg-gray-50 min-h-screen overflow-y-auto p-3 sm:p-4 md:p-6">
      <div className="mx-auto max-w-4xl rounded-lg bg-white shadow-lg">
        {/* Header */}
        <div className="rounded-t-lg bg-gradient-to-r from-orange-500 to-red-500 p-4 sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-xl font-bold text-white sm:text-2xl">
                Broker Registration
              </h1>
              <p className="mt-1 text-sm text-orange-100">
                Please fill in all the required information
              </p>
            </div>
            <button
              onClick={() =>
                navigate({
                  to: '/broker/displaybroker',
                })
              }
              className="hover:bg-gray-100 w-full rounded-lg bg-white px-4 py-2 text-sm font-medium text-orange-500 transition-all sm:w-auto"
            >
              Back to List
            </button>
          </div>
        </div>

        {/* Form */}
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
                className={`w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 sm:text-base ${
                  errors.fullname ? 'border-red-500' : 'border-gray-300'
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
                className={`w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 sm:text-base ${
                  errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter 10-digit phone number"
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-xs text-red-500">{errors.phoneNumber}</p>
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
                className={`w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 sm:text-base ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter password (min 6 characters)"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Aadhar Card Number */}
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
                className={`w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 sm:text-base ${
                  errors.aadharCardNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter 12-digit Aadhar number"
              />
              {errors.aadharCardNumber && (
                <p className="mt-1 text-xs text-red-500">{errors.aadharCardNumber}</p>
              )}
            </div>

            {/* PAN Card Number */}
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
                <p className="mt-1 text-xs text-red-500">{errors.panCardNumber}</p>
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
                className={`w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 sm:text-base ${
                  errors.area ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter Area"
              />
              {errors.area && (
                <p className="mt-1 text-xs text-red-500">{errors.area}</p>
              )}
            </div>

            {/* Commission - Required */}
            <div className="mb-2 sm:mb-4">
              <label className="text-gray-700 mb-1 block text-sm font-medium sm:mb-2">
                Commission % <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="commission"
                value={formData.commission}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className={`w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 sm:text-base ${
                  errors.commission ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter Commission %"
              />
              {errors.commission && (
                <p className="mt-1 text-xs text-red-500">{errors.commission}</p>
              )}
            </div>
          </div>

          {/* Document Upload Section - Side by side on mobile */}
          <div className="border-gray-200 mt-6 border-t pt-6">
            <h2 className="text-gray-800 mb-4 text-base font-semibold sm:text-lg">
              Document Upload
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-6">
              <ImageUploadField
                label="Aadhar Card"
                field="aadharCardF"
                required
              />
              <ImageUploadField
                label="PAN Card"
                field="panCard"
                required={false}
              />
            </div>
          </div>

          {/* Review Section - Side by side on mobile */}
          {(imagePreviews.aadharCardF || imagePreviews.panCard) && (
            <div className="bg-gray-50 mt-6 rounded-lg p-4">
              <h3 className="text-gray-800 text-md mb-3 font-semibold">
                Review Uploaded Images
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {imagePreviews.aadharCardF && (
                  <div>
                    <p className="text-gray-600 mb-1 text-xs sm:text-sm">
                      Aadhar Card:
                    </p>
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
                    <p className="text-gray-600 mb-1 text-xs sm:text-sm">
                      PAN Card:
                    </p>
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

          {/* Submit Button - Right aligned */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || addbroker.isPending}
              className="w-full min-w-[200px] rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-6 py-2.5 text-sm font-medium text-white transition-all hover:from-orange-600 hover:to-red-600 disabled:opacity-50 sm:w-auto sm:text-base"
            >
              {isSubmitting || addbroker.isPending
                ? 'Submitting...'
                : 'Register Broker'}
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
              className="text-gray-800 hover:bg-gray-100 absolute -right-2 -top-2 rounded-full bg-white p-1"
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

export default Broker;