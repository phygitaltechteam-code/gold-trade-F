import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { useAuthContext } from '@/context/AuthContext';
import { useBroker } from './brokerapi';
import { X, ZoomIn } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import GenericInputField from '@/components/Forms/Input/GenericInputField';

// Define Zod schema
const BrokerSchema = z.object({
  fullname: z.string().min(1, 'Full name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phoneNumber: z.string()
    .min(10, 'Phone number must be exactly 10 digits')
    .max(10, 'Phone number must be exactly 10 digits')
    .regex(/^[0-9]{10}$/, 'Phone number must contain only digits'),
  area: z.string().min(1, 'Area is required'),
  commission: z.coerce.number().min(0, 'Commission must be a valid number'),
  aadharCardNumber: z.string().optional(),
  panCardNumber: z.string().optional(),
});

type FormValues = z.infer<typeof BrokerSchema>;

const Broker = () => {
  const navigate = useNavigate();
  const addbroker = useBroker();
  const { user } = useAuthContext();

  // Initialize react-hook-form
  const methods = useForm<FormValues>({
    resolver: zodResolver(BrokerSchema),
    defaultValues: {
      fullname: '',
      password: '',
      area: '',
      commission: 0,
      phoneNumber: '',
      aadharCardNumber: '',
      panCardNumber: '',
    },
  });

  const { setValue, formState: { errors, isSubmitting: isFormSubmitting } } = methods;

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ===== HANDLER FUNCTIONS =====

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setValue('phoneNumber', value);
    }
  };

  const handleAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 12) {
      setValue('aadharCardNumber', value);
    }
  };

  const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 10) {
      setValue('panCardNumber', value);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image file (JPEG, PNG)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
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
    }
  };

  const removeImage = (field: string) => {
    setImages((prev) => ({
      ...prev,
      [field]: null,
    }));
    setImagePreviews((prev) => ({
      ...prev,
      [field]: null,
    }));
  };

  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setShowImageModal(false);
  };

  const resetForm = () => {
    methods.reset();
    setImages({
      aadharCardF: null,
      panCard: null,
    });
    setImagePreviews({
      aadharCardF: null,
      panCard: null,
    });
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    const formDataToSend = new FormData();
    formDataToSend.append('fullname', data.fullname);
    formDataToSend.append('password', data.password);
    formDataToSend.append('phoneNumber', data.phoneNumber);
    formDataToSend.append('aadharCardNumber', data.aadharCardNumber || '');
    formDataToSend.append('panCardNumber', data.panCardNumber || '');
    formDataToSend.append('commission', data.commission.toString());
    formDataToSend.append('area', data.area);

    if (images.aadharCardF) {
      formDataToSend.append('aadharCardF', images.aadharCardF);
    }
    if (images.panCard) {
      formDataToSend.append('panCard', images.panCard);
    }

    try {
      await addbroker.mutateAsync(formDataToSend);
      resetForm();
      toast.success('Broker registered successfully!');
      navigate({ to: '/broker/displaybroker' });
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error?.response?.data?.message || 'Failed to register broker');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ImageUploadField = ({ label, field, required }: { label: string; field: string; required: boolean }) => (
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
        <p className="mt-1 text-xs text-red-500">{errors[field]?.message as string}</p>
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

        {/* Form with FormProvider */}
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              {/* Full Name */}
              <GenericInputField
                name="fullname"
                label="Full Name"
                type="text"
                required
                placeholder="Enter full name"
              />

              {/* Phone Number */}
              <div>
                <GenericInputField
                  name="phoneNumber"
                  label="Phone Number"
                  type="tel"
                  required
                  placeholder="Enter 10-digit phone number"
                  onChange={handlePhoneNumberChange}
                  maxLength={10}
                />

              </div>

              {/* Password */}
              <GenericInputField
                name="password"
                label="Password"
                type="password"
                required
                placeholder="Enter password (min 6 characters)"
              />

              {/* Area */}
              <GenericInputField
                name="area"
                label="Area"
                required
                placeholder="Enter area"
              />

              {/* Commission */}
              <GenericInputField
                name="commission"
                label="Commission (%)"
                type="number"
                required
                placeholder="Enter commission percentage (0-100)"
              />

              {/* Aadhar Card Number - Optional */}
              <GenericInputField
                name="aadharCardNumber"
                label="Aadhar Card Number (Optional)"
                type="text"
                placeholder="Enter 12-digit Aadhar number"
                onChange={handleAadharChange}
              />

              {/* PAN Card Number - Optional */}
              <GenericInputField
                name="panCardNumber"
                label="PAN Card Number (Optional)"
                type="text"
                placeholder="Enter PAN card number (e.g., ABCDE1234F)"
                onChange={handlePanChange}
              />
            </div>

            {/* Document Upload Section */}
            <div className="border-gray-200 mt-6 border-t pt-6">
              <h2 className="text-gray-800 mb-4 text-base font-semibold sm:text-lg">
                Document Upload <span className="text-sm font-normal text-gray-500">(Optional)</span>
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

            {/* Submit Button */}
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
        </FormProvider>
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

export default Broker;