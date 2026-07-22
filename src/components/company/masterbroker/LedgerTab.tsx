import React, { useState } from 'react';
import GenericTable from '@/components/Forms/Table/GenericTable';
import { RefreshCcw } from 'lucide-react';

interface LedgerTabProps {
  ledgerStartDate: string;
  setLedgerStartDate: (val: string) => void;
  ledgerEndDate: string;
  setLedgerEndDate: (val: string) => void;
  isLedgerExpanded: boolean;
  setIsLedgerExpanded: (val: boolean) => void;
  filteredLedgerData: any[];
  ledgerColumns: any[];
  refetchLedger: () => void;
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
  refetchLedger,
}) => {

  const [statusFilter, setStatusFilter] = useState('')

  const filterData = () => {
    console.log("filteredLedgerData", filteredLedgerData)
    let filteredData = [...filteredLedgerData];

    if (statusFilter) {
      filteredData = filteredData?.filter((item: any) => {
        const itemStatus = item.status?.toUpperCase() || '';
        const filterVal = statusFilter.toUpperCase();
        if (filterVal === 'CLOSE' || filterVal === 'CLOSED') {
          return itemStatus === 'CLOSE' || itemStatus === 'CLOSED';
        }
        return itemStatus === filterVal;
      });
    }
    return filteredData
  }
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
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-black dark:text-white">
              Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded border border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
            >
              <option value="">All</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
            </select>
            <button
              onClick={() => refetchLedger()}
              className="rounded bg-orange-500 flex px-1 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 mr-2"
            >
              <RefreshCcw size={16} /> Refresh
            </button>
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
        data={filterData()}
        columns={ledgerColumns}
        rowsPerPage={25}
      />
    </div>
  );
};
