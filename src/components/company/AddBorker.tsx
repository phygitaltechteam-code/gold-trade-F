import { useAddBroker } from '@/lib/api/addbroker';
import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { useAuthContext } from '@/context/AuthContext';

// Define Zod schema for form data validation
const BrokerSchema = z.object({
  fullname: z.string().min(1, 'Full name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  superBrokerId: z.string().min(1, 'Please select a Super Broker'),
});

const AddBroker = () => {
  const navigate = useNavigate();
  const addbroker = useAddBroker();
  const { user } = useAuthContext();
  const isSuperBroker = user?.role === 'SUPERBROKER';
  
  const [formData, setFormData] = useState({
    fullname: '',
    password: '',
    area: '',
    commission: '',
    phoneNumber: '',
    aadharCardNumber: '',
    superBrokerId: '',
  });

  useEffect(() => {
    if (isSuperBroker && user) {
      setFormData((prev) => ({
        ...prev,
        superBrokerId: user.id || 'mock-dev-id-999',
      }));
    }
  }, [isSuperBroker, user]);

  const [images, setImages] = useState({
    aadharCardF: null,
  });

  const [imagePreviews, setImagePreviews] = useState({
    aadharCardF: null,
  });

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
    { id: '4', SBID: 'SB-1004', fullname: 'Neha Gupta' }
  ];

  const filteredSuperBrokers = mockSuperBrokers.filter(
    (sb) =>
      sb.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sb.SBID.toLowerCase().includes(searchTerm.toLowerCase())
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

  const validateForm = () => {
    try {
      BrokerSchema.parse(formData);

      const imageErrors = {};
   
      if (Object.keys(imageErrors).length > 0) {
        setErrors(imageErrors);
        const firstError = Object.values(imageErrors)[0];
        toast.error(firstError);
        return false;
      }

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
      commission: '',
      phoneNumber: '',
      aadharCardNumber: '',
      superBrokerId: '',
    });
    setImages({
      aadharCardF: null,
    });
    setImagePreviews({
      aadharCardF: null,
    });
    setErrors({});
    setSearchTerm('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const formDataToSend = new FormData();
    formDataToSend.append('fullname', formData.fullname);
    formDataToSend.append('password', formData.password);
    formDataToSend.append('phoneNumber', formData.phoneNumber);
    formDataToSend.append('aadharCardNumber', formData.aadharCardNumber);
    formDataToSend.append('aadharCardF', images.aadharCardF);
    formDataToSend.append('commission', formData.commission);
    formDataToSend.append('area', formData.area);
    formDataToSend.append('superBrokerId', formData.superBrokerId);

    try {
      await addbroker.mutateAsync(formDataToSend);
      resetForm();
      toast.success('Broker registered successfully!');
      navigate({ to: isSuperBroker ? '/superbroker/brokerlist' : '/companybroker/displaybroker' });
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
                Broker Registration
              </h1>
              <p className="mt-1 text-orange-100">
                Please fill in all the required information
              </p>
            </div>
            <button
              onClick={() => navigate({ to: isSuperBroker ? '/superbroker/brokerlist' : '/companybroker/displaybroker' })}
              className="hover:bg-gray-100 rounded-lg bg-white px-4 py-2 text-orange-500 transition-all"
            >
              Back to List
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Full Name */}
            <div className="mb-4">
              <label className="text-gray-700 mb-2 block text-sm font-medium">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleInputChange}
                className={`w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.fullname ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter full name"
              />
              {errors.fullname && (
                <p className="mt-1 text-xs text-red-500">{errors.fullname}</p>
              )}
            </div>

            {/* Phone number */}
            <div className="mb-4">
              <label className="text-gray-700 mb-2 block text-sm font-medium">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                maxLength={10}
                className={`w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
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
            <div className="mb-4">
              <label className="text-gray-700 mb-2 block text-sm font-medium">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter password (min 6 characters)"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Searchable Super Broker Dropdown or locked role input */}
            <div className="mb-4 relative">
              <label className="text-gray-700 mb-2 block text-sm font-medium">
                Assign to Super Broker <span className="text-red-500">*</span>
              </label>
              {isSuperBroker ? (
                <input
                  type="text"
                  disabled
                  value={`${user?.fullname || 'Mock Super Broker'} (Super Broker)`}
                  className="w-full rounded-lg border border-slate-200 bg-slate-100 p-2 text-slate-500 font-semibold cursor-not-allowed"
                />
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search Super Broker by Name or ID"
                    value={
                      isDropdownOpen
                        ? searchTerm
                        : mockSuperBrokers.find((sb) => sb.id === formData.superBrokerId)
                          ? `${mockSuperBrokers.find((sb) => sb.id === formData.superBrokerId)?.fullname} (${mockSuperBrokers.find((sb) => sb.id === formData.superBrokerId)?.SBID})`
                          : ''
                    }
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => {
                      setIsDropdownOpen(true);
                      setSearchTerm(''); // clear search when opening to see all options
                    }}
                    onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                    className={`w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.superBrokerId ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  
                  {isDropdownOpen && (
                    <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                      {filteredSuperBrokers.length > 0 ? (
                        filteredSuperBrokers.map((sb) => (
                          <div
                            key={sb.id}
                            className="cursor-pointer px-4 py-2 hover:bg-orange-50"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, superBrokerId: sb.id }));
                              setSearchTerm('');
                              setIsDropdownOpen(false);
                              if (errors.superBrokerId) {
                                setErrors((prev) => ({ ...prev, superBrokerId: '' }));
                              }
                            }}
                          >
                            <div className="font-medium text-gray-900">{sb.fullname}</div>
                            <div className="text-xs text-gray-500">{sb.SBID}</div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-sm text-gray-500">No Super Brokers found</div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {errors.superBrokerId && !isSuperBroker && (
                <p className="mt-1 text-xs text-red-500">{errors.superBrokerId}</p>
              )}
            </div>

            {/* Aadhar Card Number */}
            <div className="mb-4">
              <label className="text-gray-700 mb-2 block text-sm font-medium">
                Aadhar Card Number 
              </label>
              <input
                type="text"
                name="aadharCardNumber"
                value={formData.aadharCardNumber}
                onChange={handleInputChange}
                maxLength={12}
                className={`w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.aadharCardNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter 12-digit Aadhar number"
              />
              {errors.aadharCardNumber && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.aadharCardNumber}
                </p>
              )}
            </div>

            {/* Area */}
            <div className="mb-4">
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
              {errors.area && (
                <p className="mt-1 text-xs text-red-500">{errors.area}</p>
              )}
            </div>

             <div className="mb-4">
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
              {errors.commission && (
                <p className="mt-1 text-xs text-red-500">{errors.commission}</p>
              )}
            </div>
          </div>

          {/* Image Uploads Section */}
          <div className="border-gray-200 mt-6 border-t pt-6">
            <h2 className="text-gray-800 mb-4 text-lg font-semibold">
              Document Upload
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <ImageUploadField
                label="Aadhar Card Front"
                field="aadharCardF"
                required
              />
            </div>
          </div>

          {/* Review Section */}
          {(imagePreviews.aadharCardF) && (
              <div className="bg-gray-50 mt-6 rounded-lg p-4">
                <h3 className="text-md text-gray-800 mb-3 font-semibold">
                  Review Uploaded Images
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {imagePreviews.aadharCardF && (
                    <div>
                      <p className="text-gray-600 mb-1 text-sm">
                        Aadhar Card Front:
                      </p>
                      <img
                        src={imagePreviews.aadharCardF}
                        alt="Aadhar Front"
                        className="h-24 w-24 rounded-lg object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Submit Button */}
          <div className="mt-6 flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting || addbroker.isPending}
              className="flex-1 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-white transition-all hover:from-orange-600 hover:to-red-600 disabled:opacity-50"
            >
              {isSubmitting || addbroker.isPending
                ? 'Submitting...'
                : 'Register Broker'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg border px-4 py-2 transition-all"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBroker;
