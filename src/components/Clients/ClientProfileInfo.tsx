import React from 'react';
import { FiEdit2, FiSave, FiX } from 'react-icons/fi';

interface EditData {
  fullname: string;
  phoneNumber: string;
  aadharCardNumber: string;
  brokeragePercent: string;
  address: string;
  password?: string;
  panCardNumber: string;
  stockHoldingLimit: number
  type: string;
}

interface ClientProfileInfoProps {
  displayClient: any;
  isEditing: boolean;
  editData: EditData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSave: () => void;
  handleCancel: () => void;
  handleEditClick: () => void;
  fullName: string;
  phone: string;
  aadharNumber: string;
  panCardNumber: string;
  type: string;
  stockHoldingLimit: number
}

export const ClientProfileInfo: React.FC<ClientProfileInfoProps> = ({
  displayClient,
  isEditing,
  editData,
  handleInputChange,

  handleSave,
  handleCancel,
  handleEditClick,
  fullName,
  phone,
  aadharNumber,
  stockHoldingLimit,
  panCardNumber,
  type,
}) => {


  console.log("editData", editData?.stockHoldingLimit, "stockHoldingLimit")
  console.log("edit data ", editData)
  return (
    <div className="rounded-lg border border-stroke  shadow-default dark:border-strokedark dark:bg-boxdark bg-[#f8fafc]">
      <div className="flex flex-wrap items-center justify-between rounded-t-lg border-b border-stroke bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 md:px-6 md:py-4">
        <h2 className="text-lg font-semibold text-white md:text-xl">
          Trader Profile
        </h2>
        {!isEditing ? (
          <button
            onClick={handleEditClick}
            className="hover:bg-gray-100 flex items-center gap-2 rounded bg-white px-3 py-1.5 text-sm font-medium text-orange-500 transition-colors md:px-4 md:py-2"
          >
            <FiEdit2 className="h-3 w-3 md:h-4 md:w-4" /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 rounded bg-red-100 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-200 md:px-4 md:py-2"
            >
              <FiX className="h-3 w-3 md:h-4 md:w-4" /> Cancel
            </button>
            <button
              onClick={handleSave}
              className="hover:bg-gray-100 flex items-center gap-2 rounded bg-white px-3 py-1.5 text-sm font-medium text-orange-500 transition-colors md:px-4 md:py-2"
            >
              <FiSave className="h-3 w-3 md:h-4 md:w-4" /> Save
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
                {fullName}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="text"
                name="phoneNumber"
                value={editData.phoneNumber}
                onChange={handleInputChange}
                maxLength={10}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-4 md:py-2"
              />
            ) : (
              <p className="text-sm text-black dark:text-white md:text-base">
                {phone}
              </p>
            )}
          </div>

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
                maxLength={12}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-4 md:py-2"
                placeholder="Enter 12-digit Aadhar number"
              />
            ) : (
              <p className="text-sm text-black dark:text-white md:text-base">
                {aadharNumber}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
              Password
            </label>
            {isEditing ? (
              <input
                type="password"
                name="password"
                value={editData.password || ''}
                onChange={handleInputChange}
                placeholder="Enter new password"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-4 md:py-2"
              />
            ) : (
              <p className="text-sm text-black dark:text-white md:text-base">
                ••••••••
              </p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
              Area
            </label>
            {isEditing ? (
              <input
                type="text"
                name="address"
                value={editData.address}
                onChange={handleInputChange}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-4 md:py-2"
              />
            ) : (
              <p className="text-sm text-black dark:text-white md:text-base">
                {displayClient?.address || 'N/A'}
              </p>
            )}
          </div>

          {/* Pincode
          <div>
            <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
              Pincode
            </label>
            <p className="text-sm text-black dark:text-white md:text-base">
              {displayClient?.pincode || 'N/A'}
            </p>
          </div> */}
          <div>
            <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
              Pancard
            </label>
            {isEditing ? (
              <input
                type="text"
                name="panCardNumber"
                value={editData.panCardNumber}
                onChange={handleInputChange}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-4 md:py-2"
              />
            ) : (
              <p className="text-sm text-black dark:text-white md:text-base">
                {displayClient?.panCardNumber || 'N/A'}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
              Minimum Stock Holding time(in minute)
            </label>
            {isEditing ? (
              <input
                type="number"
                name="stockHoldingLimit"
                value={editData?.stockHoldingLimit ?? ''}
                onChange={handleInputChange}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-4 md:py-2"
              />
            ) : (
              <p className="text-sm text-black dark:text-white md:text-base">
                {stockHoldingLimit !== undefined ? stockHoldingLimit : 'N/A'}
              </p>
            )}
          </div>



          <div>
            <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
              Customer Type <span className="text-red-500">*</span>
            </label>
            {isEditing ? (
              <select
                name="type"
                value={editData.type || ''}
                onChange={handleInputChange}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-4 md:py-2"
              >
                <option value="mega">Mega</option>
                <option value="mini">Mini</option>
              </select>
            ) : (
              <p className="text-sm text-black dark:text-white md:text-base">
                {displayClient?.type || 'N/A'}
              </p>
            )}
          </div>





        </div>
      </div>
    </div>
  );
};
