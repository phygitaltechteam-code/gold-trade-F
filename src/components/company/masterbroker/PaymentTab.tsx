import React from 'react';
import GenericTable from '@/components/Forms/Table/GenericTable';

interface PaymentTabProps {
  paymentStartDate: string;
  setPaymentStartDate: (val: string) => void;
  paymentEndDate: string;
  setPaymentEndDate: (val: string) => void;
  filteredPaymentData: any[];
  paymentColumns: any[];
  getCurrentWeekRange: () => { startDate: string; endDate: string };
}

export const PaymentTab: React.FC<PaymentTabProps> = ({
  paymentStartDate,
  setPaymentStartDate,
  paymentEndDate,
  setPaymentEndDate,
  filteredPaymentData,
  paymentColumns,
  getCurrentWeekRange,
}) => {
  return (
    <div className="overflow-x-auto">
      <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h3 className="text-base font-semibold text-black dark:text-white md:text-lg">
          Payment History
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-black dark:text-white md:text-sm">
              From :
            </label>
            <input
              type="date"
              value={paymentStartDate}
              onChange={(e) => setPaymentStartDate(e.target.value)}
              className="rounded border border-stroke bg-transparent px-2 py-1 text-xs outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-3 md:py-1 md:text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-black dark:text-white md:text-sm">
              To :
            </label>
            <input
              type="date"
              value={paymentEndDate}
              onChange={(e) => setPaymentEndDate(e.target.value)}
              className="rounded border border-stroke bg-transparent px-2 py-1 text-xs outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-3 md:py-1 md:text-sm"
            />
          </div>
          {(paymentStartDate || paymentEndDate) && (
            <button
              onClick={() => {
                const { startDate, endDate } = getCurrentWeekRange();
                setPaymentStartDate(startDate);
                setPaymentEndDate(endDate);
              }}
              className="bg-gray-200 text-gray-700 hover:bg-gray-300 rounded px-2 py-1 text-xs font-medium transition-colors dark:bg-meta-4 dark:text-white dark:hover:bg-meta-3 md:px-3 md:py-1.5 md:text-sm"
            >
              This Week
            </button>
          )}
        </div>
      </div>
      <GenericTable
        data={filteredPaymentData}
        columns={paymentColumns}
        paginationOff={true}
      />
    </div>
  );
};
