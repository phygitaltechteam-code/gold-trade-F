import { useAddCustomer } from '@/lib/api/addcustomer';
import { useGetBrokerData } from '@/lib/api/addbroker';
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthContext } from '@/context/AuthContext';
import { X, ZoomIn } from 'lucide-react';
import GenericInputField from '@/components/Forms/Input/GenericInputField';
import { formatIndianCurrency } from '@/utils/formatIndianNumber';
import GenericDropdown from '../Forms/DropDown/GenericDropDown';

// Define Zod schema for form data validation
const CustomerSchema = z.object({
  fullname: z.string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Full name can only contain letters, spaces, hyphens, and apostrophes'),

  phoneNumber: z.string()
    .min(10, 'Phone number must be exactly 10 digits')
    .max(10, 'Phone number must be exactly 10 digits')
    .regex(/^[0-9]{10}$/, 'Phone number must contain only digits'),

  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(20, 'Password must be less than 20 characters')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least one letter and one number'),

  BrokerId: z.string().min(1, 'Please select a Broker'),

  area: z.string()
    .min(1, 'Area is required')
    .max(100, 'Area must be less than 100 characters'),

  isDemo: z.boolean(),

  type: z.enum(['mega', 'mini'], {
    required_error: 'Please select a customer type',
    invalid_type_error: 'Type must be either mega or mini',
  }),

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

  stockHoldingLimit: z.coerce.number()
    .int('Stock holding limit must be a whole number')
    .min(0, 'Stock holding limit must be a positive number')
    .optional(),

  walletBalance: z.coerce.number()
    .min(0, 'Wallet balance must be a positive number')
    .optional(),

  intradayLeverage: z.coerce.number()
    .min(0, 'Intraday leverage must be a positive number')
    .optional(),

  deliveryLeverage: z.coerce.number()
    .min(0, 'Delivery leverage must be a positive number')
    .optional(),
});

type FormValues = z.infer<typeof CustomerSchema>;

