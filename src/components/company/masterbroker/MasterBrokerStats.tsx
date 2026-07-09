import React from 'react';

interface MasterBrokerStatsProps {
  profileData: any;
}

export const MasterBrokerStats: React.FC<MasterBrokerStatsProps> = ({ profileData }) => {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
      {/* Total Business */}
      <div className="flex flex-col items-center justify-center rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark md:p-6">
        <h4 className="text-xl font-bold text-black dark:text-white md:text-2xl">
          ₹{profileData?.totalBusiness?.toLocaleString() || '0'}
        </h4>
        <span className="text-gray-500 mt-1 text-xs font-medium sm:text-sm">
          Total Business
        </span>
      </div>

      {/* Total Commission */}
      <div className="flex flex-col items-center justify-center rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark md:p-6">
        <h4 className="text-xl font-bold text-green-500 md:text-2xl">
          ₹{profileData?.totalCommission?.toLocaleString() || '0'}
        </h4>
        <span className="text-gray-500 mt-1 text-xs font-medium sm:text-sm">
          Total Commission
        </span>
      </div>

      {/* Pending Commission */}
      <div className="flex flex-col items-center justify-center rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark md:p-6">
        <h4 className="text-xl font-bold text-orange-500 md:text-2xl">
          ₹{profileData?.pendingCommission?.toLocaleString() || '0'}
        </h4>
        <span className="text-gray-500 mt-1 text-xs font-medium sm:text-sm">
          Pending Commission
        </span>
      </div>

      {/* Total Brokers */}
      <div className="flex flex-col items-center justify-center rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark md:p-6">
        <h4 className="text-xl font-bold text-blue-500 md:text-2xl">
          {profileData?.brokers?.length || 0}
        </h4>
        <span className="text-gray-500 mt-1 text-xs font-medium sm:text-sm">
          Total Brokers
        </span>
      </div>
    </div>
  );
};
