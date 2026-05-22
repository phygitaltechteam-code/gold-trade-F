import {useAddBroker} from '@/lib/api/addbroker';
import React, {useState} from 'react';
import {useNavigate} from '@tanstack/react-router';
import {z} from 'zod';
import {FormProvider, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import GenericInputField from '@/components/Forms/Input/GenericInputField';
import {useAddSuperBrocker} from '@/lib/react-query/superbrocker';

// Zod Schema
const BrokerSchema = z.object({
  fullname: z.string().min(1, 'Full name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  commission: z.coerce.number().optional(),
  address: z.string().optional(),
  aadharCardNumber: z.string().min(1),
  aadharCardF: z.any().optional(),
  aadharCardB: z.any().optional(),
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
      aadharCardB: undefined,
      photo: undefined,
    },
  });

  const {mutateAsync: addSuperBrocker, isPending} = useAddSuperBrocker();

  const [imagePreviews, setImagePreviews] = useState({
    aadharCardF: '',
    aadharCardB: '',
    photo: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convert image to base64
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'aadharCardF' | 'aadharCardB' | 'photo',
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

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
  };

  const removeImage = (field: 'aadharCardF' | 'aadharCardB' | 'photo') => {
    setImagePreviews((prev) => ({
      ...prev,
      [field]: '',
    }));

    methods.setValue(field, undefined);
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
        aadharCardB: '',
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
    field: 'aadharCardF' | 'aadharCardB' | 'photo';
    required?: boolean;
  }) => (
    <div className="mb-4">
      <label className="text-gray-700 mb-2 block text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="flex items-center gap-4">
        {imagePreviews[field] ? (
          <div className="relative">
            <img
              src={imagePreviews[field]}
              alt={`${label} preview`}
              className="border-gray-300 h-32 w-32 rounded-lg border-2 object-cover"
            />

            <button
              type="button"
              onClick={() => removeImage(field)}
              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
            >
              ✕
            </button>
          </div>
        ) : (
          <label className="border-gray-300 bg-gray-50 hover:bg-gray-100 flex h-25 w-25 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed">
            <div className="flex flex-col items-center justify-center">
              <span className="text-gray-500 text-sm">Upload</span>
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
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="rounded-lg bg-white shadow-lg">
        {/* Header */}
        <div className="border-b bg-gradient-to-r from-orange-500 to-red-500 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Broker Registration
              </h1>

              <p className="mt-1 text-orange-100">
                Please fill in all required details
              </p>
            </div>

            <button
              onClick={() =>
                navigate({
                  to: '/companybroker/DisplaySuperBroker',
                })
              }
              className="hover:bg-gray-100 rounded-lg bg-white px-4 py-2 text-orange-500 transition-all"
            >
              Back to List
            </button>
          </div>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleSubmit)} className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                type="number"
                required
                placeholder="Enter phone number"
              />

              <GenericInputField
                name="password"
                label="Password"
                type="password"
                required
              />

              <GenericInputField
                name="aadharCardNumber"
                label="Aadhar Card Number"
                required
                placeholder="Enter aadhar card number"
              />

              <GenericInputField
                name="address"
                label="Area"
                placeholder="Enter address"
              />

              <GenericInputField
                name="commission"
                label="Commission"
                type="number"
                placeholder="Enter commission"
              />
            </div>

            {/* Image Uploads */}
            <div className="mt-8">
              <h2 className="mb-4 text-lg font-semibold">Upload Documents</h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <ImageUploadField label="Aadhar Front" field="aadharCardF" />

                <ImageUploadField label="Aadhar Back" field="aadharCardB" />

                <ImageUploadField label="Profile Photo" field="photo" />
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting || isPending}
                className="flex-1 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-white transition-all hover:from-orange-600 hover:to-red-600 disabled:opacity-50"
              >
                {isSubmitting || isPending
                  ? 'Submitting...'
                  : 'Register Broker'}
              </button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default AddSuperBroker;
