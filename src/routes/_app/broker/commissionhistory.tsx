import BrokerCommissionHistory from '@/components/Broker/BrokerCommissionHistory';
import {createFileRoute} from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/_app/broker/commissionhistory')({
  component: RouteComponent,
});

function RouteComponent() {
  return <BrokerCommissionHistory />;
}
