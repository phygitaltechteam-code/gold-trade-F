import React, { useEffect } from 'react';
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
  // useEffect(() => {
  // }, [tradingLedgerData]);
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm md:p-6">
      <div className="mb-4 flex flex-wrap border-b border-slate-100 md:mb-6">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-3 py-2 text-xs font-semibold transition-colors md:px-4 md:py-3 md:text-sm ${
            activeTab === 'ledger'
              ? 'border-b-2 border-orange-500 text-orange-500'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Client Ledger ({tradingLedgerData.length})
        </button>
        {/* <button
          onClick={() => setActiveTab('payment')}
          className={`px-3 py-2 text-xs font-semibold transition-colors md:px-4 md:py-3 md:text-sm ${
            activeTab === 'payment'
              ? 'border-b-2 border-orange-500 text-orange-500'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Payment History
        </button> */}
        <button
          onClick={() => setActiveTab('payment')}
          className={`px-3 py-2 text-xs font-semibold transition-colors md:px-4 md:py-3 md:text-sm ${
            activeTab === 'tradingledger'
              ? 'border-b-2 border-orange-500 text-orange-500'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Payment History ({paymentData.length})
        </button>
      </div>

      {activeTab === 'ledger' && (
        <div className="overflow-x-auto">
          <GenericTable columns={ledgerColumns} data={tradingLedgerData} isSearchable={true} />
        </div>
      )}

      {/* {activeTab === 'payment' && (
        <div className="overflow-x-auto">
          <GenericTable
            columns={paymentColumns}
            data={[]}
            isSearchable={true}
          />
        </div>
      )} */}

      {activeTab === 'payment' && (
        <div className="overflow-x-auto">
          {tradingLedgerData.length > 0 ? (
            <GenericTable
              data={paymentData}
              columns={tradingLedgerColumns}
              isSearchable={true}
            />
          ) : (
            <div className="flex h-64 items-center justify-center">
              <p className="text-slate-400">No trading ledger entries found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
