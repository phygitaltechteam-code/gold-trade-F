import BrokerPaymentHistory from '@/components/Broker/BrokerPaymentHistory';
import {createFileRoute} from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/_app/broker/paymenthistory')({
  component: RouteComponent,
});

function RouteComponent() {
  return <BrokerPaymentHistory />;
}