const CompanyAddCustomer = () => {
  const navigate = useNavigate();
  const addCustomer = useAddCustomer();
  const { user } = useAuthContext();
  const isSuperBroker = user?.role === 'SUPERBROKER';

  const methods = useForm<FormValues>({
    resolver: zodResolver(CustomerSchema),
    defaultValues: {
      fullname: '',
      password: '',
      area: '',
      phoneNumber: '',
      aadharCardNumber: '',
      panCardNumber: '',
      BrokerId: '',
      isDemo: false,
      type: '',
      stockHoldingLimit: 10,
      walletBalance: 0,
      intradayLeverage: 300,
      deliveryLeverage: 1,
    },
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: allbrockers } = useGetBrokerData();

  // Extract brokers array from the nested response
  const brokers = useMemo(() => {
    if (!allbrockers) return [];
    if (allbrockers.data?.data) return allbrockers.data.data;
    if (allbrockers.data) return allbrockers.data;
    if (Array.isArray(allbrockers)) return allbrockers;
    return [];
  }, [allbrockers]);

  // Format brokers for dropdown
  const brokerOptions = brokers.map((b) => ({
    id: b.id,
    label: b.fullname || b.user?.fullname || 'Unknown',
    subLabel: b.BKId || 'N/A',
  }));

  // Get values for calculations - STATIC WALLET BALANCE (1 Crore)
  const STATIC_WALLET_BALANCE = 100000; // ₹10,00,00 (10 Lakh)
  const intradayLeverage = methods.watch('intradayLeverage') || 0;
  const deliveryLeverage = methods.watch('deliveryLeverage') || 0;

  // Calculate max trade values using static wallet balance
  const maxIntradayTrade = STATIC_WALLET_BALANCE * Number(intradayLeverage);
  const maxDeliveryTrade = STATIC_WALLET_BALANCE * Number(deliveryLeverage);

  useEffect(() => {
    if (isSuperBroker && user) {
      methods.setValue('BrokerId', user.id);
    }
  }, [isSuperBroker, user]);

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

  // Handle stock holding limit - add 'min' suffix display
  const handleStockHoldingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 3) {
      methods.setValue('stockHoldingLimit', Number(value));
      methods.clearErrors('stockHoldingLimit');
    }
  };

  const handleImageChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        methods.setError(field, {
          type: 'manual',
          message: 'Please upload a valid image file (JPEG, PNG)',
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        methods.setError(field, {
          type: 'manual',
          message: 'Image size should be less than 5MB',
        });
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

      methods.clearErrors(field);
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
    methods.clearErrors(field);
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
    try {
      setIsSubmitting(true);

      const formDataToSend = new FormData();

      // ALL REQUIRED FIELDS
      formDataToSend.append('fullname', data.fullname.trim());
      formDataToSend.append('password', data.password);
      formDataToSend.append('phoneNumber', data.phoneNumber);
      formDataToSend.append('email', `${data.phoneNumber}@temp.com`);
      formDataToSend.append('role', 'CUSTOMER');
      formDataToSend.append('isDemo', String(data.isDemo));
      formDataToSend.append('type', data.type);

      if (data.stockHoldingLimit) {
        formDataToSend.append('stockHoldingLimit', String(data.stockHoldingLimit));
      }

      // NEW FIELDS
      if (data.walletBalance) {
        formDataToSend.append('walletBalance', String(data.walletBalance));
      }
      if (data.intradayLeverage) {
        formDataToSend.append('intradayLeverage', String(data.intradayLeverage));
      }
      if (data.deliveryLeverage) {
        formDataToSend.append('deliveryLeverage', String(data.deliveryLeverage));
      }

      // OPTIONAL FIELDS
      if (data.aadharCardNumber) {
        formDataToSend.append('aadharCardNumber', data.aadharCardNumber);
      }
      if (data.panCardNumber) {
        formDataToSend.append('panCardNumber', data.panCardNumber);
      }
      if (data.area) {
        formDataToSend.append('area', data.area.trim());
      }
      if (data.BrokerId) {
        formDataToSend.append('brokerId', data.BrokerId);
      }

      // IMAGES
      if (images.aadharCardF) {
        formDataToSend.append('aadharCard', images.aadharCardF);
      }
      if (images.panCard) {
        formDataToSend.append('panCard', images.panCard);
      }

      await addCustomer.mutateAsync(formDataToSend);
      resetForm();
      toast.success('Customer registered successfully!');
      navigate({ to: '/clients/mainpage' });
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
      {methods.formState.errors[field] && (
        <p className="mt-1 text-xs text-red-500">
          {methods.formState.errors[field]?.message as string}
        </p>
      )}
    </div>
  );

  // Handle intraday margin change with X suffix
  const handleIntradayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace('X', '').trim();
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      methods.setValue('intradayLeverage', numValue);
      methods.clearErrors('intradayLeverage');
    }
  };

  // Handle delivery margin change with X suffix
  const handleDeliveryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace('X', '').trim();
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      methods.setValue('deliveryLeverage', numValue);
      methods.clearErrors('deliveryLeverage');
    }
  };

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
                  to: '/clients/mainpage',
                })
              }
              className="hover:bg-gray-100 w-full rounded-lg bg-white px-4 py-2 text-sm font-medium text-orange-500 transition-all sm:w-auto"
            >
              Back to List
            </button>
          </div>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="p-4 sm:p-6">
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
                  maxLength={10}
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

              {/* Broker Dropdown - Required */}
              {isSuperBroker ? (
                <div className="mb-2 sm:mb-4">
                  <label className="text-gray-700 mb-1 block text-sm font-medium sm:mb-2">
                    Assign to Broker <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`${user?.fullname || 'Super Broker'} (Current User)`}
                    className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 p-2 font-semibold text-slate-500"
                  />
                </div>
              ) : (
                <GenericDropdown
                  name="BrokerId"
                  label="Assign to Broker"
                  required
                  placeholder="Search Broker by Name or BK ID"
                  options={brokerOptions}
                  searchable={true}
                />
              )}

              {/* Customer Type - Required */}
              <div className="mb-2 sm:mb-4">
                <label className="mb-2.5 block text-black dark:text-white">
                  Trader Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={methods.watch('type')}
                  onChange={(e) => methods.setValue('type', e.target.value)}
                  className={`flex w-full cursor-pointer items-center rounded border-[1.7px] bg-transparent px-3 py-1 text-black outline-none transition ${methods.formState.errors.type ? 'border-red-500' : 'border-stroke'
                    } focus-within:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus-within:border-primary`}
                >
                  <option value="">Select Trader Type</option>
                  <option value="mega">Mega</option>
                  <option value="mini">Mini</option>
                </select>
                {methods.formState.errors.type && (
                  <p className="mt-1 text-xs text-red-500">
                    {methods.formState.errors.type.message}
                  </p>
                )}
              </div>

              {/* Area - Required */}
              <GenericInputField
                name="area"
                label="Area"
                required
                placeholder="Enter area"
              />

              {/* ===== OPTIONAL FIELDS BELOW ===== */}

              {/* Stock Holding Limit - with min suffix */}
              <div className="mb-3 mt-1.5 sm:mb-4">
                <label className="mb-2.5 block text-black dark:text-white">
                  Minimum Stock Holding time (in minute)
                </label>
                <div className="relative">
                  <GenericInputField
                    name="stockHoldingLimit"
                    type="text"
                    placeholder="Enter time in minutes"
                    onChange={handleStockHoldingChange}
                    maxLength={3}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
                    min
                  </span>
                </div>
                {methods.formState.errors.stockHoldingLimit && (
                  <p className="mt-1 text-xs text-red-500">
                    {methods.formState.errors.stockHoldingLimit.message}
                  </p>
                )}
              </div>

              {/* Wallet Balance */}
              <GenericInputField
                name="walletBalance"
                label="Wallet Balance"
                type="number"
                step="0.01"
                placeholder="Enter wallet balance"
              />

              {/* Intraday Leverage - with X suffix and dynamic message */}
              <div className="mb-2 sm:mb-4">
                <label className="mb-2.5 block text-black dark:text-white">
                  Intraday Margin
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="intradayLeverage"
                    value={methods.watch('intradayLeverage') ? `${methods.watch('intradayLeverage')}X` : ''}
                    onChange={handleIntradayChange}
                    className={`w-full rounded border-[1.7px] bg-transparent px-3 py-1 text-black outline-none transition ${methods.formState.errors.intradayLeverage ? 'border-red-500' : 'border-stroke'
                      }`}
                    placeholder="Enter intraday leverage"
                  />
                </div>
                {methods.formState.errors.intradayLeverage && (
                  <p className="mt-1 text-xs text-red-500">
                    {methods.formState.errors.intradayLeverage.message}
                  </p>
                )}
                {/* Dynamic Calculation Message - Static 1 Crore */}
                {intradayLeverage > 0 && (
                  <div className="mt-1 px-4 py-3 ">
                    <p className="text-sm text-gray-700 font-semibold ">
                      {formatIndianCurrency(STATIC_WALLET_BALANCE)} × {intradayLeverage}X = <strong>{formatIndianCurrency(maxIntradayTrade)}</strong>
                    </p>
                  </div>
                )}
              </div>

              {/* Delivery Leverage - with X suffix and dynamic message */}
              <div className="mb-2 sm:mb-4">
                <label className="mb-2.5 block text-black dark:text-white">
                  Delivery Margin
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="deliveryLeverage"
                    value={methods.watch('deliveryLeverage') ? `${methods.watch('deliveryLeverage')}X` : ''}
                    onChange={handleDeliveryChange}
                    className={`w-full rounded border-[1.7px] bg-transparent px-3 py-1 text-black outline-none transition ${methods.formState.errors.deliveryLeverage ? 'border-red-500' : 'border-stroke'
                      } focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
                    placeholder="Enter delivery leverage"
                  />
                </div>
                {methods.formState.errors.deliveryLeverage && (
                  <p className="mt-1 text-xs text-red-500">
                    {methods.formState.errors.deliveryLeverage.message}
                  </p>
                )}
                {/* Dynamic Calculation Message - Static 1 Crore */}
                {deliveryLeverage > 0 && (
                  <div className="mt-1 px-4 py-3 ">
                    <p className="text-sm text-gray-700 font-semibold">
                      {formatIndianCurrency(STATIC_WALLET_BALANCE)} × {deliveryLeverage}X = <strong>{formatIndianCurrency(maxDeliveryTrade)}</strong>
                    </p>
                  </div>
                )}
              </div>

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

              {/* Demo Account Toggle */}
              <div className="col-span-1 sm:col-span-2">
                <div className="flex items-center gap-3">
                  <input
                    id="isDemo"
                    type="checkbox"
                    checked={methods.watch('isDemo')}
                    onChange={(e) => methods.setValue('isDemo', e.target.checked)}
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

export default CompanyAddCustomer;