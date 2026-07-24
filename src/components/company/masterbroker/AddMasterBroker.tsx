import { useAddBroker } from '@/lib/api/addbroker';
import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import GenericInputField from '@/components/Forms/Input/GenericInputField';
import { useAddMasterBrocker } from '@/lib/react-query/masterbroker';
import { X, ZoomIn } from 'lucide-react';
import toast from 'react-hot-toast';

// Zod Schema with proper validations
const BrokerSchema = z.object({
  // Required fields first
  fullname: z.string()
    .min(1, 'Full name is required'),

  phoneNumber: z.string()
    .min(10, 'Phone number must be exactly 10 digits')
    .max(10, 'Phone number must be exactly 10 digits')
    .regex(/^[0-9]{10}$/, 'Phone number must contain only digits'),

  password: z.string()
    .min(6, 'Password must be at least 6 characters'),

  area: z.string()
    .min(1, 'Area is required'),

  commission: z.coerce.number()
    .min(0, 'Commission must be a positive number'),

  customerLimit: z.coerce.number()
    .min(0, 'Customer limit must be a positive number'),

  // Optional fields
  aadharCardNumber: z.string()
    .optional()
    .refine(
      (val) => !val || (val.length === 12 && /^[0-9]{12}$/.test(val)),
      'Aadhar number must be exactly 12 digits'
    ),

  panCardNumber: z.string()
    .optional()
    .refine(
      (val) => !val || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val.toUpperCase()),
      'PAN card must be in format: ABCDE1234F'
    ),

  aadharCardF: z.any().optional(),
  panCard: z.any().optional(),
  photo: z.any().optional(),

  allowSlipage: z.boolean().default(false),
});

type FormValues = z.infer<typeof BrokerSchema>;

