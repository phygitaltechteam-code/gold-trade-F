import ProcessingScreen from '@/components/Wallet/ProcessingScreen';
import {createFileRoute} from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/_app/wallet/processing')({
  component: RouteComponent,
});

function RouteComponent() {
  return <ProcessingScreen />;
}
