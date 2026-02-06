// EPrivateMain.tsx
import React, {useState} from 'react';
import AccountScreen from './AccountScreen';
import StatementsScreen from './StatementsScreen';
import {useCustomReport, useGetAllTransaction} from './accountmutation';
import {TransactionResponse} from './type';

const EPrivateMain: React.FC = () => {
  const [currentView, setCurrentView] = useState<'account' | 'statements'>(
    'account',
  );
  const {data, isLoading, error} = useGetAllTransaction();
  const getreport = useCustomReport();

  const transactionData = data as TransactionResponse | undefined;
  const transactions = transactionData?.transactions || [];
  const wallet = transactionData?.wallet;

  return (
    <div className="bg-gray-50 flex min-h-screen items-start justify-center pt-0">
      <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-white shadow-2xl md:rounded-3xl">
        {currentView === 'account' ? (
          <AccountScreen
            onNavigate={setCurrentView}
            transactions={transactions}
            wallet={wallet}
            isLoading={isLoading}
            error={error}
          />
        ) : (
          <StatementsScreen transactions={transactions} />
        )}
      </div>
    </div>
  );
};

export default EPrivateMain;
