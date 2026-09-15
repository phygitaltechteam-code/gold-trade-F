import React from 'react';
import { FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { Eye, EyeOff } from 'lucide-react';

interface EditData {
  fullname: string;
  phoneNumber: string;
  commission: string;
  area: string;
  aadharCardNumber: string;
  customerLimit?: string;
  password?: string;
  allowSlipage?: boolean;
}

interface MasterBrokerProfileInfoProps {
  profileData: any;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  editData: EditData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSave: () => void;
  handleCancel: () => void;
  isUpdating: boolean;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  editErrors?: {
    phoneNumber: string;
    aadharCardNumber: string;
  };
}

export const MasterBrokerProfileInfo: React.FC<MasterBrokerProfileInfoProps> = ({
  profileData,
  isEditing,
  setIsEditing,
  editData,
  handleInputChange,
  handleSave,
  handleCancel,
  isUpdating,
  showPassword,
  setShowPassword,
  editErrors,
}) => {
  return (
    <div className="mb-6 rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex flex-wrap items-center justify-between rounded-t-lg border-b border-stroke bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 md:px-6 md:py-4">
        <h2 className="text-lg font-semibold text-white md:text-xl">
          Master Broker Profile
        </h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="hover:bg-gray-100 flex items-center gap-2 rounded bg-white px-3 py-1.5 text-sm font-medium text-orange-500 transition-colors md:px-4 md:py-2"
          >
            <FiEdit2 className="h-3 w-3 md:h-4 md:w-4" /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="hover:bg-gray-100 flex items-center gap-2 rounded bg-white px-3 py-1.5 text-sm font-medium text-red-500 transition-colors md:px-4 md:py-2"
            >
              <FiX className="h-3 w-3 md:h-4 md:w-4" /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isUpdating}
              className="hover:bg-gray-100 flex items-center gap-2 rounded bg-white px-3 py-1.5 text-sm font-medium text-orange-500 transition-colors disabled:opacity-50 md:px-4 md:py-2"
            >
              <FiSave className="h-3 w-3 md:h-4 md:w-4" />{' '}
              {isUpdating ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {/* Full Name */}
          <div>
            <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="fullname"
                value={editData.fullname}
                onChange={handleInputChange}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-4 md:py-2"
              />
            ) : (
              <p className="text-sm text-black dark:text-white md:text-base">
                {profileData?.fullname || 'N/A'}
              </p>
            )}
          </div>

          {/* Allow Slippage Checkbox */}
          <div>
            <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
              Allow Slippage Settings
            </label>
            {isEditing ? (
              <div className="flex items-center gap-3 py-1.5 md:py-2">
                <input
                  type="checkbox"
                  id="allowSlipage"
                  name="allowSlipage"
                  checked={!!editData.allowSlipage}
                  onChange={handleInputChange}
                  className="h-4 w-4 cursor-pointer accent-orange-500"
                />
                <label
                  htmlFor="allowSlipage"
                  className="cursor-pointer text-sm font-medium text-black dark:text-white"
                >
                  Allow Slippage
                </label>
              </div>
            ) : (
              <div className="flex items-center gap-2 py-1.5 md:py-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    profileData?.allowSlipage
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}
                >
                  {profileData?.allowSlipage ? 'Allowed' : 'Not Allowed'}
                </span>
              </div>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                name="phoneNumber"
                value={editData.phoneNumber}
                onChange={handleInputChange}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-4 md:py-2"
              />
            ) : (
              <p className="text-sm text-black dark:text-white md:text-base">
                {profileData?.phoneNumber || 'N/A'}
              </p>
            )}
          </div>

          {/* Email */}
          {/* <div>
            <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
              Email
            </label>
            <p className="text-sm text-black dark:text-white md:text-base">
              {profileData?.email || 'N/A'}
            </p>
          </div> */}

          {/* Aadhar Number */}
          <div>
            <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
              Aadhar Number
            </label>
            {isEditing ? (
              <input
                type="text"
                name="aadharCardNumber"
                value={editData.aadharCardNumber}
                onChange={handleInputChange}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-4 md:py-2"
              />
            ) : (
              <p className="text-sm text-black dark:text-white md:text-base">
                {profileData?.aadharCardNumber || 'N/A'}
              </p>
            )}
          </div>

          {/* Commission % */}
          <div>
            <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
              Commission (%)
            </label>
            {isEditing ? (
              <input
                type="number"
                step="0.01"
                name="commission"
                value={editData.commission}
                onChange={handleInputChange}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-4 md:py-2"
              />
            ) : (
              <p className="text-sm font-semibold text-orange-600 dark:text-white md:text-base">
                {profileData?.commission || '0'}%
              </p>
            )}
          </div>

          {/* Customer Limit */}
          <div>
            <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
              Trader Limit
            </label>
            {isEditing ? (
              <input
                type="number"
                name="customerLimit"
                value={editData.customerLimit || ''}
                onChange={handleInputChange}
                placeholder="Enter customer limit"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-4 md:py-2"
              />
            ) : (
              <p className="text-sm text-black dark:text-white md:text-base">
                {profileData?.customerLimit || profileData?.customer_limit || 0}
              </p>
            )}
          </div>

          {/* Area */}
          <div>
            <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
              Area
            </label>
            {isEditing ? (
              <input
                type="text"
                name="area"
                value={editData.area}
                onChange={handleInputChange}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-4 md:py-2"
              />
            ) : (
              <p className="text-sm text-black dark:text-white md:text-base">
                {profileData?.area || 'N/A'}
              </p>
            )}
          </div>

          {/* Total Brokers */}
          {/* <div>
            <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
              Total Brokers
            </label>
            <p className="text-sm text-black dark:text-white md:text-base">
              {profileData?.brokers?.length || 0}
            </p>
          </div> */}

          {/* Password Field - Only visible in edit mode */}
          {isEditing && (
            <div>
              <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter new password"
                  value={editData.password || ''}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 pr-10 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-4 md:py-2"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-500 hover:text-gray-700 absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};