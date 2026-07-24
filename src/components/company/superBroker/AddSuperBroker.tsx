import { useAddBroker } from '@/lib/api/addbroker';
import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import GenericInputField from '@/components/Forms/Input/GenericInputField';
import { useAddSuperBrocker } from '@/lib/react-query/superbrocker';
import { X, ZoomIn } from 'lucide-react';

// Zod Schema
const BrokerSchema = z.object({
  fullname: z.string().min(1, 'Full name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phoneNumber: z.string().min(1, 'Phone number is required')
    .length(10, 'Phone number must be exactly 10 digits')
    .regex(/^[0-9]{10}$/, 'Phone number must contain only digits'),
  commission: z.coerce.number(),
  area: z.string().min(1, 'Area is required'),
  aadharCardNumber: z.string().optional(),
  panCardNumber: z.string().optional(),
  aadharCardF: z.any().optional(),
  panCard: z.any().optional(),
  photo: z.any().optional(),
});

type FormValues = z.infer<typeof BrokerSchema>;

const AddSuperBroker = () => {
  const navigate = useNavigate();
  const addbroker = useAddBroker();

  const methods = useForm<FormValues>({
    resolver: zodResolver(BrokerSchema),
    defaultValues: {
      aadharCardF: undefined,
      panCard: undefined,
      photo: undefined,
      aadharCardNumber: '',
      panCardNumber: '',
    },
  });

  const { mutateAsync: addSuperBrocker, isPending } = useAddSuperBrocker();

  const [imagePreviews, setImagePreviews] = useState({
    aadharCardF: '',
    panCard: '',
    photo: '',
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);

      await addSuperBrocker({
        data,
      });

      methods.reset();
      setImagePreviews({
        aadharCardF: '',
        panCard: '',
        photo: '',
      });

      navigate({
        to: '/companybroker/DisplaySuperBroker',
      });
    } catch (error) {
      console.log(error);
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
                Super Broker Registration.
              </h1>
              <p className="mt-1 text-sm text-orange-100">
                Please fill in all required details
              </p>
            </div>

            <button
              onClick={() =>
                navigate({
                  to: '/companybroker/DisplaySuperBroker',
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
              <GenericInputField
                name="fullname"
                label="Full Name"
                type="text"
                required
                placeholder="Enter full name"
              />

              <GenericInputField
                name="phoneNumber"
                label="Phone Number"
                type="tel"
                required
                placeholder="Enter phone number"
                maxLength={10}
              />

              <GenericInputField
                name="password"
                label="Password"
                type="password"
                required
                placeholder="Enter password (min 6 characters)"
              />

              <GenericInputField
                name="area"
                label="Area"
                required
                placeholder="Enter area"
              />

              <GenericInputField
                name="commission"
                label="Commission (%)"
                type="number"
                // required
                placeholder="Enter commission percentage"
              />

              <GenericInputField
                name="aadharCardNumber"
                label="Aadhar Card Number (Optional)"
                type="text"
                placeholder="Enter aadhar card number"
              />

              <GenericInputField
                name="panCardNumber"
                label="PAN Card Number (Optional)"
                type="text"
                placeholder="Enter PAN card number"
              />
            </div>

            {/* Image Uploads */}
            <div className="border-gray-200 mt-6 border-t pt-6 sm:mt-8">
              <h2 className="text-gray-800 mb-4 text-base font-semibold sm:text-lg">
                Upload Documents
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
                  : 'Register Super Broker'}
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

export default AddSuperBroker;
