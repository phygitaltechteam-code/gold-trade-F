import SuperBrokerCommissionHistory from '@/components/SuperBroker/SuperBrokerCommissionHistory';
import {createFileRoute} from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/_app/superbroker/commissionhistory')({
  component: RouteComponent,
});

function RouteComponent() {
  return <SuperBrokerCommissionHistory />;
}
