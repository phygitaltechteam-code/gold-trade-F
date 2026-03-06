import PinScreen from '@/components/Wallet/PinScreen';
import {createFileRoute} from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/_app/wallet/pin')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PinScreen onPinSubmit={() => {}} />;
}
