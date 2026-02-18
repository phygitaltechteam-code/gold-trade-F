import React, {useState} from 'react';
import AccountScreen from './AccountScreen';
import StatementsScreen from './StatementsScreen';
import {useGetAllTransaction} from './accountmutation';
import {TransactionResponse} from './type';

const EPrivateMain: React.FC = () => {
  const {data, isLoading, error} = useGetAllTransaction();

  const transactions = data?.transactions || [];

  const wallet = data?.wallet || {};

  console.log('TRANSACTION', transactions);
  console.log('WALLET', wallet);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-gray-50 flex min-h-screen items-start justify-center pt-0">
      <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-white shadow-2xl md:rounded-3xl">
        <AccountScreen
          transactions={transactions}
          wallet={wallet}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
};

export default EPrivateMain;
