import React from 'react';
import GenericTable from '@/components/Forms/Table/GenericTable';

interface LedgerTabProps {
  ledgerStartDate: string;
  setLedgerStartDate: (val: string) => void;
  ledgerEndDate: string;
  setLedgerEndDate: (val: string) => void;
  isLedgerExpanded: boolean;
  setIsLedgerExpanded: (val: boolean) => void;
  filteredLedgerData: any[];
  ledgerColumns: any[];
}

export const LedgerTab: React.FC<LedgerTabProps> = ({
  ledgerStartDate,
  setLedgerStartDate,
  ledgerEndDate,
  setLedgerEndDate,
  isLedgerExpanded,
  setIsLedgerExpanded,
  filteredLedgerData,
  ledgerColumns,
}) => {
  return (
    <div className="overflow-x-auto">
      <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h3 className="text-base font-semibold text-black dark:text-white md:text-lg">
          Ledger Records
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-black dark:text-white md:text-sm">
              From :
            </label>
            <input
              type="date"
              value={ledgerStartDate}
              onChange={(e) => setLedgerStartDate(e.target.value)}
              className="rounded border border-stroke bg-transparent px-2 py-1 text-xs outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-3 md:py-1 md:text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-black dark:text-white md:text-sm">
              To :
            </label>
            <input
              type="date"
              value={ledgerEndDate}
              onChange={(e) => setLedgerEndDate(e.target.value)}
              className="rounded border border-stroke bg-transparent px-2 py-1 text-xs outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-3 md:py-1 md:text-sm"
            />
          </div>
          {/* <button
            onClick={() => setIsLedgerExpanded(!isLedgerExpanded)}
            className="rounded bg-orange-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-orange-600 md:px-4 md:py-2 md:text-sm"
          >
            {isLedgerExpanded ? 'View Less' : 'View More'}
          </button> */}
        </div>
      </div>
      <GenericTable
        data={filteredLedgerData}
        columns={ledgerColumns}
        rowsPerPage={25}
      />
    </div>
  );
};
