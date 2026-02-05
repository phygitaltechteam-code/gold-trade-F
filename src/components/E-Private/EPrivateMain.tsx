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
    <div className="font-sans flex min-h-screen justify-center bg-slate-100">
      <div className="bg-background-light relative h-full min-h-screen w-full max-w-md overflow-hidden shadow-2xl">
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