const AddMasterBroker = () => {
  const navigate = useNavigate();

  const methods = useForm<FormValues>({
    resolver: zodResolver(BrokerSchema),
    defaultValues: {
      fullname: '',
      phoneNumber: '',
      password: '',
      area: '',
      commission: 0,
      customerLimit: 0,
      aadharCardNumber: '',
      panCardNumber: '',
      aadharCardF: undefined,
      panCard: undefined,
      photo: undefined,
      allowSlipage: false,
    },
  });

  const { mutateAsync: addMasterBrocker, isPending } = useAddMasterBrocker();

  const [imagePreviews, setImagePreviews] = useState({
    aadharCardF: '',
    panCard: '',
    photo: '',
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Watch the allowSlipage field
  const allowSlipage = methods.watch('allowSlipage');

  // Convert image to base64
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'aadharCardF' | 'panCard' | 'photo',
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      methods.setError(field, {
        type: 'manual',
        message: 'Please upload a valid image file (JPEG, PNG)',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      methods.setError(field, {
        type: 'manual',
        message: 'Image size should be less than 5MB',
      });
      return;
    }

    // preview only
    const previewUrl = URL.createObjectURL(file);

    setImagePreviews((prev) => ({
      ...prev,
      [field]: previewUrl,
    }));

    // store FILE object in form
    methods.setValue(field, file, {
      shouldValidate: true,
    });

    // Clear any previous errors
    methods.clearErrors(field);
  };

  const removeImage = (field: 'aadharCardF' | 'panCard' | 'photo') => {
    setImagePreviews((prev) => ({
      ...prev,
      [field]: '',
    }));

    methods.setValue(field, undefined);
    methods.clearErrors(field);
  };

  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setShowImageModal(false);
  };

  // Handle phone number input - only allow digits
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      methods.setValue('phoneNumber', value);
      methods.clearErrors('phoneNumber');
    }
  };

  // Handle aadhar number input - only allow digits
  const handleAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 12) {
      methods.setValue('aadharCardNumber', value);
      methods.clearErrors('aadharCardNumber');
    }
  };

  // Handle PAN card input - auto uppercase and format
  const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 10) {
      methods.setValue('panCardNumber', value);
      methods.clearErrors('panCardNumber');
    }
  };

  // Handle slippage checkbox change
  const handleSlippageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    methods.setValue('allowSlipage', isChecked);
    methods.clearErrors('allowSlipage');
    console.log('Slippage allowed:', isChecked);
  };

  const handleSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);

      // Prepare the payload with proper field names
      const payload: any = {
        fullname: data.fullname.trim(),
        phoneNumber: data.phoneNumber,
        password: data.password,
        area: data.area.trim(),
        commission: data.commission,
        customerLimit: data.customerLimit,
        aadharCardNumber: data.aadharCardNumber || '',
        panCardNumber: data.panCardNumber || '',
        aadharCardF: data.aadharCardF,
        panCard: data.panCard,
        photo: data.photo,
        // IMPORTANT: Explicitly send allowSlipage as boolean
        allowSlipage: data.allowSlipage === true,
      };

      console.log('📤 Submitting payload:', payload);
      console.log('Slippage setting:', payload.allowSlipage ? 'ENABLED' : 'DISABLED');

      await addMasterBrocker(payload);

      methods.reset();
      setImagePreviews({
        aadharCardF: '',
        panCard: '',
        photo: '',
      });

      navigate({
        to: '/companybroker/display-master-broker',
      });
    } catch (error: any) {
      console.error('❌ Submit error:', error);
      toast.error(error?.response?.data?.message || 'Failed to register master broker');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ImageUploadField = ({
    label,
    field,
    required = false,
  }: {
    label: string;
    field: 'aadharCardF' | 'panCard' | 'photo';
    required?: boolean;
  }) => (
    <div className="mb-4">
      <label className="text-gray-700 mb-2 block text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        {imagePreviews[field] ? (
          <div className="group relative">
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
            <div className="flex flex-col items-center justify-center">
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
      {methods.formState.errors[field] && (
        <p className="mt-1 text-xs text-red-500">
          {methods.formState.errors[field]?.message as string}
        </p>
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen overflow-y-auto p-3 sm:p-4 md:p-6">
      <div className="mx-auto max-w-5xl rounded-lg bg-white shadow-lg">
        {/* Header */}
        <div className="rounded-t-lg bg-gradient-to-r from-orange-500 to-red-500 p-4 sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-xl font-bold text-white sm:text-2xl">
                Master Broker Registration
              </h1>
              <p className="mt-1 text-sm text-orange-100">
                Please fill in all required details
              </p>
            </div>

            <button
              onClick={() =>
                navigate({
                  to: '/companybroker/display-master-broker',
                })
              }
              className="hover:bg-gray-100 w-full rounded-lg bg-white px-4 py-2 text-sm font-medium text-orange-500 transition-all sm:w-auto"
            >
              Back to List
            </button>
          </div>
        </div>

        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(handleSubmit)}
            className="p-4 sm:p-6"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              {/* ===== REQUIRED FIELDS FIRST ===== */}

              {/* Full Name - Required */}
              <GenericInputField
                name="fullname"
                label="Full Name"
                type="text"
                required
                placeholder="Enter full name"
              />

              {/* Phone Number - Required */}
              <div>
                <GenericInputField
                  name="phoneNumber"
                  label="Phone Number"
                  type="tel"
                  required
                  placeholder="Enter 10-digit phone number"
                  onChange={handlePhoneNumberChange}
                />
                
              </div>

              {/* Password - Required */}
              <GenericInputField
                name="password"
                label="Password"
                type="password"
                required
                placeholder="Enter password (min 6 characters)"
              />

              {/* Area - Required */}
              <GenericInputField
                name="area"
                label="Area"
                required
                placeholder="Enter area"
              />

              {/* Commission - Required */}
              <GenericInputField
                name="commission"
                label="Commission (%)"
                type="number"
                required
                placeholder="Enter commission percentage"
              />

              {/* Customer Limit - Required */}
              <GenericInputField
                name="customerLimit"
                label="Trader Limit"
                type="number"
                required
                step="any"
                placeholder="Enter Trader Limit"
              />

              {/* ===== OPTIONAL FIELDS BELOW ===== */}

              {/* Aadhar Card Number - Optional */}
              <div>
                <GenericInputField
                  name="aadharCardNumber"
                  label="Aadhar Card Number (Optional)"
                  type="text"
                  placeholder="Enter 12-digit Aadhar number"
                  onChange={handleAadharChange}
                />
                {methods.formState.errors.aadharCardNumber && (
                  <p className="mt-1 text-xs text-red-500">
                    {methods.formState.errors.aadharCardNumber.message}
                  </p>
                )}
              </div>

              {/* PAN Card Number - Optional */}
              <div>
                <GenericInputField
                  name="panCardNumber"
                  label="PAN Card Number (Optional)"
                  type="text"
                  placeholder="Enter PAN card number (e.g., ABCDE1234F)"
                  onChange={handlePanChange}
                />
                {methods.formState.errors.panCardNumber && (
                  <p className="mt-1 text-xs text-red-500">
                    {methods.formState.errors.panCardNumber.message}
                  </p>
                )}
              </div>

              {/* Allow Slippage Checkbox - Optional */}
              <div className="col-span-1 sm:col-span-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="allowSlipage"
                    checked={allowSlipage}
                    onChange={handleSlippageChange}
                    className="h-4 w-4 cursor-pointer accent-orange-500"
                  />
                  <label
                    htmlFor="allowSlipage"
                    className="text-gray-700 cursor-pointer text-sm font-medium"
                  >
                    Allow Slippage Settings
                  </label>
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  {allowSlipage ? '✅ Slippage is ENABLED' : '❌ Slippage is DISABLED'}
                </p>
              </div>
            </div>

            {/* Image Uploads - Optional */}
            <div className="border-stroke mt-6 border-t pt-6 sm:mt-8">
              <h2 className="text-gray-800 mb-4 text-base font-semibold sm:text-lg">
                Upload Documents <span className="text-sm font-normal text-gray-500">(Optional)</span>
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
                <ImageUploadField
                  label="Aadhar Card Front"
                  field="aadharCardF"
                />
                <ImageUploadField label="PAN Card" field="panCard" />
                <ImageUploadField label="Logo" field="photo" />
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || isPending}
                className="w-full min-w-[200px] rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-6 py-2.5 text-sm font-medium text-white transition-all hover:from-orange-600 hover:to-red-600 disabled:opacity-50 sm:w-auto sm:text-base"
              >
                {isSubmitting || isPending
                  ? 'Submitting...'
                  : 'Register Master Broker'}
              </button>
            </div>
          </form>
        </FormProvider>
      </div>

      {/* Image Popup Modal */}
      {showImageModal && selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
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
              alt="Full size preview"
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AddMasterBroker;