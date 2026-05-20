import SuperBrokerPaymentHistory from '@/components/SuperBroker/SuperBrokerPaymentHistory';
import {createFileRoute} from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/_app/superbroker/paymenthistory')({
  component: RouteComponent,
});

function RouteComponent() {
  return <SuperBrokerPaymentHistory />;
}
