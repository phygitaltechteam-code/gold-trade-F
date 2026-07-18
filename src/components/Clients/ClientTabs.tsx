import React, { useState, useMemo } from 'react';
import GenericTable from '@/components/Forms/Table/GenericTable';

interface ClientTabsProps {
  activeTab: string;
  setActiveTab: (val: string) => void;
  tradingLedgerData: any[];
  paymentData:any[],
  ledgerColumns: any[];
  tradingLedgerColumns: any[];
}

export const ClientTabs: React.FC<ClientTabsProps> = ({
  activeTab,
  setActiveTab,
  tradingLedgerData,
  paymentData,
  ledgerColumns,
  tradingLedgerColumns,
}) => {
  const [statusFilter, setStatusFilter] = useState('');

  const filteredLedgerData = useMemo(() => {
    if (!statusFilter) return tradingLedgerData;
    return tradingLedgerData.filter((item: any) => {
      const itemStatus = item.status?.toUpperCase() || '';
      const filterVal = statusFilter.toUpperCase();
      if (filterVal === 'CLOSE' || filterVal === 'CLOSED') {
        return itemStatus === 'CLOSE' || itemStatus === 'CLOSED';
      }
      return itemStatus === filterVal;
    });
  }, [tradingLedgerData, statusFilter]);

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm md:p-6">
      <div className="mb-4 flex flex-wrap border-b border-slate-100 md:mb-6 justify-between items-center">
        <div className="flex flex-wrap">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-3 py-2 text-xs font-semibold transition-colors md:px-4 md:py-3 md:text-sm ${
              activeTab === 'ledger'
                ? 'border-b-2'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Trader Ledger ({filteredLedgerData.length})
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`px-3 py-2 text-xs font-semibold transition-colors md:px-4 md:py-3 md:text-sm ${
              activeTab === 'payment'
                ? 'border-b-2 '
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Payment History ({paymentData.length})
          </button>
        </div>

        {activeTab === 'ledger' && (
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-stroke bg-transparent px-4 py-2 text-sm outline-none focus:border-orange-500"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        )}
      </div>

      {activeTab === 'ledger' && (
        <div className="overflow-x-auto">
          <GenericTable columns={ledgerColumns} data={filteredLedgerData} isSearchable={true} />
        </div>
      )}

      {activeTab === 'payment' && (
        <div className="overflow-x-auto">
          {paymentData.length > 0 ? (
            <GenericTable
              data={paymentData}
              columns={tradingLedgerColumns}
              isSearchable={true}
            />
          ) : (
             <div className="flex h-64 items-center justify-center">
              <p className="text-slate-400">No payment entries found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
