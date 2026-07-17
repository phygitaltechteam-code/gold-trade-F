import { useAddBroker } from '@/lib/api/addbroker';
import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { useAuthContext } from '@/context/AuthContext';
import { X, ZoomIn } from 'lucide-react';
import { useApproveBroker, useUpdateBroker } from '@/lib/api/addbroker';
import { useParams } from '@tanstack/react-router';
import { Route } from '@/routes/_app/companybroker/pendingbrokerby.$id';
import { useGetPendingBrokers } from '@/lib/api/customer';
import { useGetAllSuperBrocker } from '@/lib/react-query/superbrocker';

// Define Zod schema for form data validation
const BrokerSchema = z.object({
  fullname: z.string().min(1, 'Full name is required'),
  password: z.string().optional(),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  superBrokerId: z.string().min(1, 'Please select a Super Broker'),
  area: z.string().min(1, 'Area is required'),
  commission: z.coerce.number().min(0, 'Commission must be a valid number'),
  aadharCardNumber: z.string().optional(),
  panCardNumber: z.string().optional(),
});

const PendingBrokerByid = () => {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const isSuperBroker = user?.role === 'SUPERBROKER';

  // Queries and Mutations
  const {
    data: brokerData,
    isLoading: isLoadingBroker,
    refetch,
  } = useGetPendingBrokers(id);
  const { data: superBrokersData } = useGetAllSuperBrocker();
  const updateBrokerMutation = useUpdateBroker();
  const approveBrokerMutation = useApproveBroker();

  const [formData, setFormData] = useState({
    fullname: '',
    password: '',
    area: '',
    commission: '',
    phoneNumber: '',
    aadharCardNumber: '',
    panCardNumber: '',
    superBrokerId: '',
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
  const [isEditing, setIsEditing] = useState(false);

  // Searchable Dropdown state
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Get super brokers from API response
  const superBrokersList =
    superBrokersData?.data?.data || superBrokersData?.data || [];



  // Populate form with broker data when loaded
  useEffect(() => {
    if (brokerData) {
      const broker = brokerData;
      setFormData({
        fullname: broker.fullname || '',
        password: '', // Don't populate password for security
        area: broker.area || '',
        commission: broker.brokeragePercent?.toString() || '',
        phoneNumber: broker.phoneNumber || '',
        aadharCardNumber: broker.aadharCardNumber || '',
        panCardNumber: broker.panCardNumber || '',
        superBrokerId: broker.superBrokerId || '',
      });

      // Set image previews if they exist
      if (broker.aadharCardF) {
        setImagePreviews((prev) => ({
          ...prev,
          aadharCardF: broker.aadharCardF,
        }));
      }
      if (broker.panCard) {
        setImagePreviews((prev) => ({
          ...prev,
          panCard: broker.panCard,
        }));
      }
    }
  }, [brokerData]);

  useEffect(() => {
    if (isSuperBroker && user) {
      setFormData((prev) => ({
        ...prev,
        superBrokerId: user.id,
      }));
    }
  }, [isSuperBroker, user]);

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
      BrokerSchema.parse(formData);
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

  // Handle Update (Edit)
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const updateData = {
      fullname: formData.fullname,
      phoneNumber: formData.phoneNumber,
      area: formData.area,
      brokeragePercent: parseFloat(formData.commission),
      aadharCardNumber: formData.aadharCardNumber,
      panCardNumber: formData.panCardNumber,
      superBrokerId: formData.superBrokerId,
    };

    // Only include password if it's provided
    if (formData.password) {
      updateData.password = formData.password;
    }

    try {
      await updateBrokerMutation.mutateAsync({
        id: id,
        data: updateData,
      });

      toast.success('Broker updated successfully!');
      setIsEditing(false);
      await refetch();
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error?.response?.data?.message || 'Failed to update broker');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Approve
  const handleApprove = async () => {
    if (!formData.superBrokerId) {
      toast.error('Please select a Super Broker');
      return;
    }

    try {
      await approveBrokerMutation.mutateAsync({
        id: id,
        superBrokerId: formData.superBrokerId,
      });
      toast.success('Broker approved successfully!');
      navigate({ to: '/Approval/pendingapprovals' });
    } catch (error) {
      console.error('Approve error:', error);
      toast.error(error?.response?.data?.message || 'Failed to approve broker');
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
            {isEditing && (
              <>
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
              </>
            )}
          </div>
        ) : (
          isEditing && (
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
          )
        )}
      </div>
      {errors[field] && (
        <p className="mt-1 text-xs text-red-500">{errors[field]}</p>
      )}
    </div>
  );

  if (isLoadingBroker) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-3 sm:p-4 md:p-6">
      <div className="mx-auto max-w-4xl rounded-lg bg-white shadow-lg">
        {/* Header */}
        <div className="rounded-t-lg bg-gradient-to-r from-orange-500 to-red-500 p-4 sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-xl font-bold text-white sm:text-2xl">
                {isEditing ? 'Edit Broker' : 'Broker Details'}
              </h1>
              <p className="mt-1 text-sm text-orange-100">
                {isEditing
                  ? 'Edit broker information'
                  : 'Review broker details'}
              </p>
            </div>
            <div className="flex gap-2">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-600"
                >
                  Edit
                </button>
              )}
              <button
                onClick={() => navigate({ to: `/companybroker/BrokerProfile/${id}` })}
                className="hover:bg-gray-100 rounded-lg bg-white px-4 py-2 text-sm font-medium text-orange-500 transition-all"
              >
                Back to List
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="p-4 sm:p-6">
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
                disabled={!isEditing}
                className={`w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 sm:text-base ${!isEditing ? 'bg-gray-100' : 'bg-white'
                  } ${errors.fullname ? 'border-red-500' : 'border-gray-300'}`}
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
                disabled={!isEditing}
                maxLength={10}
                className={`w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 sm:text-base ${!isEditing ? 'bg-gray-100' : 'bg-white'
                  } ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter 10-digit phone number"
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            {/* Password - Only show when editing */}
            {isEditing && (
              <div className="mb-2 sm:mb-4">
                <label className="text-gray-700 mb-1 block text-sm font-medium sm:mb-2">
                  Password (Leave blank to keep current)
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="border-gray-300 w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 sm:text-base"
                  placeholder="Enter new password"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                )}
              </div>
            )}

            {/* Super Broker Dropdown */}
            <div className="relative mb-2 sm:mb-4">
              <label className="text-gray-700 mb-1 block text-sm font-medium sm:mb-2">
                Super Broker <span className="text-red-500">*</span>
              </label>
              {isSuperBroker ? (
                <input
                  type="text"
                  disabled
                  value={`${user?.fullname || 'Super Broker'} (Current User)`}
                  className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 p-2 font-semibold text-slate-500"
                />
              ) : (
                <select
                  name="superBrokerId"
                  value={formData.superBrokerId}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 sm:text-base ${!isEditing ? 'bg-gray-100' : 'bg-white'
                    } ${errors.superBrokerId ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="">Select Super Broker</option>
                  {superBrokersList.map((sb) => (
                    <option key={sb.id} value={sb.id}>
                      {sb.fullname} ({sb.BKId})
                    </option>
                  ))}
                </select>
              )}
              {errors.superBrokerId && !isSuperBroker && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.superBrokerId}
                </p>
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
                disabled={!isEditing}
                maxLength={12}
                className={`w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 sm:text-base ${!isEditing ? 'bg-gray-100' : 'bg-white'
                  }`}
                placeholder="Enter 12-digit Aadhar number"
              />
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
                disabled={!isEditing}
                maxLength={10}
                className={`w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 sm:text-base ${!isEditing ? 'bg-gray-100' : 'bg-white'
                  }`}
                placeholder="Enter PAN card number"
              />
            </div>

            {/* Area */}
            <div className="mb-2 sm:mb-4">
              <label className="text-gray-700 mb-1 block text-sm font-medium sm:mb-2">
                Area <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 sm:text-base ${!isEditing ? 'bg-gray-100' : 'bg-white'
                  } ${errors.area ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter Area"
              />
              {errors.area && (
                <p className="mt-1 text-xs text-red-500">{errors.area}</p>
              )}
            </div>

            {/* Commission */}
            <div className="mb-2 sm:mb-4">
              <label className="text-gray-700 mb-1 block text-sm font-medium sm:mb-2">
                Commission % <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="commission"
                value={formData.commission}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 sm:text-base ${!isEditing ? 'bg-gray-100' : 'bg-white'
                  } ${errors.commission ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter Commission %"
              />
              {errors.commission && (
                <p className="mt-1 text-xs text-red-500">{errors.commission}</p>
              )}
            </div>
          </div>

          {/* Document Upload Section - Only show when editing */}
          {isEditing && (
            <>
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
                    Uploaded Images
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {imagePreviews.aadharCardF && (
                      <div>
                        <p className="text-gray-600 mb-1 text-sm">
                          Aadhar Card:
                        </p>
                        <img
                          src={imagePreviews.aadharCardF}
                          alt="Aadhar Card"
                          className="h-20 w-20 cursor-pointer rounded-lg object-cover sm:h-24 sm:w-24"
                          onClick={() =>
                            openImageModal(imagePreviews.aadharCardF)
                          }
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
            </>
          )}

          {/* Buttons */}
          <div className="mt-8 flex justify-end gap-3">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg border px-6 py-2.5 text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-blue-500 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-600 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleApprove}
                className="rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-8 py-2.5 text-sm font-medium text-white shadow-lg shadow-orange-500/20 transition-all hover:from-orange-600 hover:to-red-600"
              >
                Approve Broker
              </button>
            )}
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

export default PendingBrokerByid;
