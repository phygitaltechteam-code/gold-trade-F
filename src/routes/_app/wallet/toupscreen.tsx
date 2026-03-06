import TopUpScreen from '@/components/Wallet/TopUpScreen';
import WalletFlow from '@/components/Wallet/WalletFlow';
import {createFileRoute} from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/_app/wallet/toupscreen')({
  component: RouteComponent,
});

function RouteComponent() {
  // return <TopUpScreen />;
  return <WalletFlow />;
}
